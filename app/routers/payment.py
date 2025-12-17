import uuid
import requests
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(prefix="/payment", tags=["payment"])

class PaymentRequest(BaseModel):
    amount_xaf: int
    email: str
    phone: str = None

@router.post("/initialize")
async def initialize_payment(data: PaymentRequest):
    reference = f"hireafrica-{uuid.uuid4()}"
    payment_ref = reference

    payload = {
        "amount": data.amount_xaf,
        "currency": "XAF",
        "locale": "fr",
        "payment_ref": payment_ref,
        "return_url": "https://xxxx.sa.ngrok.io/payment/success", 
        "notify_url": "https://xxxx.sa.ngrok.io/payment/notify",  
        "phone": data.phone or "",
        "email": data.email,
    }

    
    url = f"https://api.monetbil.com/widget/v2.1/{settings.MONETBIL_SERVICE_KEY}"

    try:
        response = requests.post(url, data=payload)
        response.raise_for_status()
        resp_data = response.json()

        if resp_data.get("payment_url"):
            return {
                "success": True,
                "payment_url": resp_data["payment_url"],
                "reference": reference
            }
        else:
            raise HTTPException(status_code=500, detail="Erreur Monetbil: pas d'URL")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Erreur requête: {str(e)}")
    except ValueError:
        raise HTTPException(status_code=500, detail="Réponse non JSON")

@router.post("/notify")
async def notify_payment(request: Request):
    payload = await request.form()  # Form data
    # Vérifier signature si besoin avec MONETBIL_SERVICE_SECRET
    if payload.get("status") == "SUCCESS":
        # Traiter paiement
        pass
    return {"status": "ok"}