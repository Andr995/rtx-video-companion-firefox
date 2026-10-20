# Informativa privacy del progetto

**RTX Video Companion for Firefox** — maintainer: Andr995.

- **Dati raccolti dal progetto:** nessuno. Non è presente alcuna telemetria, servizio remoto, account o tracciamento.
- **Impostazioni locali:** i controlli UI (filtri e modalità cinema) vengono salvati nella memoria locale dell'estensione (`browser.storage.local`).
- **Accesso a YouTube:** il content script osserva le dimensioni del player e applica filtri locali, senza trasmettere il contenuto del video.
- **Bridge Windows:** usa Firefox Native Messaging su canali locali. La verifica e l'avvio si limitano alla presenza dell'eseguibile; il bridge non legge né carica video online.
- **Link a terzi:** il popup contiene link esterni di documentazione; aprirli è una scelta dell'utente. I relativi siti hanno proprie policy.
- **Servizi terzi:** Firefox, YouTube, NVIDIA App e DLSS5-Swapper non sono controllati da questo progetto e possono avere politiche proprie.
- **Disinstallazione:** rimuovere l'estensione da Firefox; per cancellare il bridge, eseguire `bridge-windows/uninstall.ps1`.

Questa pagina descrive la versione open source distribuita nel repository, non software modificato da terzi.
