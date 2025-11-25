import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import z from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

//usar el escritorio de mi PCerda
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME_DIR = process.env.USERPROFILE || process.env.HOME || "";
const DESKTOP_DIR = path.join(HOME_DIR, "Desktop");

//Validar que el directorio del escritorio existe
if (!HOME_DIR) {
    console.error("No se pudo determinar el directorio de tu Pcerda");
    process.exit(1);
}

//validar rutas y permitir acceso al escritorio
function validarRuta(ruta: string): boolean {

    return ruta.startsWith(DESKTOP_DIR);
}

//Creacion del servidor
const server = new Server(
    {
        name: "DedcodeMCP-gestor-de-archivos",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Definir schemas de validación
const CrearArchivoSchema = z.object({
    nombre: z.string().describe("Nombre del archivo con extensión"),
    contenido: z.string().describe("El contenido del archivo"),
});

const LeerArchivoSchema = z.object({
    nombre: z.string().describe("Nombre del archivo a leer"),
});

const EditarArchivoSchema = z.object({
    nombre: z.string().describe("Nombre del archivo a editar"),
    nuevo_contenido: z.string().describe("Nuevo contenido del archivo"),
});

const MoverArchivoSchema = z.object({
    origen: z.string().describe("Ruta/nombre del archivo origen"),
    destino: z.string().describe("Ruta/nombre del archivo destino"),
});

const EliminarArchivoSchema = z.object({
    nombre: z.string().describe("Nombre del archivo a eliminar"),
});

//Lista de herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "crear_archivo",
                description: "Crea un archivo nuevo en el sistema",
                inputSchema: {
                    type: "object",
                    properties: {
                        nombre: {
                            type: "string",
                            description: "Nombre del archivo con extensión",
                        },
                        contenido: {
                            type: "string",
                            description: "El contenido del archivo",
                        },
                    },
                    required: ["nombre", "contenido"],
                },
            },
            {
                name: "leer_archivo",
                description: "Lee el contenido de un archivo existente",
                inputSchema: {
                    type: "object",
                    properties: {
                        nombre: {
                            type: "string",
                            description: "Nombre del archivo a leer",
                        },
                    },
                    required: ["nombre"],
                },
            },
            {
                name: "editar_archivo",
                description: "Edita el contenido de un archivo existente (sobrescribe el contenido)",
                inputSchema: {
                    type: "object",
                    properties: {
                        nombre: {
                            type: "string",
                            description: "Nombre del archivo a editar",
                        },
                        nuevo_contenido: {
                            type: "string",
                            description: "Nuevo contenido del archivo",
                        },
                    },
                    required: ["nombre", "nuevo_contenido"],
                },
            },
            {
                name: "mover_archivo",
                description: "Mueve o renombra un archivo",
                inputSchema: {
                    type: "object",
                    properties: {
                        origen: {
                            type: "string",
                            description: "Ruta/nombre del archivo origen",
                        },
                        destino: {
                            type: "string",
                            description: "Ruta/nombre del archivo destino",
                        },
                    },
                    required: ["origen", "destino"],
                },
            },
            {
                name: "eliminar_archivo",
                description: "Elimina un archivo del sistema",
                inputSchema: {
                    type: "object",
                    properties: {
                        nombre: {
                            type: "string",
                            description: "Nombre del archivo a eliminar",
                        },
                    },
                    required: ["nombre"],
                },
            },
            {
                name: "listar_archivos",
                description: "Lista todos los archivos en el sandbox",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

//llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        switch (name) {
            case "crear_archivo": {
                const { nombre, contenido } = CrearArchivoSchema.parse(args);
                const ruta = path.join(DESKTOP_DIR, nombre);

                if (!validarRuta(ruta)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Solo se permite acceso al escritorio",
                            },
                        ],
                        isError: true,
                    };
                }

                await fs.mkdir(path.dirname(ruta), { recursive: true });
                await fs.writeFile(ruta, contenido, "utf-8");

                return {
                    content: [
                        {
                            type: "text",
                            text: `Archivo creado exitosamente: ${nombre}`,
                        },
                    ],
                };
            }

            case "leer_archivo": {
                const { nombre } = LeerArchivoSchema.parse(args);
                const ruta = path.join(DESKTOP_DIR, nombre);

                if (!validarRuta(ruta)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Solo se permite acceso al escritorio",
                            },
                        ],
                        isError: true,
                    };
                }

                const contenido = await fs.readFile(ruta, "utf-8");

                return {
                    content: [
                        {
                            type: "text",
                            text: `Contenido de ${nombre}:\n\n${contenido}`,
                        },
                    ],
                };
            }

            case "editar_archivo": {
                const { nombre, nuevo_contenido } = EditarArchivoSchema.parse(args);
                const ruta = path.join(DESKTOP_DIR, nombre);

                if (!validarRuta(ruta)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Solo se permite acceso al escritorio",
                            },
                        ],
                        isError: true,
                    };
                }

                await fs.access(ruta);
                await fs.writeFile(ruta, nuevo_contenido, "utf-8");

                return {
                    content: [
                        {
                            type: "text",
                            text: `Archivo editado correctamente: ${nombre}`,
                        },
                    ],
                };
            }

            case "mover_archivo": {
                const { origen, destino } = MoverArchivoSchema.parse(args);
                const rutaOrigen = path.join(DESKTOP_DIR, origen);
                const rutaDestino = path.join(DESKTOP_DIR, destino);

                if (!validarRuta(rutaOrigen) || !validarRuta(rutaDestino)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Solo se permite acceso al escritorio",
                            },
                        ],
                        isError: true,
                    };
                }

                await fs.mkdir(path.dirname(rutaDestino), { recursive: true });
                await fs.rename(rutaOrigen, rutaDestino);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Archivo movido o renombrado: ${origen} a ${destino}`,
                        },
                    ],
                };
            }

            case "eliminar_archivo": {
                const { nombre } = EliminarArchivoSchema.parse(args);
                const ruta = path.join(DESKTOP_DIR, nombre);

                if (!validarRuta(ruta)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Solo se permite acceso al escritorio",
                            },
                        ],
                        isError: true,
                    };
                }

                await fs.unlink(ruta);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Archivo eliminado: ${nombre}`,
                        },
                    ],
                };
            }

            case "listar_archivos": {
                const archivos = await fs.readdir(DESKTOP_DIR, { recursive: true });

                if (archivos.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No hay archivos en el escritorio",
                            },
                        ],
                    };
                }

                const lista = archivos.join("\n- ");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Archivos en el escritorio:\n- ${lista}`,
                        },
                    ],
                };
            }

            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Herramienta desconocida: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Servidor MCP iniciado correctamente");
    console.error(`Trabajando en: ${DESKTOP_DIR}`);
}

main();
