# WiZ Control

Panel web local para controlar una lámpara WiZ desde tu Mac: encender/apagar,
brillo, color y temperatura de blanco. No usa la nube, habla directo con la
lámpara por tu red WiFi.

## 1. Instalar dependencias

Abrí la Terminal, andá a la carpeta del proyecto y creá un entorno virtual
(recomendado para no pisar tu Python del sistema):

```bash
cd wiz-control
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Ejecutar el servidor

```bash
python3 server.py
```

Vas a ver `WiZ Control corriendo en http://localhost:5000`. La primera vez
macOS puede pedirte permiso para que Python acceda a la red local — aceptalo.

## 3. Abrir el panel

Abrí el navegador en **http://localhost:5000**

## 4. Encontrar tu lámpara

Apretá el botón **Buscar** en la página: manda un mensaje a toda tu red WiFi
y lista las lámparas WiZ que respondan, con su IP y estado actual. Hacé clic
en una de la lista para seleccionarla (queda guardada para la próxima vez
que abras la página).

Si el escaneo no encuentra nada (pasa en algunas redes con "aislamiento de
clientes" activado, típico en redes de oficina o WiFi de invitados), podés
poner la IP a mano en el campo de abajo. Para conseguirla:

- En la app oficial WiZ: tocá la lámpara → ícono de ajustes → información del
  dispositivo, ahí figura la IP.
- O entrá al panel de tu router (normalmente `192.168.1.1` o `192.168.0.1`) y
  buscá en la lista de dispositivos conectados uno cuyo nombre empiece con
  algo como `wiz_` o el fabricante "Shenzhen".

**Importante:** la PC y la lámpara tienen que estar en la misma red WiFi
(no funciona si una está en una red de invitados y la otra en la principal).

## ¿Cómo funciona por dentro?

Las lámparas WiZ escuchan comandos UDP en el puerto 38899 en formato JSON,
por ejemplo `{"method":"setPilot","params":{"state":true,"dimming":80}}`.
`server.py` arma esos mensajes y se los manda directo a la IP de la lámpara;
`static/index.html` es la interfaz que ves en el navegador y llama a ese
servidor por HTTP.
