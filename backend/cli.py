#!/usr/bin/env python3
"""
MedMCQ CLI Tool

Command-line interface for MedMCQ platform operations.
Includes setup-token command for generating long-lived API tokens.
"""

import typer
import httpx
import json
import os
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm

app = typer.Typer(
    name="medmcq",
    help="MedMCQ CLI - Command-line tools for MedMCQ platform"
)

console = Console()

# Default configuration
DEFAULT_API_URL = "http://localhost:8000"
CONFIG_DIR = Path.home() / ".medmcq"
CONFIG_FILE = CONFIG_DIR / "config.json"
TOKEN_FILE = CONFIG_DIR / "token.json"


def get_config() -> dict:
    """Load configuration from file."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}


def save_config(config: dict) -> None:
    """Save configuration to file."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    # Set restrictive permissions
    CONFIG_FILE.chmod(0o600)


def get_token() -> Optional[dict]:
    """Load token from file."""
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE) as f:
            return json.load(f)
    return None


def save_token(token_data: dict) -> None:
    """Save token to file securely."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(TOKEN_FILE, 'w') as f:
        json.dump(token_data, f, indent=2)
    # Set restrictive permissions (read/write only for owner)
    TOKEN_FILE.chmod(0o600)


def clear_token() -> None:
    """Remove stored token."""
    if TOKEN_FILE.exists():
        TOKEN_FILE.unlink()


@app.command()
def setup_token(
    email: Optional[str] = typer.Option(None, "--email", "-e", help="Your email address"),
    api_url: Optional[str] = typer.Option(None, "--api-url", "-u", help="API server URL"),
    token_name: str = typer.Option("CLI Token", "--name", "-n", help="Name for the token"),
    force: bool = typer.Option(False, "--force", "-f", help="Overwrite existing token"),
    clear: bool = typer.Option(False, "--clear", help="Clear stored token and exit")
):
    """
    Generate a long-lived API token for CLI/programmatic access.

    This command authenticates you and creates a persistent API token
    that can be used for non-interactive authentication in CI/CD pipelines,
    scripts, and other automated tools.

    The token is stored securely in ~/.medmcq/token.json

    Example:
        medmcq setup-token
        medmcq setup-token --email user@example.com
        medmcq setup-token --force  # Replace existing token
        medmcq setup-token --clear  # Remove stored token
    """
    # Handle clear flag
    if clear:
        clear_token()
        console.print("[green]✓[/green] Token cleared successfully")
        return

    # Check for existing token
    existing_token = get_token()
    if existing_token and not force:
        console.print(Panel(
            f"[yellow]A token already exists[/yellow]\n\n"
            f"Token: {existing_token.get('token_prefix', 'Unknown')}\n"
            f"Name: {existing_token.get('name', 'Unknown')}\n\n"
            f"Use [bold]--force[/bold] to replace it, or [bold]--clear[/bold] to remove it.",
            title="Existing Token Found"
        ))
        raise typer.Exit(1)

    # Get API URL
    config = get_config()
    base_url = api_url or config.get('api_url') or os.environ.get('MEDMCQ_API_URL') or DEFAULT_API_URL

    console.print(Panel(
        "[bold]MedMCQ CLI Setup Token[/bold]\n\n"
        "This will generate a long-lived API token for CLI access.\n"
        "The token will be stored securely in ~/.medmcq/token.json",
        title="Setup Token"
    ))

    # Get credentials
    if not email:
        email = Prompt.ask("[bold]Email[/bold]")

    password = Prompt.ask("[bold]Password[/bold]", password=True)

    console.print(f"\n[dim]Connecting to {base_url}...[/dim]")

    try:
        # Make request to setup-token endpoint
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{base_url}/api/auth/setup-token",
                json={
                    "email": email,
                    "password": password,
                    "token_name": token_name
                }
            )

            if response.status_code == 401:
                console.print("[red]✗[/red] Invalid email or password")
                raise typer.Exit(1)

            if response.status_code != 200:
                error_detail = response.json().get('detail', 'Unknown error')
                console.print(f"[red]✗[/red] Error: {error_detail}")
                raise typer.Exit(1)

            token_data = response.json()

    except httpx.ConnectError:
        console.print(f"[red]✗[/red] Could not connect to {base_url}")
        console.print("[dim]Make sure the server is running and the URL is correct.[/dim]")
        raise typer.Exit(1)
    except httpx.TimeoutException:
        console.print("[red]✗[/red] Request timed out")
        raise typer.Exit(1)

    # Save token
    save_token(token_data)

    # Save API URL in config
    config['api_url'] = base_url
    save_config(config)

    console.print(Panel(
        f"[green]✓ Token created successfully![/green]\n\n"
        f"[bold]Token:[/bold] {token_data['token']}\n"
        f"[bold]Prefix:[/bold] {token_data['token_prefix']}\n"
        f"[bold]Name:[/bold] {token_data['name']}\n"
        f"[bold]Expires:[/bold] {token_data.get('expires_at', 'Never')}\n\n"
        f"[yellow]⚠ Store this token securely - it won't be shown again![/yellow]\n\n"
        f"Token saved to: [dim]{TOKEN_FILE}[/dim]\n\n"
        f"[bold]Usage:[/bold]\n"
        f"  export MEDMCQ_API_TOKEN={token_data['token']}\n"
        f"  # or use the stored token automatically with the CLI",
        title="Token Created"
    ))


@app.command()
def config(
    api_url: Optional[str] = typer.Option(None, "--api-url", "-u", help="Set API server URL"),
    show: bool = typer.Option(False, "--show", "-s", help="Show current configuration")
):
    """
    Manage CLI configuration.

    Example:
        medmcq config --show
        medmcq config --api-url https://api.medmcq.com
    """
    current_config = get_config()

    if show:
        token = get_token()
        console.print(Panel(
            f"[bold]API URL:[/bold] {current_config.get('api_url', DEFAULT_API_URL)}\n"
            f"[bold]Config file:[/bold] {CONFIG_FILE}\n"
            f"[bold]Token file:[/bold] {TOKEN_FILE}\n"
            f"[bold]Token status:[/bold] {'Configured' if token else 'Not configured'}",
            title="Current Configuration"
        ))
        return

    if api_url:
        current_config['api_url'] = api_url
        save_config(current_config)
        console.print(f"[green]✓[/green] API URL set to: {api_url}")


@app.command()
def whoami():
    """
    Show current authenticated user information.
    """
    token_data = get_token()
    if not token_data:
        console.print("[yellow]Not authenticated.[/yellow] Run [bold]medmcq setup-token[/bold] first.")
        raise typer.Exit(1)

    config = get_config()
    base_url = config.get('api_url', DEFAULT_API_URL)

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{base_url}/api/auth/me",
                headers={"Authorization": f"Bearer {token_data['token']}"}
            )

            if response.status_code == 401:
                console.print("[red]✗[/red] Token is invalid or expired")
                console.print("[dim]Run 'medmcq setup-token --force' to get a new token[/dim]")
                raise typer.Exit(1)

            if response.status_code != 200:
                console.print(f"[red]✗[/red] Error: {response.status_code}")
                raise typer.Exit(1)

            user = response.json()

    except httpx.ConnectError:
        console.print(f"[red]✗[/red] Could not connect to {base_url}")
        raise typer.Exit(1)

    console.print(Panel(
        f"[bold]Email:[/bold] {user.get('email')}\n"
        f"[bold]Name:[/bold] {user.get('full_name', 'N/A')}\n"
        f"[bold]Subscription:[/bold] {user.get('subscription_tier', 'free')}\n"
        f"[bold]Token prefix:[/bold] {token_data.get('token_prefix', 'Unknown')}",
        title="Current User"
    ))


@app.command()
def version():
    """Show CLI version."""
    console.print("MedMCQ CLI v1.0.0")


def main():
    """Main entry point."""
    app()


if __name__ == "__main__":
    main()
