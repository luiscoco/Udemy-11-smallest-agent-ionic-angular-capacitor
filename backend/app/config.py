from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / '.env',
        env_file_encoding='utf-8', extra='ignore',
    )
    anthropic_api_key: SecretStr = SecretStr('')
    claude_model: str = ''
    agent_system_prompt: str = ''
    agent_max_turns: int = Field(default=1, ge=1, le=10)

    api_host: str = "127.0.0.1"
    api_port: int = Field(default=8600, ge=1, le=65535)
    allowed_origins: str = "http://localhost:5200,http://127.0.0.1:5200,capacitor://localhost,https://localhost"

    @property
    def api_key_configured(self) -> bool:
        key = self.anthropic_api_key.get_secret_value().strip()
        return bool(key) and key != 'sk-ant-replace-with-your-key'
