from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from src.shared.auth.jwt import decode_token

class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware responsável por extrair o token JWT do cabeçalho de Autorização
    e definir o tenant_id (propriedade_id) no estado da requisição.
    Ignora rotas públicas.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        public_paths = ["/health", "/docs", "/openapi.json", "/"]
        
        if request.url.path in public_paths:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = decode_token(token)
                request.state.tenant_id = payload.org
            except ValueError:
                request.state.tenant_id = None
        else:
            request.state.tenant_id = None

        response = await call_next(request)
        return response
