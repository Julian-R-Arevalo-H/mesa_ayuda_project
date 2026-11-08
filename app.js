
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;



// Rutas de archivos
const carpetaDatos = path.join(__dirname, "data");
const archivoDatos = path.join(carpetaDatos, "solicitudes.json");

// Crear carpeta y archivo si no existen
if (!fs.existsSync(carpetaDatos)) {
    fs.mkdirSync(carpetaDatos, { recursive: true });
}

if (!fs.existsSync(archivoDatos)) {
    fs.writeFileSync(archivoDatos, "[]", "utf8");
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos HTML y CSS
app.use(express.static(path.join(__dirname, "public")));

// Leer solicitudes
function leerSolicitudes() {
    return JSON.parse(fs.readFileSync(archivoDatos, "utf8"));
}

// Guardar solicitudes
function guardarSolicitudes(solicitudes) {
    fs.writeFileSync(
        archivoDatos,
        JSON.stringify(solicitudes, null, 2),
        "utf8"
    );
}

// Página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Consultar solicitudes
app.get("/api/solicitudes", (req, res) => {
    try {
        const solicitudes = leerSolicitudes();
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al consultar solicitudes"
        });
    }
});

// Registrar solicitud
app.post("/api/solicitudes", (req, res) => {
    try {
        const {
            solicitante,
            correo,
            tipo,
            descripcion,
            prioridad
        } = req.body;

        // Validaciones
        if (
            !solicitante ||
            !correo ||
            !tipo ||
            !descripcion ||
            !prioridad
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        if (descripcion.trim().length < 15) {
            return res.status(400).json({
                mensaje: "La descripción debe tener mínimo 15 caracteres"
            });
        }

        // Obtener registros actuales
        const solicitudes = leerSolicitudes();

        // Crear solicitud
        const nuevaSolicitud = {
            id: solicitudes.length + 1,
            solicitante: solicitante.trim(),
            correo: correo.trim(),
            tipo: tipo,
            descripcion: descripcion.trim(),
            prioridad: prioridad,
            fecha: new Date().toLocaleString("es-CO")
        };

        // Guardar solicitud
        solicitudes.push(nuevaSolicitud);
        guardarSolicitudes(solicitudes);

        res.status(201).json({
            mensaje: "Solicitud registrada correctamente",
            solicitud: nuevaSolicitud
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar la solicitud"
        });
    }
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
