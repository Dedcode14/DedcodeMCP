# DedcodeMCP Gestor de Archivos

Servidor MCP (Model Context Protocol) para gestión de archivos en el escritorio.

## Características

-  Crear archivos
-  Leer archivos
-  Editar archivos
-  Mover/renombrar archivos
-  Eliminar archivos
-  Listar archivos

## Instalación

\\\ash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/mcp-gestor-archivos.git

# Instalar dependencias
cd mcp-gestor-archivos
pnpm install
\\\

## Uso

### Ejecutar localmente

\\\ash
pnpm tsx main.ts
\\\

### Configurar en Claude Desktop

Edita el archivo de configuración de Claude Desktop:

**Windows:** \%APPDATA%\Claude\claude_desktop_config.json\

**macOS:** \~/Library/Application Support/Claude/claude_desktop_config.json\

Agrega esta configuración:

\\\json
{
  \"mcpServers\": {
    \"gestor-archivos\": {
      \"command\": \"cmd\",
      \"args\": [
        \"/c\",
        \"cd\",
        \"/d\",
        \"RUTA_A_TU_PROYECTO\",
        \"&&\",
        \"npx\",
        \"-y\",
        \"tsx\",
        \"main.ts\"
      ]
    }
  }
}
\\\

## Requisitos

- Node.js 18 o superior
- pnpm

## Tecnologías

- TypeScript
- Model Context Protocol SDK
- Zod para validación

## Licencia

MIT

Proyecto Creado por Diego Orozco (Dedcode14).
