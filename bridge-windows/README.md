# Bridge Windows: DLSS5-Swapper

Bridge **opzionale**, scritto in Python 3.8+ e composto esclusivamente da librerie standard.

Comunica con l'estensione Firefox attraverso **Native Messaging**, registra un host in `HKCU` e consente **solo** due operazioni:

- `status`: verifica se esiste un eseguibile di DLSS5-Swapper;
- `launch`: avvia quell'eseguibile, su richiesta esplicita dal pulsante dell'estensione.

**Non modifica Firefox, non inietta DLSS e non processa i video YouTube.**

## Installa

Da PowerShell, nella radice del repository:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\bridge-windows\install.ps1
```

Se il programma non viene rilevato, copia `swapper_path.txt.example` come `swapper_path.txt` e inserisci **solo** il percorso completo dell'eseguibile di DLSS5-Swapper. Il nome del file deve contenere `dlss` e `swapper`. Poi ripeti il comando d'installazione.

Il bridge viene copiato in `%LOCALAPPDATA%\RTXVideoCompanionBridge`. Il manifest viene registrato in `HKCU\Software\Mozilla\NativeMessagingHosts\org.rtx_companion.dlss5swapper`, senza richiedere privilegi amministrativi.

**Attenzione:** esegui lo script solo dopo averne letto il contenuto. Lo script `install.ps1` non scarica programmi e non installa DLSS5-Swapper.

## Disinstalla

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\bridge-windows\uninstall.ps1
```

## Sicurezza e compatibilità

- Il bridge accetta soltanto `status` e `launch` e **ignora** argomenti come URL, file di video o comandi arbitrari.
- L'identificativo `allowed_extensions` è legato a `extension/manifest.json`; se cambi l'ID, aggiornalo anche in `install.ps1`.
- Il lancio dell'eseguibile non è una misura di miglioramento video o compatibilità DLSS.
- Non esistono dipendenze Python di terze parti.
- Test statici e del protocollo eseguibili su qualsiasi OS; integrazione con Firefox e Windows da verificare sul PC dell'utente.
