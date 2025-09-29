// USES NPM LOCAL LINKED PACKAGE YOU MAY ADJUST THIS
import {OdxInstanceInfo, OdxMCPServer,OdxProxyClientInfo} from "odxproxy-mcpserver";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import {dirname, join} from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    dotenv.config({path: join(__dirname, "../.env")});
    const env = process.env;
    let clientInfo: OdxProxyClientInfo = {
        instance: {
            url: process.env.ODOO_INSTANCE_URL || "",
            user_id: Number(process.env.ODOO_INSTANCE_USER_ID),
            db: process.env.ODOO_DB || "",
            api_key: process.env.ODOO_INSTANCE_API_KEY || ""
        },
        odx_api_key: process.env.ODX_API_KEY || "",
        gateway_url: process.env.ODX_GATEWAY_URL
    };
    let server = new OdxMCPServer(clientInfo);
    await server.initBaseResource();

    // If DRY_RUN is set, initialize and exit to allow smoke testing without stdio hang.
    if (env.DRY_RUN === "1") {
        return;
    }
    let transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error(error);
});
