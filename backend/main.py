import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

# Import LangChain AI tools
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from ddgs import DDGS

load_dotenv()

app = FastAPI(title="AI Vehicle Purchase Advisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Define the STRICT output structure we want from the AI using Pydantic
class AdvisorResponseAI(BaseModel):
    car_name: str = Field(description="The specific name and variant of the recommended vehicle")
    brand_name: str = Field(description="The brand name of the car (e.g., 'Hyundai', 'BMW', 'Mahindra')")
    estimated_on_road_price: str = Field(description="Estimated on-road price in INR (e.g., '₹24,50,000')")
    pros: str = Field(description="Top 3 positive aspects. MUST be separated by a pipe character (|)")
    cons: str = Field(description="Top 3 negative aspects. MUST be separated by a pipe character (|)")
    fuel_efficiency: str = Field(description="Real-world mileage in kmpl (Return ONLY the raw numeric value, e.g. '14.5')")
    road_adaptability_score: str = Field(description="Score from 1-10 on how well it handles Indian potholes and speedbreakers (Return ONLY the raw numeric value, e.g. '8')")
    verdict_reasoning: str = Field(description="A short 2-sentence explanation of why this car won")

# The final response model sent to the frontend
class AdvisorResponse(BaseModel):
    car_name: str
    brand_name: str
    image_url: str
    estimated_on_road_price: str
    pros: List[str]
    cons: List[str]
    base_maintenance_per_km: str
    fuel_efficiency: str
    road_adaptability_score: str
    verdict_reasoning: str

# 2. Define the input structure for our API
class ConsultRequest(BaseModel):
    prompt: str

# Map brands or segments to realistic per-km maintenance costs
MAINTENANCE_RATES = {
    "budget": 1.2,    # e.g., Maruti, Hyundai, Tata
    "premium": 3.5,   # e.g., Mahindra, Kia, Honda, Toyota
    "luxury": 15.0    # e.g., BMW, Audi, Mercedes, Land Rover, Porsche
}

from functools import lru_cache

@lru_cache(maxsize=128)
def get_maintenance_rate(brand: str) -> float:
    # Logic to classify the car brand into a tier
    brand = brand.lower()
    if any(b in brand for b in ["bmw", "audi", "mercedes", "volvo", "porsche", "land rover", "jaguar", "lexus"]):
        return MAINTENANCE_RATES["luxury"]
    elif any(b in brand for b in ["mahindra", "kia", "toyota", "honda", "mg", "skoda", "volkswagen", "jeep"]):
        return MAINTENANCE_RATES["premium"]
    return MAINTENANCE_RATES["budget"]

import asyncio
import requests
from functools import partial, lru_cache

# Helper function to find an image (synchronous — will be run in a thread pool)
@lru_cache(maxsize=128)
def _search_car_image(car_name: str) -> str:
    """Searches for a car image, prioritizing local Indian road views via DDG, 
       with a bulletproof fallback to Wikipedia if rate-limited."""
    
    # --- ATTEMPT 1: DuckDuckGo 'Force-India' Search ---
    try:
        ddgs = DDGS()
        # Localized Search Query to favor Indian road presence from reputable domains
        query = f"{car_name} car exterior front angle India"
        results = ddgs.images(query, max_results=1)
        if results and len(results) > 0:
            return results[0].get("image")
    except Exception as e:
        print(f"DDG Image Search failed (likely 403 Ratelimit). Falling back to Wikipedia: {e}")

    # --- ATTEMPT 2: Wikipedia Fallback (Robust) ---
    def _fetch_wiki_image(query: str) -> str:
        try:
            search_url = "https://en.wikipedia.org/w/api.php"
            search_params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json"
            }
            headers = {"User-Agent": "AIVehicleAdvisor/1.0"}
            search_resp = requests.get(search_url, params=search_params, headers=headers)
            search_data = search_resp.json()
            
            if not search_data.get("query", {}).get("search"):
                return ""
                
            # Get top 3 matching titles
            titles = [res["title"] for res in search_data["query"]["search"][:3]]
            best_titles = "|".join(titles)
            
            image_params = {
                "action": "query",
                "prop": "pageimages",
                "format": "json",
                "piprop": "original",
                "titles": best_titles
            }
            image_resp = requests.get(search_url, params=image_params, headers=headers)
            image_data = image_resp.json()
            
            pages = image_data.get("query", {}).get("pages", {})
            
            # Map page titles to their info for ordered lookup
            title_to_page = {p.get("title"): p for p in pages.values()}
            
            # Return the image for the first matching title in our ordered list
            for title in titles:
                page_info = title_to_page.get(title, {})
                if "original" in page_info:
                    return page_info["original"]["source"]
            return ""
        except Exception as e:
            print(f"Error fetching image for {query}: {e}")
            return ""

    # Try full name on Wikipedia
    img_url = _fetch_wiki_image(car_name)
    if img_url:
        return img_url
        
    # Fallback to Make + Model (first 2 words) on Wikipedia
    words = car_name.split()
    if len(words) > 2:
        short_name = " ".join(words[:2])
        return _fetch_wiki_image(short_name)
        
    return ""

from ddgs import DDGS

# Helper function to fetch live context (synchronous — run in thread pool)
def _get_live_context(user_prompt: str) -> str:
    """Queries DuckDuckGo for live pricing, specs, and 2026 data."""
    try:
        ddgs = DDGS()
        # Focus the search for modern context
        search_query = f"{user_prompt} current price specifications India 2026"
        results = ddgs.text(search_query, max_results=3)
        
        if not results:
            return "No live data available."
            
        context = ""
        for r in results:
            context += f"- {r.get('title')}: {r.get('body')}\n"
        return context
    except Exception as e:
        print(f"RAG Search Error: {e}")
        return "No live data available."

@app.get("/")
def home():
    return {"status": "Backend Engine is Running"}

# 3. Initialize the AI Model globally for performance
global_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
global_structured_llm = global_llm.with_structured_output(AdvisorResponseAI)

@app.post("/api/consult", response_model=AdvisorResponse)
async def consult_vehicle(request: ConsultRequest):
    
    # Fetch live context asynchronously via thread pool
    loop = asyncio.get_event_loop()
    live_context = await loop.run_in_executor(None, partial(_get_live_context, request.prompt))
    
    # 4. Create the System Prompt Persona
    system_instruction = f"""
    You are Jeremy Clarkson, the legendary, highly opinionated, and exceptionally critical automotive journalist from Top Gear. A user will give you their specific automotive requirements. You are not just a chatbot; you are their personal vehicle consultant specializing *only* in the Indian market.

    Your mission is simple: use your decades of knowledge to pick the absolute *single best vehicle* that perfectly aligns with their budget, city, and needs.
    IMPORTANT: For numeric fields (fuel_efficiency, road_adaptability_score), provide ONLY the raw numbers as strings without any units (e.g., '14.5', '8').

    ### LIVE MARKET DATA (RAG CONTEXT)
    Use the live data below as the single source of truth for pricing and availability. If the live data contradicts your internal training, prioritize the live data.
    
    {live_context}

    ### Mandatory Directives:
    1.  **NO FENCE-SITTING:** You must select one specific car. Do not suggest alternatives.
    2.  **BRUTALLY HONEST CONS:** Do not sugarcoat dealbreakers. If a car has bad reliability, terrible on-road presence, or overpriced maintenance, you must state it directly.
    3.  **INDIAN CONTEXT IS EVERYTHING:** Consider on-road price (approximate taxes based on the user's city), ground clearance for local potholes, service network availability, and resale value.
    4.  **STRICT PRICING:** You must stay within the user's defined budget.
    5.  **PERSONA IS MANDATORY:** Use opinionated language, professional terminology (e.g., 'NVH levels', 'ride quality', 'low-end torque'), and be direct. Your `verdict_reasoning` should make them feel like you are speaking directly to them.
    6.  **FORMATTING:** The `pros` and `cons` fields MUST be strings separated by a pipe character (|). Do NOT use arrays. Example: "Feature 1 | Feature 2 | Feature 3".
    7.  **CRITICAL SAFETY RULE:** You are not allowed to guess or hallucinate safety ratings. If a user asks for a 5-star GNCAP car, and the recommended car is not officially rated 5-stars by Bharat NCAP or Global NCAP, you MUST explicitly state its current rating (e.g., '1-star' or '2-star') and warn the user. Do not call it a 5-star car if it is not.
    """
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", "{user_input}")
    ])
    
    # 5. Chain them together and run!
    chain = prompt_template | global_structured_llm
    
    # Run the AI
    ai_result = chain.invoke({"user_input": request.prompt})
    
    # Fetch the image URL dynamically (run sync DDGS in a thread pool)
    loop = asyncio.get_event_loop()
    image_url = await loop.run_in_executor(None, partial(_search_car_image, ai_result.car_name))
    
    # Override the AI's potentially incorrect estimate with your logic
    rate = str(get_maintenance_rate(ai_result.brand_name))
    
    # Parse pros and cons into lists
    pros_list = [p.strip() for p in ai_result.pros.replace('["', '').replace('"]', '').split('|') if p.strip()]
    cons_list = [c.strip() for c in ai_result.cons.replace('["', '').replace('"]', '').split('|') if c.strip()]
    
    # In case the model hallucinated JSON string arrays anyway
    if not pros_list:
        pros_list = [ai_result.pros]
    if not cons_list:
        cons_list = [ai_result.cons]
    
    final_result = AdvisorResponse(
        car_name=ai_result.car_name,
        brand_name=ai_result.brand_name,
        image_url=image_url,
        estimated_on_road_price=ai_result.estimated_on_road_price,
        pros=pros_list,
        cons=cons_list,
        base_maintenance_per_km=rate,
        fuel_efficiency=ai_result.fuel_efficiency,
        road_adaptability_score=ai_result.road_adaptability_score,
        verdict_reasoning=ai_result.verdict_reasoning
    )
    
    return final_result