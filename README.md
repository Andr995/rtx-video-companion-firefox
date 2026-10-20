# RTX Video Companion for Firefox

**YouTube diagnostics · RTX Video Super Resolution guidance · optional DLSS5-Swapper launcher**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-Manifest%20V3-orange.svg)](extension/manifest.json)
[![Status](https://img.shields.io/badge/DLSS5--Swapper-Launcher%20only-informational.svg)](#cosa-non-fa)

**Autore e manutentore: Andr995** · Versione **1.1.1** · Licenza MIT

> [!IMPORTANT]
> **Questa estensione NON applica DLSS 5 ai video di YouTube.** L'integrazione con DLSS5-Swapper serve soltanto a rilevare e aprire un'applicazione Windows, se installata. Per un vero miglioramento video tramite GPU NVIDIA, valuta **RTX Video Super Resolution**, gestito dai driver NVIDIA, non da questa estensione.

Progetto indipendente: **non affiliato a NVIDIA, Mozilla, YouTube/Google o agli autori di DLSS5-Swapper**.

## Funzionalità

- **Diagnostica video YouTube**: mostra dimensioni sorgente, dimensione visualizzata e fattore di ingrandimento del tag `<video>`. **Non** misura l'attivazione di RTX Video Super Resolution.
- **Regolazioni opzionali**: nitidezza sperimentale (SVG), contrasto, saturazione e luminosità, disattivate per impostazione predefinita.
- **Modalità cinema** automatica per il player YouTube.
- **Guida integrata** per abilitare RTX Video Super Resolution dalla NVIDIA App.
- **Bridge Windows facoltativo**: verifica l'eseguibile DLSS5-Swapper e lo avvia dal popup con un click, usando Firefox Native Messaging.
- **Niente account, analytics o server propri**. Le preferenze sono salvate localmente.

## Cosa non fa

| Funzione | Supportata? |
| --- | --- |
| Diagnostica risoluzione YouTube | ✅ |
| Filtri CSS/SVG opzionali | ✅ |
| Aprire DLSS5-Swapper tramite bridge locale | ✅ (Windows, configurazione richiesta) |
| Abilitare automaticamente NVIDIA RTX Video | ❌ |
| Applicare NVIDIA DLSS 5 ai frame di Firefox/YouTube | ❌ |
| Scaricare o installare DLSS5-Swapper | ❌ |
| Iniettare o sostituire DLL di Firefox | ❌ |

## Requisiti

- Firefox desktop con supporto WebExtensions Manifest V3 (per firma e distribuzione vedi [documentazione](docs/MOZILLA_SIGNING.md)).
- Per la sola estensione: **nessuna dipendenza aggiuntiva**.
- Per il bridge opzionale: **Windows 10/11, Python 3.8+ e una copia di DLSS5-Swapper installata separatamente**.
- Per RTX Video Super Resolution: GPU NVIDIA RTX e driver/configurazione compatibili, secondo la [guida ufficiale NVIDIA](https://nvidia.custhelp.com/app/answers/detail/a_id/5448/).

## Installazione rapida: sviluppo (senza firma)

1. Clona il repository oppure usa **Code → Download ZIP** su GitHub, quindi estrai l'archivio.
2. Apri Firefox e visita `about:debugging` → **Questo Firefox** → **Carica componente aggiuntivo temporaneo**.
3. Seleziona **`extension/manifest.json`**.
4. Apri un video YouTube e clicca sull'icona dell'estensione.

Un'estensione temporanea viene rimossa quando Firefox si chiude: per l'installazione permanente occorre una **firma Mozilla**; vedi [docs/MOZILLA_SIGNING.md](docs/MOZILLA_SIGNING.md). La dicitura «Andr995» è **l'attribuzione dell'autore**, non una firma crittografica.

### Opzionale: collega DLSS5-Swapper

1. Scarica DLSS5-Swapper **dalla fonte originale**, autonomamente: https://github.com/rakanki911/DLSS5-Swapper (software separato, non incluso).
2. Dal repository estratto, apri PowerShell ed esegui:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\bridge-windows\install.ps1
```

3. Se non viene trovato l'EXE, crea `bridge-windows/swapper_path.txt` copiando l'esempio `bridge-windows/swapper_path.txt.example`; sostituisci il percorso, poi riesegui l'installazione.
4. Riavvia Firefox; se l'estensione è temporanea, ricaricala da `about:debugging`.
5. Nel popup premi **Verifica collegamento** e poi, se disponibile, **Apri DLSS5-Swapper**.

**Il pulsante apre il programma: NON attiva DLSS 5 su YouTube.** Per disinstallare il bridge: `powershell -NoProfile -ExecutionPolicy Bypass -File .\bridge-windows\uninstall.ps1`.

Leggi anche il [README del bridge](bridge-windows/README.md).

## Struttura del repository

```text
rtx-video-companion-firefox-andr995/
├── extension/                  # Estensione Firefox (sorgente, icone e manifest)
│   ├── icons/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── bridge-windows/             # Native Messaging host opzionale
│   ├── host.py
│   ├── install.ps1
│   ├── uninstall.ps1
│   ├── swapper_path.txt.example
│   └── README.md
├── tests/                      # Test del bridge e del manifest
├── scripts/                    # Packaging ZIP per Mozilla
├── docs/                       # Privacy e firma Mozilla
├── .github/workflows/ci.yml    # Test e ZIP unsigned su push/PR
├── .gitignore
├── LICENSE                     # MIT · Andr995
├── AUTHORS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── README.md
```

## Build e test

**Prerequisito:** Python 3.8+ (per il packaging, non per usare l'estensione).

```bash
python -m unittest discover -s tests -v
python scripts/package_extension.py
```

Il secondo comando crea il pacchetto **`dist/rtx-video-companion-firefox-v1.1.1-unsigned.zip`**, con i file dell'estensione **alla radice**, pronto da sottoporre al [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/) per firma/revisione (non è firmato!). Il repository completo va su GitHub; non caricare il repository completo come estensione Mozilla.

Se Node.js è presente, puoi verificare anche la sintassi degli script:

```bash
node --check extension/content.js
node --check extension/popup.js
```

Non ci sono dipendenze JS, npm o framework; le GitHub Actions eseguono test e producono il pacchetto unsigned come artifact CI.

## Privacy e sicurezza

L'estensione salva le impostazioni con `browser.storage.local` e non effettua chiamate di rete proprie per inviare i dati dell'utente. Il bridge usa IPC locale e apre soltanto l'eseguibile configurato; nessun invio dei video a terzi. I link esterni nella UI vengono aperti solo quando cliccati. Permessi WebExtension: `storage`, `activeTab`, `nativeMessaging`, e accesso alle sole pagine YouTube. Vedi [PRIVACY.md](docs/PRIVACY.md) e [SECURITY.md](SECURITY.md).

## Documentazione e riconoscimenti

- [Native Messaging – MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
- [Firma e distribuzione estensioni – Mozilla](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- [RTX Video – NVIDIA](https://nvidia.custhelp.com/app/answers/detail/a_id/5448/)
- [DLSS5-Swapper, progetto esterno](https://github.com/rakanki911/DLSS5-Swapper)

**Autore / maintainer:** Andr995 · **Licenza:** [MIT](LICENSE) · [Changelog](CHANGELOG.md)
