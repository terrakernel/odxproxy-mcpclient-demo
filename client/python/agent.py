from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
import os
from pathlib import Path

server_path = Path(__file__).resolve().parent.parent.parent / "server" / "build" / "index.js"

root_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="ODXMCP",instruction="Help the user for daily day to day task interacting "
                              "with their odoo instance, "
                              "you may provide basic functionalities regarding conversion",
    tools=[
        McpToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command="node",
                    args=[str(server_path)]
                )
                ,timeout=15),
        ),
    ])