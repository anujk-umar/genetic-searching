import httpx
from typing import Tuple


async def download_vcf_from_url(url: str, max_bytes: int = 5 * 1024 * 1024) -> str:
    """
    Downloads VCF content from a Firebase Storage or web URL with a 5MB safety limit.
    """
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        
        content = response.text
        if len(content.encode("utf-8")) > max_bytes:
            raise ValueError(f"File exceeds maximum allowed size of {max_bytes / (1024 * 1024)}MB.")
            
        return content
