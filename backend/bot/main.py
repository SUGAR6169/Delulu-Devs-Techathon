import discord
from discord.ext import commands
from discord import app_commands
import os
import asyncio
import aiohttp
from aiohttp import web
from dotenv import load_dotenv

from llm import generate_humanized_response

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID = os.getenv("DISCORD_ALERT_CHANNEL_ID")
API_BASE_URL = "http://localhost:8000/api"
INDIGO_COLOR = 0x4F46E5
RED_COLOR = 0xEF4444

intents = discord.Intents.default()
intents.message_content = True

class OfficeBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents, help_command=None)
        self.session = None

    async def setup_hook(self):
        self.session = aiohttp.ClientSession()
        
        # Start webhook server
        app = web.Application()
        app.router.add_post('/webhook/alert', self.handle_alert_webhook)
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', 8001)
        await site.start()
        print("Webhook server started on http://localhost:8001/webhook/alert")
        
        # Sync slash commands
        await self.tree.sync()
        print("Slash commands synchronized")

    async def close(self):
        if self.session:
            await self.session.close()
        await super().close()

    async def handle_alert_webhook(self, request):
        auth_header = request.headers.get("Authorization")
        if auth_header != "Bearer secret_webhook_token_123":
            return web.Response(status=401, text="Unauthorized")
            
        try:
            data = await request.json()
            message = data.get("message", "Unknown anomaly detected!")
            
            if CHANNEL_ID and CHANNEL_ID != "your_channel_id_here":
                channel = self.get_channel(int(CHANNEL_ID))
                if not channel:
                    try:
                        channel = await self.fetch_channel(int(CHANNEL_ID))
                    except Exception as fe:
                        print(f"Failed to fetch channel {CHANNEL_ID}: {fe}")
                
                if channel:
                    embed = discord.Embed(
                        title="🚨 Office Anomaly Detected! 🚨",
                        description=message,
                        color=RED_COLOR
                    )
                    await channel.send(embed=embed)
                else:
                    print(f"Could not find channel with ID {CHANNEL_ID}")
            return web.Response(text="OK")
        except Exception as e:
            print(f"Webhook error: {e}")
            return web.Response(status=500, text="Internal Server Error")

bot = OfficeBot()

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")

@bot.event
async def on_message(message):
    print(f"[DEBUG] Message received from {message.author}: '{message.content}' (has_content: {bool(message.content)})")
    await bot.process_commands(message)

async def fetch_json(url: str):
    async with bot.session.get(url) as response:
        response.raise_for_status()
        return await response.json()


# --- SHARED LOGIC LAYER ---

async def _handle_status() -> discord.Embed:
    try:
        data = await fetch_json(f"{API_BASE_URL}/devices")
        human_text = generate_humanized_response("What is the current status of all devices in the office?", data)
        return discord.Embed(title="Office Device Status", description=human_text, color=INDIGO_COLOR)
    except Exception as e:
        return discord.Embed(title="Error", description=f"Error fetching data from backend: {e}", color=RED_COLOR)

async def _handle_room(room_name: str) -> discord.Embed:
    room_map = {
        "drawing room": "Drawing Room", "drawing": "Drawing Room", "drawingroom": "Drawing Room",
        "work room 1": "Work Room 1", "work1": "Work Room 1", "workroom1": "Work Room 1",
        "work room 2": "Work Room 2", "work2": "Work Room 2", "workroom2": "Work Room 2",
    }
    db_room = room_map.get(room_name.lower().strip())
    
    if not db_room:
        error_data = {
            "error": "Invalid room specified",
            "valid_choices": ["Drawing Room", "Work Room 1", "Work Room 2"]
        }
        human_text = generate_humanized_response(
            "The user asked for a room that doesn't exist. Let them know in a friendly way and list the valid options they can use instead.", 
            error_data
        )
        return discord.Embed(title="Room Not Found", description=human_text, color=RED_COLOR)

    try:
        data = await fetch_json(f"{API_BASE_URL}/devices/{db_room}")
        human_text = generate_humanized_response(f"What is the status of the devices in {db_room}?", data)
        return discord.Embed(title=f"{db_room} Status", description=human_text, color=INDIGO_COLOR)
    except Exception as e:
        return discord.Embed(title="Error", description=f"Error fetching data from backend: {e}", color=RED_COLOR)

async def _handle_usage() -> discord.Embed:
    try:
        data = await fetch_json(f"{API_BASE_URL}/power/summary")
        human_text = generate_humanized_response("What is the total power usage and estimated daily consumption?", data)
        return discord.Embed(title="Power Usage Summary", description=human_text, color=INDIGO_COLOR)
    except Exception as e:
        return discord.Embed(title="Error", description=f"Error fetching data from backend: {e}", color=RED_COLOR)

async def _handle_alerts() -> discord.Embed:
    try:
        data = await fetch_json(f"{API_BASE_URL}/alerts")
        human_text = generate_humanized_response("What are the recent alerts and anomalies in the office?", data)
        return discord.Embed(title="Recent Anomalies", description=human_text, color=INDIGO_COLOR)
    except Exception as e:
        return discord.Embed(title="Error", description=f"Error fetching data from backend: {e}", color=RED_COLOR)

async def _handle_help() -> discord.Embed:
    embed = discord.Embed(
        title="🤖 Delulu Devs Office Assistant Help",
        description="Hello! I am your AI-powered office assistant. I monitor the office's electrical devices, power usage, and active alerts in real-time.",
        color=INDIGO_COLOR
    )
    embed.add_field(
        name="Prefix Commands (!)",
        value=(
            "• `!status` - Check the current live status of all devices.\n"
            "• `!room <name>` - Check device statuses for a specific room (e.g., `!room drawing`).\n"
            "• `!usage` - Get total live power consumption summary.\n"
            "• `!alerts` (or `!alert`) - Fetch the history of recent anomalies.\n"
            "• `!help` - Display this command menu."
        ),
        inline=False
    )
    embed.add_field(
        name="Slash Commands (/)",
        value=(
            "• `/status` - Check the current live status of all devices.\n"
            "• `/room` - Select a room from the dropdown to check its devices.\n"
            "• `/usage` - Get total live power consumption summary.\n"
            "• `/alerts` - Fetch the history of recent anomalies."
        ),
        inline=False
    )
    embed.set_footer(text="Developed for the Delulu Devs Techathon Dashboard.")
    return embed


# --- PREFIX COMMANDS ---

@bot.command(name="status")
async def status_prefix(ctx):
    async with ctx.typing():
        embed = await _handle_status()
        await ctx.send(embed=embed)

@bot.command(name="room")
async def room_prefix(ctx, *, room_name: str):
    async with ctx.typing():
        embed = await _handle_room(room_name)
        await ctx.send(embed=embed)

@bot.command(name="usage")
async def usage_prefix(ctx):
    async with ctx.typing():
        embed = await _handle_usage()
        await ctx.send(embed=embed)

@bot.command(name="alerts", aliases=["alert"])
async def alerts_prefix(ctx):
    async with ctx.typing():
        embed = await _handle_alerts()
        await ctx.send(embed=embed)

@bot.command(name="help")
async def help_prefix(ctx):
    embed = await _handle_help()
    await ctx.send(embed=embed)


# --- SLASH COMMANDS ---

@bot.tree.command(name="status", description="Check the current live status of all devices across the office")
async def status_slash(interaction: discord.Interaction):
    await interaction.response.defer()
    embed = await _handle_status()
    await interaction.followup.send(embed=embed)

@bot.tree.command(name="room", description="Check device statuses for a specific room")
@app_commands.describe(room_name="Select the room to query")
@app_commands.choices(room_name=[
    app_commands.Choice(name="Drawing Room", value="Drawing Room"),
    app_commands.Choice(name="Work Room 1", value="Work Room 1"),
    app_commands.Choice(name="Work Room 2", value="Work Room 2"),
])
async def room_slash(interaction: discord.Interaction, room_name: app_commands.Choice[str]):
    await interaction.response.defer()
    embed = await _handle_room(room_name.value)
    await interaction.followup.send(embed=embed)

@bot.tree.command(name="usage", description="Get total live power consumption summary and estimated daily usage")
async def usage_slash(interaction: discord.Interaction):
    await interaction.response.defer()
    embed = await _handle_usage()
    await interaction.followup.send(embed=embed)

@bot.tree.command(name="alerts", description="Fetch the history of the most recent anomalies and alerts")
async def alerts_slash(interaction: discord.Interaction):
    await interaction.response.defer()
    embed = await _handle_alerts()
    await interaction.followup.send(embed=embed)


if __name__ == "__main__":
    if not TOKEN or TOKEN == "your_discord_bot_token_here":
        print("Error: DISCORD_TOKEN is not set in .env")
    else:
        bot.run(TOKEN)
