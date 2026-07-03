import discord
from discord.ext import commands
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

intents = discord.Intents.default()
intents.message_content = True

class OfficeBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
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

    async def close(self):
        if self.session:
            await self.session.close()
        await super().close()

    async def handle_alert_webhook(self, request):
        try:
            data = await request.json()
            message = data.get("message", "Unknown anomaly detected!")
            
            if CHANNEL_ID and CHANNEL_ID != "your_channel_id_here":
                channel = self.get_channel(int(CHANNEL_ID))
                if channel:
                    alert_text = f"🚨 **ALERT!** 🚨\n{message}"
                    await channel.send(alert_text)
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

async def fetch_json(url: str):
    async with bot.session.get(url) as response:
        response.raise_for_status()
        return await response.json()

@bot.command(name="status")
async def status_command(ctx):
    async with ctx.typing():
        try:
            data = await fetch_json(f"{API_BASE_URL}/devices")
            human_text = generate_humanized_response("What is the current status of all devices in the office?", data)
            await ctx.send(human_text)
        except Exception as e:
            await ctx.send(f"Error fetching data from backend: {e}")

@bot.command(name="room")
async def room_command(ctx, *, room_name: str):
    room_map = {
        "drawing room": "Drawing Room",
        "drawing": "Drawing Room",
        "drawingroom": "Drawing Room",
        "work room 1": "Work Room 1",
        "work1": "Work Room 1",
        "workroom1": "Work Room 1",
        "work room 2": "Work Room 2",
        "work2": "Work Room 2",
        "workroom2": "Work Room 2",
    }
    
    db_room = room_map.get(room_name.lower().strip())
    if not db_room:
        async with ctx.typing():
            error_data = {
                "error": "Invalid room specified",
                "provided": room_name,
                "valid_choices": ["Drawing Room", "Work Room 1", "Work Room 2"]
            }
            human_text = generate_humanized_response(
                "The user asked for a room that doesn't exist. Let them know in a friendly way and list the valid options they can use instead.", 
                error_data
            )
            await ctx.send(human_text)
        return

    async with ctx.typing():
        try:
            data = await fetch_json(f"{API_BASE_URL}/devices/{db_room}")
            human_text = generate_humanized_response(f"What is the status of the devices in {db_room}?", data)
            await ctx.send(human_text)
        except Exception as e:
            await ctx.send(f"Error fetching data from backend: {e}")

@bot.command(name="usage")
async def usage_command(ctx):
    async with ctx.typing():
        try:
            data = await fetch_json(f"{API_BASE_URL}/power/summary")
            human_text = generate_humanized_response("What is the total power usage and estimated daily consumption?", data)
            await ctx.send(human_text)
        except Exception as e:
            await ctx.send(f"Error fetching data from backend: {e}")

if __name__ == "__main__":
    if not TOKEN or TOKEN == "your_discord_bot_token_here":
        print("Error: DISCORD_TOKEN is not set in .env")
    else:
        bot.run(TOKEN)
