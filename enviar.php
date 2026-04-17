<?php
// Configuración de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar que el archivo no sea accesible directamente desde URL
if (!isset($_SERVER['HTTP_HOST'])) {
    die('Acceso directo no permitido');
}

// SendGrid - Usando API REST directamente (sin Composer)
require_once 'config.php';

// Headers para respuesta HTML y CORS
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// CONFIGURACIÓN PRINCIPAL
$config = include 'config.php';
$to_email   = $config['to_email'];
$from_email = $config['from_email'];
$from_name  = $config['from_name'];

// Función para logging
function logError($message, $data = null) {
    $logEntry = date('Y-m-d H:i:s') . " - " . $message;
    if ($data) {
        $logEntry .= " - Data: " . json_encode($data);
    }
    $logEntry .= "\n";
    file_put_contents('contact_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
}

// Función para enviar email usando API REST de SendGrid
function sendEmailViaAPI($apiKey, $fromEmail, $fromName, $toEmail, $subject, $body) {
    $url = 'https://api.sendgrid.com/v3/mail/send';
    
    $data = [
        'personalizations' => [
            [
                'to' => [
                    ['email' => $toEmail]
                ],
                'subject' => $subject
            ]
        ],
        'from' => [
            'email' => $fromEmail,
            'name' => $fromName
        ],
        'content' => [
            [
                'type' => 'text/plain',
                'value' => $body
            ]
        ]
    ];
    
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'User-Agent: SamuelPortilla-Portfolio/1.0',
        'X-Mailer: Samuel Portilla Portfolio System'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => $httpCode == 202,
        'http_code' => $httpCode,
        'response' => $response,
        'curl_error' => $curlError
    ];
}

try {
    // Verificar método HTTP
    if ($_SERVER["REQUEST_METHOD"] != "POST") {
        logError("Método HTTP no permitido", ['method' => $_SERVER["REQUEST_METHOD"]]);
        throw new Exception("Método no permitido. Solo se aceptan solicitudes POST.");
    }

    // Verificar que la configuración esté cargada
    if (!isset($config) || !isset($config['api_key'])) {
        logError("Configuración de SendGrid no encontrada");
        throw new Exception("Error de configuración del servidor. Contacta al administrador.");
    }

    // DATOS DEL FORMULARIO
    $name    = trim($_POST['name'] ?? '');
    $email   = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    // Log de datos recibidos (sin información sensible)
    logError("Datos del formulario recibidos", [
        'name_length' => strlen($name),
        'email_domain' => substr(strrchr($email, "@"), 1),
        'subject_length' => strlen($subject),
        'message_length' => strlen($message)
    ]);

    // VALIDACIONES DETALLADAS
    $errors = [];
    
    if (!$name) {
        $errors[] = "El nombre es requerido";
    } elseif (strlen($name) < 2) {
        $errors[] = "El nombre debe tener al menos 2 caracteres";
    }
    
    if (!$email) {
        $errors[] = "El email es requerido";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "El formato del email no es válido";
    }
    
    if (!$subject) {
        $errors[] = "El asunto es requerido";
    }
    
    if (!$message) {
        $errors[] = "El mensaje es requerido";
    }

    if (!empty($errors)) {
        logError("Errores de validación", $errors);
        throw new Exception("Errores de validación: " . implode(", ", $errors));
    }

    // Verificar que la API Key no esté vacía
    if (empty($config['api_key']) || $config['api_key'] === 'TU_API_KEY_AQUI') {
        logError("API Key de SendGrid no configurada");
        throw new Exception("API Key de SendGrid no configurada correctamente.");
    }

    // PREPARAR CONTENIDO DEL EMAIL
    $emailSubject = "Nuevo mensaje desde portafolio: " . $subject;
    $emailBody = "Nuevo mensaje desde el portafolio de Samuel Portilla:\n\n";
    $emailBody .= "Nombre: $name\n";
    $emailBody .= "Email: $email\n";
    $emailBody .= "Asunto: $subject\n\n";
    $emailBody .= "Mensaje:\n$message\n\n";
    $emailBody .= "---\n";
    $emailBody .= "Enviado desde el portfolio de Samuel Portilla\n";
    $emailBody .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
    $emailBody .= "IP del remitente: " . ($_SERVER['REMOTE_ADDR'] ?? 'No disponible') . "\n";
    $emailBody .= "Para responder, usa: $email";
    
    logError("Intentando enviar email", [
        'from' => $from_email,
        'to' => $to_email,
        'subject' => $emailSubject
    ]);
    
    // ENVIAR EMAIL USANDO API REST
    $result = sendEmailViaAPI(
        $config['api_key'],
        $from_email,
        $from_name,
        $to_email,
        $emailSubject,
        $emailBody
    );
    
    logError("Respuesta de SendGrid API", [
        'success' => $result['success'],
        'http_code' => $result['http_code'],
        'response' => $result['response'],
        'curl_error' => $result['curl_error']
    ]);
    
    if ($result['success']) {
        logError("Email enviado exitosamente");
        
        // ENVIAR EMAIL DE CONFIRMACIÓN A LA PERSONA
        $confirmationSubject = "Confirmación de mensaje recibido - Samuel Portilla";
        $confirmationBody = "Estimado/a $name,\n\n";
        $confirmationBody .= "Gracias por contactarme a través de mi portafolio profesional.\n\n";
        $confirmationBody .= "He recibido tu mensaje:\n";
        $confirmationBody .= "• Asunto: $subject\n";
        $confirmationBody .= "• Mensaje: \"$message\"\n";
        $confirmationBody .= "• Fecha: " . date('d/m/Y H:i:s') . "\n\n";
        $confirmationBody .= "Te responderé dentro de 24-48 horas hábiles.\n\n";
        $confirmationBody .= "Si tienes alguna pregunta urgente, puedes contactarme directamente.\n\n";
        $confirmationBody .= "Saludos cordiales,\n\n";
        $confirmationBody .= "Samuel Andrés Portilla Ardila\n";
        $confirmationBody .= "Desarrollador de Software\n";
        $confirmationBody .= "Email: samuelportilla.office@gmail.com\n\n";
        $confirmationBody .= "---\n";
        $confirmationBody .= "Este es un email automático de confirmación.\n";
        $confirmationBody .= "Si no esperabas este mensaje, por favor ignóralo.\n";
        $confirmationBody .= "© 2025 Samuel Portilla - Todos los derechos reservados.";
        
        // Enviar email de confirmación
        $confirmationResult = sendEmailViaAPI(
            $config['api_key'],
            $from_email,
            $from_name,
            $email, // Email de la persona que envió el formulario
            $confirmationSubject,
            $confirmationBody
        );
        
        if ($confirmationResult['success']) {
            logError("Email de confirmación enviado exitosamente", ['to' => $email]);
        } else {
            logError("Error al enviar email de confirmación", [
                'to' => $email,
                'error' => $confirmationResult['http_code']
            ]);
        }
        
        echo "SUCCESS: Mensaje enviado correctamente";
    } else {
        // Mensajes de error más específicos
        $errorMessage = "Error al enviar el mensaje";
        if ($result['http_code'] == 401) {
            $errorMessage = "Error de autenticación con SendGrid. Verifica la API Key.";
        } elseif ($result['http_code'] == 403) {
            $errorMessage = "Acceso denegado. Verifica que el remitente esté verificado en SendGrid.";
        } elseif ($result['http_code'] == 400) {
            $errorMessage = "Datos del email inválidos. Verifica el formato.";
        }
        
        if ($result['curl_error']) {
            $errorMessage .= " Error de conexión: " . $result['curl_error'];
        }
        
        throw new Exception($errorMessage . " (Código: " . $result['http_code'] . ")");
    }
} catch (Exception $e) {
    logError("Excepción capturada", ['message' => $e->getMessage()]);
    echo '<div style="background: #f8d7da; color: #721c24; padding: 15px; border: 1px solid #f5c6cb; border-radius: 5px; margin: 20px;">
            <strong>❌ Error:</strong> ' . htmlspecialchars($e->getMessage()) . '<br>
            <small>Si el problema persiste, contacta directamente a samuelportilla.office@gmail.com</small>
          </div>';
}
?>
