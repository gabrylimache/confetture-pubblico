# Confetture Pubblico

Sito pubblico, statico, dell'evento **Confetture**: l'ultima scaletta pubblicata (provvisoria o ufficiale), filtrabile per musicista, con i PDF scaricabili — generale e per ciascun musicista.

Repository **pubblico** per scelta tecnica (GitHub Pages, piano gratuito, lo richiede), ma per costruzione non contiene mai dati privati: solo ciò che è già pensato per essere visibile a chiunque abbia il link.

Link Live: https://gabrylimache.github.io/confetture-pubblico/

---

## Indice

- [Cos'è questo sito](#cosè-questo-sito)
- [Collegamento con Confetture Manager](#collegamento-con-confetture-manager)
- [Struttura del repository](#struttura-del-repository)
- [Configurazione iniziale (una tantum)](#configurazione-iniziale-una-tantum)
- [Come viene aggiornato il sito](#come-viene-aggiornato-il-sito)
- [Verificare che tutto funzioni](#verificare-che-tutto-funzioni)
- [Risoluzione dei problemi](#risoluzione-dei-problemi)
- [Sicurezza e privacy](#sicurezza-e-privacy)
- [Modificare l'aspetto del sito](#modificare-laspetto-del-sito)

---

## Cos'è questo sito

Una pagina che mostra, per l'evento Confetture:

- l'intestazione con nome della Confettura, data dell'evento, stato (**Provvisoria** o **Ufficiale**) e istante dell'ultima pubblicazione;
- la scaletta completa, brano per brano, con lo strumento e il musicista assegnato a ciascuno slot (gli slot ancora non bloccati sono segnalati con un asterisco, quelli non assegnati come "da assegnare" — stessa logica del PDF);
- un filtro per vedere, per ciascun musicista, solo i brani che lo riguardano;
- il download del **PDF generale** e del **PDF personale** di ciascun musicista.

Non c'è un'applicazione dietro: solo HTML, CSS e un po' di JavaScript che legge un file JSON. Nessun server, nessun database, nessuna logica di assegnazione — tutto quel lavoro avviene altrove, in **Confetture Manager**.

## Collegamento con Confetture Manager

**Non esiste una connessione "live" tra i due repository.** Il PC su cui gira Confetture Manager è in una rete domestica, dietro NAT: nessuno, da Internet, può raggiungerlo — ed è bene che sia così. Il collegamento funziona quindi nella direzione opposta, e solo in un momento preciso, deciso dall'amministratore:

```
┌─────────────────────────────┐   al click "Pubblica sul sito"    ┌──────────────────────────┐
│   Confetture Manager         │ ─────────────────────────────────►│   Confetture Pubblico     │
│   (app privata, locale,      │  GitHub Contents API (HTTPS,      │   (questo repository,     │
│    Docker, sul PC admin)     │  token con permessi limitati)     │    GitHub Pages)          │
└─────────────────────────────┘                                    └──────────────────────────┘
```

In pratica:

1. Nell'applicazione admin, l'amministratore prepara la scaletta e crea uno **snapshot** (una fotografia immutabile, provvisoria o ufficiale).
2. Quando preme **"Pubblica sul sito"**, l'app admin genera i PDF necessari e invia i file aggiornati (`data/latest.json` e i PDF in `pdfs/`) **a questo repository**, tramite chiamate HTTPS alle API di GitHub — non `git push` manuale, non FTP, non altro.
3. GitHub ricostruisce automaticamente il sito (di norma in pochi secondi, talvolta fino a un minuto) e la pagina pubblica mostra la nuova scaletta.

**Conseguenze pratiche:**

- Il sito resta **sempre consultabile**, anche a PC dell'amministratore spento: mostra l'ultimo contenuto ricevuto.
- Questo repository non cambia mai "a sorpresa": solo quando, dall'altra parte, viene premuto deliberatamente "Pubblica sul sito".
- Non c'è alcuna area riservata qui: tutto ciò che arriva è, per definizione, già pubblico — l'app admin filtra ogni dato privato (e-mail, affidabilità, note interne, candidature) prima dell'invio.
- Il token usato per scrivere in questo repository ha permessi **limitati a questo solo repository**: anche se compromesso, non dà accesso a nient'altro.

Se il sito risultasse disallineato rispetto a quanto preparato nell'app admin, la soluzione è sempre la stessa: tornare lì e premere di nuovo "Pubblica sul sito". Questo repository non si corregge mai a mano.

## Struttura del repository

```
confetture-pubblico/
├─ index.html        ← pagina principale: scaletta, filtro per musicista, link ai PDF
├─ app.js            ← legge data/latest.json e costruisce la pagina
├─ style.css         ← aspetto grafico
├─ data/
│  └─ latest.json    ← dati dell'ultimo snapshot pubblicato (sovrascritto ad ogni pubblicazione)
└─ pdfs/
   ├─ scaletta-generale.pdf
   └─ scaletta-<musicista>.pdf   ← uno per ciascun musicista con assegnazioni nello snapshot
```

Non c'è alcun processo di build: i file in questo repository sono esattamente quelli serviti da GitHub Pages, così come sono.

## Configurazione iniziale (una tantum)

Fatta una sola volta, quando si decide di attivare la pubblicazione.

### 1. Repository pubblico

Il repository va impostato come **pubblico** — requisito di GitHub Pages sul piano gratuito, non una scelta facoltativa.

### 2. Attivare GitHub Pages

`Settings → Pages → Build and deployment → Source: Deploy from a branch`, branch `main`, cartella `/ (root)`. GitHub mostrerà qui l'URL pubblico del sito (es. `https://tuoutente.github.io/confetture-pubblico/`).

### 3. File iniziali

`index.html`, `app.js`, `style.css` e le cartelle `data/` e `pdfs/` (anche vuote, con un segnaposto). Da qui in poi `data/latest.json` e i PDF li aggiorna solo l'app admin.

### 4. Token di accesso

Dal proprio account GitHub (non da questo repository): `Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token`.

- **Repository access**: solo questo repository.
- **Permissions**: `Contents` → **Read and write**. Nient'altro.

Il token va configurato **nell'altro repository**, `confetture-manager`, nel suo file `.env` locale (`GH_PAGES_REPO`, `GH_PAGES_TOKEN`) — mai qui.

## Come viene aggiornato il sito

**Non si aggiorna mai a mano.** L'unico modo corretto è dall'applicazione admin, con "Pubblica sul sito". Qualunque modifica manuale a `data/latest.json` o ai file in `pdfs/` verrebbe **sovrascritta** alla pubblicazione successiva. Le uniche modifiche sensate da fare qui a mano sono quelle di aspetto grafico — vedi [Modificare l'aspetto del sito](#modificare-laspetto-del-sito).

## Verificare che tutto funzioni

1. Apri l'URL pubblico (lo trovi in `Settings → Pages` di questo repository).
2. Dovresti vedere l'ultima scaletta pubblicata, con la dicitura "Provvisoria" o "Ufficiale" ben visibile.
3. Prova il filtro per musicista e il download di un PDF.
4. Appena pubblicato dall'app admin e non vedi ancora la novità: attendi fino a un minuto e ricarica ignorando la cache (`Ctrl+F5`).

## Risoluzione dei problemi

**Pagina vuota o errore** — Controlla che `data/latest.json` esista e sia un JSON valido (aprilo direttamente nel browser: `.../data/latest.json`). Se manca, non è ancora mai stata fatta una pubblicazione.

**Ho pubblicato dall'app admin ma il sito non cambia** — Attendi un minuto, poi `Ctrl+F5`. Se persiste, controlla nell'app admin l'esito di "Pubblica sul sito": un token scaduto produce un errore visibile lì, non qui.

**Un PDF risulta vecchio** — Stesso discorso della cache: `Ctrl+F5` o finestra anonima.

**"GitHub Pages is not available"** — Il repository è stato reso privato per errore: riportalo pubblico da `Settings → General`.

## Sicurezza e privacy

- Repository **pubblico di proposito**: non caricarci mai nulla che non sia già destinato alla vista di chiunque.
- Nessun segreto qui: il token che scrive in questo repository vive **nell'altro repository**, privato, nel suo `.env` locale.
- I dati pubblicati sono già filtrati a monte (niente e-mail, affidabilità, note interne, candidature): questo repository non deve mai ricevere altro.
- Richiesta di rimozione di un musicista: si interviene **nell'app admin** (correzione + nuova pubblicazione), mai modificando questo repository direttamente.

## Modificare l'aspetto del sito

Il sito è volutamente semplice: HTML, CSS, un po' di JavaScript, senza framework né build.

1. Clona il repository, modifica `index.html` / `style.css` / `app.js`.
2. Prova le modifiche in locale con un qualsiasi server statico (es. l'estensione "Live Server" di VS Code), puntando a un `data/latest.json` di prova.
3. Mantieni invariato il formato di `data/latest.json` descritto in `docs/04-pubblicazione-github-pages.md` del repository `confetture-manager`: è l'unico "contratto" tra le due applicazioni.
4. `git push` su `main`: GitHub Pages ricostruisce il sito in automatico.

A differenza di `confetture-manager`, questo sito **non ha vincoli di funzionamento offline**: vivendo su Internet, può caricare liberamente font o librerie da CDN, se un giorno servisse arricchirne l'aspetto.
