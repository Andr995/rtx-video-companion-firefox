# Firma Mozilla: distribuzione dell'estensione

## Identità e firma sono due cose distinte

`Andr995` compare nel codice e nel manifest come **autore**. Per un'installazione permanente nella versione standard di Firefox, serve inoltre la **firma digitale ufficiale emessa da Mozilla**.

## Preparare il pacchetto

Dalla radice del repository:

```bash
python -m unittest discover -s tests -v
python scripts/package_extension.py
```

Il risultato nella directory `dist/` contiene **solo** il contenuto di `extension/`, con `manifest.json` direttamente alla radice dello ZIP.

## Richiedere la firma

1. Accedi a [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Invia la nuova estensione e scegli **On your own** (non elencata / unlisted) se vuoi distribuire da te il componente.
3. Carica lo ZIP nella cartella `dist` e completa la revisione richiesta da Mozilla.
4. Solo dopo l'eventuale approvazione, scarica l'XPI **firmato** e installalo su Firefox.

**Non rinominare semplicemente lo ZIP in XPI aspettandoti che diventi firmato.** GitHub e la firma MIT non sostituiscono la firma crittografica Mozilla.

## Considerazioni

- Identificativo dell'estensione: `rtx-video-companion@example.org`, mantenuto per compatibilità con il bridge. Deve coincidere con `allowed_extensions` nel manifest dell'host Windows creato da `install.ps1`.
- Il manifest include la dichiarazione `data_collection_permissions: ["none"]` prevista da Mozilla per nuove estensioni che non raccolgono o trasmettono dati.
- Il bridge Windows **non è incluso nel pacchetto dell'estensione** e va installato separatamente dagli utenti.
- Firma e revisione finale dipendono da Mozilla; il repository non è una prova di approvazione.

Fonti: [Mozillla Extension Workshop](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/), [MDN Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging).
