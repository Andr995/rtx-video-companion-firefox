# Contribuire

Grazie per voler contribuire! Puoi aprire issue e pull request per migliorare il codice.

1. Parti da un branch dedicato e descrivi il cambiamento nell'issue/PR.
2. Evita di introdurre codice che sostituisce DLL, aggira protezioni o esegue comandi arbitrari dal browser.
3. Mantieni le funzioni **launcher** chiaramente distinte da una vera pipeline video AI.
4. Aggiorna README e test per ogni modifica di manifest, bridge o permessi.
5. Esegui `python -m unittest discover -s tests -v` e `python scripts/package_extension.py` prima di inviare una PR.
6. Non includere credenziali, installer di terze parti o file locali come `swapper_path.txt`.

Licenza per i contributi: MIT, come il progetto. Maintainer: **Andr995**.
