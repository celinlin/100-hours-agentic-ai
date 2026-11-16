import type { ChapterGame } from '../types';

/**
 * 13 · Putting it into service — "The boiler room".
 * Every activity comes from the programme's step 13 (the service loop, the key read from the
 * environment, bounded retries with a doubling delay, the daily budget checked before the call,
 * useful alerts, tests before every update and a one-command rollback; the Claude API error codes;
 * the Break / Fix cases: leaked key, runaway retries, a request giving an order; the reference code
 * `appeler`), plus formation-ia-gratuite notions: automating repetitive tasks, planning first AI
 * projects, choosing a tool for the need (generate, automate, RPA).
 */
const ch13: ChapterGame = {
  id: '13',
  room: {
    name: { fr: 'La chaufferie', en: 'The boiler room' },
    style: { wall: '#3e3326', wallDeep: '#31281e', floor: '#6a4a2c', accent: '#94672a', motif: 'grid' },
  },
  capability: {
    fr: 'Rester en service sans surveillance : clé hors du code, essais bornés, budget vérifié avant l’appel, alerte utile et retour arrière en une commande.',
    en: 'Stay in service unattended: key outside the code, bounded retries, budget checked before the call, a useful alert and a one-command rollback.',
  },
  intro: {
    guest: 'Mme Lindqvist',
    request: {
      fr: 'Il est 3 h du matin. Pouvez-vous me réserver un taxi pour 5 h ?',
      en: 'It is 3 am. Could you book me a taxi for 5 am?',
    },
    guess: {
      fr: 'L’API du modèle répond 529 : surchargée. Un service mal préparé répond quand même : « C’est noté, votre taxi est réservé. » Rien n’a été réservé.',
      en: 'The model’s API answers 529: overloaded. A badly prepared service replies anyway: “Noted, your taxi is booked.” Nothing was booked.',
    },
    tools: [
      {
        id: 'attendre',
        label: { fr: 'reessayer(max=3, delai=2**essai)', en: 'reessayer(max=3, delai=2**essai)' },
        result: {
          fr: 'Essai 1 : 529. Attente 1 s. Essai 2 : réponse reçue. Le taxi est demandé, la trace est écrite.',
          en: 'Attempt 1: 529. Wait 1 s. Attempt 2: response received. The taxi is requested, the trace is written.',
        },
      },
      {
        id: 'marteler',
        label: { fr: 'reessayer(max=None, delai=0)', en: 'reessayer(max=None, delai=0)' },
        result: {
          fr: 'Des dizaines d’appels en une minute, sans pause : la surcharge s’aggrave, et toujours pas de réponse.',
          en: 'Dozens of calls in a minute, with no pause: the overload gets worse, and still no answer.',
        },
      },
      {
        id: 'cle',
        label: { fr: 'changer_cle()', en: 'changer_cle()' },
        result: {
          fr: 'La clé était valide. Un 529 vient d’une surcharge de l’API, pas de toi : rien n’a changé.',
          en: 'The key was valid. A 529 comes from an overloaded API, not from you: nothing changed.',
        },
      },
    ],
    correct: 'attendre',
    answer: {
      fr: 'C’est fait, Mme Lindqvist : votre taxi est demandé pour 5 h. Si les trois essais avaient échoué, je vous l’aurais dit, et la réception aurait reçu une alerte.',
      en: 'Done, Ms Lindqvist: your taxi is requested for 5 am. Had all three attempts failed, I would have told you, and the front desk would have received an alert.',
    },
    wrongTool: {
      fr: 'Cela ne soigne pas une surcharge passagère. Il faut réessayer peu de fois, en laissant le délai grandir.',
      en: 'This does not cure a temporary overload. Retry a few times, letting the delay grow.',
    },
    lesson: {
      model: {
        fr: 'n’est pas toujours joignable : son API répond parfois 429 ou 529. C’est une panne passagère, pas une réponse.',
        en: 'is not always reachable: its API sometimes answers 429 or 529. That is a temporary failure, not an answer.',
      },
      call: {
        fr: 'se réessaie trois fois au plus, avec un délai qui double. C’est le code du service qui compte les essais.',
        en: 'is retried three times at most, with a doubling delay. The service’s code counts the attempts.',
      },
      result: {
        fr: 'revient, ou ne revient pas. Sans résultat : abandon propre et alerte, jamais une réponse inventée.',
        en: 'comes back, or does not. Without a result: a clean give-up and an alert, never an invented answer.',
      },
    },
  },
  skills: [
    { fr: 'Faire passer chaque demande par la boucle de service : budget, essais, abandon propre, alerte', en: 'Run every request through the service loop: budget, retries, clean give-up, alert' },
    { fr: 'Garder la clé d’API dans l’environnement, jamais dans le code ni le dépôt', en: 'Keep the API key in the environment, never in the code or the repository' },
    { fr: 'Réagir à un 429, un 529, un 500 ou un 401 sans aggraver la panne', en: 'React to a 429, 529, 500 or 401 without making the outage worse' },
    { fr: 'Publier une mise à jour après les 35 tests, et revenir en arrière en une commande', en: 'Ship an update after the 35 tests, and roll back in one command' },
    { fr: 'Choisir l’outil selon le besoin et planifier un premier projet avec responsable, date et critère d’arrêt', en: 'Pick the tool for the need and plan a first project with an owner, a date and a stop criterion' },
  ],
  notions: [
    { fr: 'Automatiser les tâches répétitives', en: 'Automating repetitive tasks' },
    { fr: 'Planifier ses premiers projets IA (feuille de route, responsables, dates, critères d’arrêt)', en: 'Planning your first AI projects (roadmap, owners, dates, stop criteria)' },
    { fr: 'Choisir l’outil selon le besoin : générer, automatiser, RPA', en: 'Choosing the tool for the need: generate, automate, RPA' },
  ],
  stations: [
    {
      id: 'loop',
      prop: 'c13_boiler',
      at: { x: 800, y: 690 },
      everyday: {
        analogy: { fr: 'Une chaudière tourne la nuit sans personne : un thermostat, une soupape de sécurité, un voyant d’alarme. Chaque panne a sa sortie prévue.', en: 'A boiler runs at night with nobody around: a thermostat, a safety valve, a warning light. Every failure has its planned way out.' },
        limit: { fr: 'Une soupape réagit à une pression. Un agent peut aussi répondre faux sans aucune erreur : ces contrôles n’attrapent pas cela, ce sont les tests qui le font.', en: 'A valve reacts to pressure. An agent can also answer wrongly with no error at all: these checks do not catch that, the tests do.' },
      },
      object: { fr: 'La chaudière', en: 'The boiler' },
      title: { fr: 'La boucle de service', en: 'The service loop' },
      show: {
        fr: 'En service, personne ne regarde. Chaque demande passe les mêmes contrôles, pour qu’une panne sorte par une porte connue.',
        en: 'In service, nobody is watching. Every request goes through the same checks, so that a failure leaves through a known door.',
      },
      mechanic: {
        kind: 'stepper',
        prompt: { fr: 'Suis une demande de nuit, étape par étape.', en: 'Follow a night-time request, step by step.' },
        steps: [
          { actor: 'guest', label: { fr: 'La demande arrive', en: 'The request arrives' }, detail: { fr: '02:05, « Prépare le brief de jeudi. » Elle reçoit un identifiant : req-052. Personne ne regarde.', en: '02:05, “Prepare Thursday’s brief.” It gets an identifier: req-052. Nobody is watching.' } },
          { actor: 'system', label: { fr: 'Le budget passe d’abord', en: 'The budget comes first' }, detail: { fr: 'Dépense du jour : 3,80 € sur 5 €. Le plafond n’est pas atteint : l’appel est permis.', en: 'Spend today: €3.80 out of €5. The cap is not reached: the call is allowed.' } },
          { actor: 'model', label: { fr: 'L’API du modèle sature', en: 'The model’s API is overloaded' }, detail: { fr: 'Réponse : 529 overloaded_error. Une panne passagère, écrite dans la trace.', en: 'Response: 529 overloaded_error. A temporary failure, written to the trace.' } },
          { actor: 'system', label: { fr: 'Le service réessaie', en: 'The service retries' }, detail: { fr: 'Attente 1 s, puis 2 s, puis 4 s. Trois essais au plus, et les trois échouent.', en: 'Wait 1 s, then 2 s, then 4 s. Three attempts at most, and all three fail.' } },
          { actor: 'system', label: { fr: 'Abandon propre', en: 'Clean give-up' }, detail: { fr: 'Le service ne renvoie aucun brief : il dit que la demande a échoué. Rien n’est inventé.', en: 'The service returns no brief: it says the request failed. Nothing is invented.' } },
          { actor: 'tool', label: { fr: 'L’alerte part', en: 'The alert goes out' }, detail: { fr: '« 02:05 · req-052 · API indisponible après trois essais · relancer la demande au matin. »', en: '“02:05 · req-052 · API unavailable after three attempts · rerun the request in the morning.”' } },
          { actor: 'human', label: { fr: 'La personne de garde lit', en: 'The person on call reads' }, detail: { fr: 'Au matin, elle sait quoi, quand, et quoi faire. Elle relance req-052.', en: 'In the morning, she knows what, when, and what to do. She reruns req-052.' } },
        ],
        check: {
          kind: 'choice',
          prompt: { fr: 'Les trois essais ont échoué. Que doit faire le service ?', en: 'All three attempts failed. What must the service do?' },
          options: [
            { id: 'clean', label: { fr: 'Abandonner proprement : dire l’échec, écrire la trace, envoyer une alerte', en: 'Give up cleanly: state the failure, write the trace, send an alert' }, correct: true, why: { fr: 'Exact. La panne sort par une porte connue, et quelqu’un est prévenu.', en: 'Right. The failure leaves through a known door, and someone is warned.' } },
            { id: 'invent', label: { fr: 'Renvoyer un brief approximatif pour ne pas laisser l’utilisatrice sans rien', en: 'Return an approximate brief so the user is not left with nothing' }, correct: false, why: { fr: 'Un abandon propre vaut mieux qu’une réponse inventée : Inès préparerait jeudi sur du faux.', en: 'A clean give-up beats an invented answer: Inès would prepare Thursday on false information.' } },
            { id: 'forever', label: { fr: 'Réessayer sans limite jusqu’à ce que ça passe', en: 'Retry without limit until it goes through' }, correct: false, why: { fr: 'Des essais sans borne aggravent la surcharge et peuvent tourner toute la nuit.', en: 'Unbounded retries worsen the overload and can run all night.' } },
          ],
        },
      },
      then: {
        kind: 'order',
        prompt: { fr: 'Remets dans l’ordre le trajet d’une demande.', en: 'Put a request’s journey in order.' },
        items: [
          { id: 'in', label: { fr: 'La demande arrive, avec un identifiant', en: 'The request arrives, with an identifier' } },
          { id: 'budget', label: { fr: 'Le budget du jour est vérifié avant l’appel', en: 'The daily budget is checked before the call' }, hint: { fr: 'Vérifié après l’appel, le plafond arrive trop tard.', en: 'Checked after the call, the cap comes too late.' } },
          { id: 'work', label: { fr: 'L’agent travaille, ses traces s’écrivent', en: 'The agent works, its traces are written' } },
          { id: 'retry', label: { fr: 'En cas d’erreur : nouvel essai, puis abandon propre', en: 'On error: a new attempt, then a clean give-up' }, hint: { fr: 'On ne réessaie qu’après une erreur survenue pendant le travail.', en: 'You only retry after an error during the work.' } },
          { id: 'alert', label: { fr: 'Une alerte part si un seuil est franchi', en: 'An alert goes out if a threshold is crossed' } },
        ],
      },
      takeaway: {
        fr: 'Ce qui marche chez toi doit marcher sans toi. Un abandon propre, avec alerte et trace, vaut mieux qu’une réponse inventée.',
        en: 'What works on your machine must work without you. A clean give-up, with an alert and a trace, beats an invented answer.',
      },
      more: {
        fr: 'Une alerte utile est rare et précise : elle dit quoi, quand, et quoi faire. Si tu en reçois dix par jour, tu n’en liras plus aucune.\nNote chaque jour dans le relevé du service : demandes, échecs, dépense. Exemple du programme : lundi, 1 échec sur 40, 4,10 €.',
        en: 'A useful alert is rare and precise: it says what, when, and what to do. If you get ten a day, you will stop reading them.\nEvery day, note in the service log: requests, failures, spend. The programme’s example: Monday, 1 failure out of 40, €4.10.',
      },
    },
    {
      id: 'code',
      prop: 'c13_valves',
      at: { x: 520, y: 470 },
      everyday: {
        analogy: { fr: 'La clé de la maison ne s’écrit pas sur la porte : elle reste dans ta poche. Et quand une ligne sonne occupé, tu rappelles trois fois en espaçant, pas cent fois de suite.', en: 'You do not write the house key on the door: it stays in your pocket. And when a line is busy, you call back three times, spaced out, not a hundred times in a row.' },
        limit: { fr: 'Une variable d’environnement n’est pas un coffre-fort : tout programme lancé dans le même environnement peut la lire. Elle évite surtout que la clé parte dans le dépôt.', en: 'An environment variable is not a safe: any program started in the same environment can read it. Above all, it keeps the key out of the repository.' },
      },
      object: { fr: 'Le tableau des vannes', en: 'The valve board' },
      title: { fr: 'La clé dehors, les essais bornés', en: 'Key outside, retries bounded' },
      show: {
        fr: 'Voici le service du code de référence. La clé vit dans une variable d’environnement, le plafond passe avant l’appel, et les essais sont comptés.',
        en: 'Here is the service from the reference code. The key lives in an environment variable, the cap comes before the call, and attempts are counted.',
      },
      mechanic: {
        kind: 'fill',
        prompt: { fr: 'Règle chaque vanne du code.', en: 'Set each valve of the code.' },
        code: true,
        template: {
          fr: 'CLE = {{0}}\nif not CLE:\n    raise SystemExit("Clé absente : définis ANTHROPIC_API_KEY.")\nclient = anthropic.Anthropic(api_key=CLE, max_retries={{1}})\n\ndef appeler(depense: float, budget: float, **demande):\n    if depense {{2}} budget:\n        alerter("Budget du jour atteint")  # avant l\'appel\n        return None\n    for essai in range(3):\n        try:\n            return client.messages.create(**demande)\n        except (anthropic.RateLimitError,\n                anthropic.InternalServerError) as e:\n            ecrire(evenement="erreur", nom="api", detail=str(e)[:200])\n            time.sleep({{3}})  # 1 s, 2 s, 4 s\n    alerter("API indisponible après trois essais")\n    return {{4}}  # abandon propre',
          en: 'CLE = {{0}}\nif not CLE:\n    raise SystemExit("Clé absente : définis ANTHROPIC_API_KEY.")\nclient = anthropic.Anthropic(api_key=CLE, max_retries={{1}})\n\ndef appeler(depense: float, budget: float, **demande):\n    if depense {{2}} budget:\n        alerter("Budget du jour atteint")  # avant l\'appel\n        return None\n    for essai in range(3):\n        try:\n            return client.messages.create(**demande)\n        except (anthropic.RateLimitError,\n                anthropic.InternalServerError) as e:\n            ecrire(evenement="erreur", nom="api", detail=str(e)[:200])\n            time.sleep({{3}})  # 1 s, 2 s, 4 s\n    alerter("API indisponible après trois essais")\n    return {{4}}  # abandon propre',
        },
        blanks: [
          {
            options: ['os.environ.get("ANTHROPIC_API_KEY")', '"sk-ant-api03-…"', 'config["cle"]'],
            answer: 'os.environ.get("ANTHROPIC_API_KEY")',
            why: { fr: 'La clé est lue dans l’environnement : ni dans le code, ni dans le fichier de configuration, donc jamais dans le dépôt.', en: 'The key is read from the environment: not in the code, not in the config file, so never in the repository.' },
          },
          {
            options: ['0', '2', '10'],
            answer: '0',
            why: { fr: 'Le SDK réessaie déjà tout seul (2 fois par défaut). À 0, ta boucle est la seule à compter les essais : pas de 3 × 3 appels cachés.', en: 'The SDK already retries on its own (twice by default). At 0, your loop is the only one counting attempts: no hidden 3 × 3 calls.' },
          },
          {
            options: ['>=', '<', '=='],
            answer: '>=',
            why: { fr: 'Dès que la dépense atteint le budget, on refuse avant d’appeler : une boucle folle coûte au plus le budget du jour.', en: 'As soon as spend reaches the budget, refuse before calling: a runaway loop costs at most the daily budget.' },
          },
          {
            options: ['2 ** essai', '0', 'essai'],
            answer: '2 ** essai',
            why: { fr: '1 s, 2 s, 4 s : le délai double à chaque essai, pour ne pas aggraver la saturation.', en: '1 s, 2 s, 4 s: the delay doubles at each attempt, so as not to worsen the overload.' },
          },
          {
            options: ['None', '"Rendez-vous confirmé."', 'appeler(depense, budget, **demande)'],
            answer: 'None',
            why: { fr: 'Abandon propre : une alerte, une trace, et aucune réponse inventée. Se rappeler soi-même relancerait les essais sans fin.', en: 'Clean give-up: an alert, a trace, and no invented answer. Calling itself again would restart the retries endlessly.' },
          },
        ],
      },
      takeaway: {
        fr: 'La clé vit dans l’environnement, le plafond passe avant l’appel, les essais sont trois au plus avec un délai qui double.',
        en: 'The key lives in the environment, the cap comes before the call, attempts are three at most with a doubling delay.',
      },
      more: {
        fr: 'Ce qui change d’une machine à l’autre (modèle, max_tours, budget_jour_eur, essais_max, adresse d’alerte) vit dans un fichier de configuration JSON. Jamais la clé.\nFige aussi l’environnement : python -m venv, puis activate, puis installe des versions précises, pour que l’installation soit reproductible.',
        en: 'What changes from one machine to another (model, max_tours, budget_jour_eur, essais_max, alert address) lives in a JSON config file. Never the key.\nAlso freeze the environment: python -m venv, then activate, then install pinned versions, so the setup is reproducible.',
      },
    },
    {
      id: 'errors',
      prop: 'c13_meter',
      at: { x: 250, y: 560 },
      everyday: {
        analogy: { fr: 'Au téléphone, « occupé » veut dire : rappelle plus tard. « Numéro non attribué » veut dire : rappeler ne sert à rien, corrige le numéro.', en: 'On the phone, “busy” means: call back later. “Number not in service” means: calling back is pointless, fix the number.' },
        limit: { fr: 'Un code donne la famille de l’erreur, pas sa cause exacte : un 429 peut venir des requêtes, des tokens d’entrée ou des tokens de sortie. Lis le message qui l’accompagne.', en: 'A code gives the family of the error, not its exact cause: a 429 can come from requests, input tokens or output tokens. Read the message that comes with it.' },
      },
      object: { fr: 'Le compteur de débit', en: 'The rate meter' },
      title: { fr: 'Chaque code a sa réponse', en: 'Each code has its answer' },
      show: {
        fr: 'L’API répond parfois par une erreur. Certaines sont passagères et se réessaient ; d’autres ne guériront pas en réessayant.',
        en: 'The API sometimes answers with an error. Some are temporary and can be retried; others will not heal by retrying.',
      },
      mechanic: {
        kind: 'match',
        prompt: { fr: 'Relie chaque erreur de l’API Claude à la bonne réaction.', en: 'Link each Claude API error to the right reaction.' },
        pairs: [
          { id: '429', left: { fr: '429 rate_limit_error', en: '429 rate_limit_error' }, right: { fr: 'Limite de débit atteinte : attendre (en-tête retry-after), puis réessayer', en: 'Rate limit hit: wait (retry-after header), then retry' } },
          { id: '529', left: { fr: '529 overloaded_error', en: '529 overloaded_error' }, right: { fr: 'API surchargée pour tous : réessayer, délai qui double', en: 'API overloaded for everyone: retry, doubling delay' } },
          { id: '500', left: { fr: '500 api_error', en: '500 api_error' }, right: { fr: 'Erreur interne passagère : réessayer un nombre limité de fois', en: 'Temporary internal error: retry a limited number of times' } },
          { id: '401', left: { fr: '401 authentication_error', en: '401 authentication_error' }, right: { fr: 'Clé absente ou fausse : s’arrêter, message clair, sans afficher la clé', en: 'Key missing or wrong: stop, clear message, without showing the key' } },
          { id: '400', left: { fr: '400 invalid_request_error', en: '400 invalid_request_error' }, right: { fr: 'Demande mal formée : corriger la demande, réessayer ne sert à rien', en: 'Malformed request: fix the request, retrying is pointless' } },
        ],
      },
      then: {
        kind: 'choice',
        prompt: { fr: 'Quelle alerte est utile ?', en: 'Which alert is useful?' },
        scene: {
          fr: 'Le 529 a tenu pendant les trois essais : le service abandonne req-052. Tu es de garde cette semaine, et c’est ton téléphone qui sonne.',
          en: 'The 529 lasted through all three attempts: the service gives up on req-052. You are on call this week, and it is your phone that rings.',
        },
        options: [
          { id: 'precise', label: { fr: '« 02:05 · req-052 abandonnée · 529 après trois essais · relancer au matin ; si cela se répète, voir l’état de l’API. »', en: '“02:05 · req-052 given up · 529 after three attempts · rerun in the morning; if it repeats, check the API status.”' }, correct: true, why: { fr: 'Rare et précise : elle dit quoi, quand, et quoi faire.', en: 'Rare and precise: it says what, when, and what to do.' } },
          { id: 'vague', label: { fr: '« Erreur dans le service. »', en: '“Error in the service.”' }, correct: false, why: { fr: 'Ni quoi, ni quand, ni quoi faire : il faut se lever et chercher dans les traces.', en: 'No what, no when, no what to do: you have to get up and dig through the traces.' } },
          { id: 'noisy', label: { fr: 'Une alerte à chaque essai raté, même quand l’essai suivant réussit', en: 'An alert for every failed attempt, even when the next attempt succeeds' }, correct: false, why: { fr: 'Dix alertes par jour, et tu n’en liras plus aucune. Un essai rattrapé va dans la trace, pas sur ton téléphone.', en: 'Ten alerts a day, and you will stop reading them. A recovered attempt goes to the trace, not to your phone.' } },
          { id: 'none', label: { fr: 'Aucune alerte : tout est déjà dans les traces', en: 'No alert: everything is already in the traces' }, correct: false, why: { fr: 'Personne ne lit les traces à 2 h. Sans alerte, la panne se découvre quand l’utilisatrice se plaint.', en: 'Nobody reads traces at 2 am. Without an alert, the failure is discovered when the user complains.' } },
        ],
      },
      takeaway: {
        fr: '429, 529 et 500 sont passagers : on réessaie, peu de fois, en allongeant le délai. 401 et 400 viennent de toi : réessayer ne change rien.',
        en: '429, 529 and 500 are temporary: retry, a few times, with a growing delay. 401 and 400 come from you: retrying changes nothing.',
      },
      more: {
        fr: 'Une limite de débit borne ce que ton organisation peut envoyer par minute : requêtes, tokens d’entrée, tokens de sortie. Le plafond de dépense, lui, borne ce qu’elle peut payer.\nExpérience 2 du programme : fais renvoyer un 529 par un faux client, trois fois de suite. Note combien d’essais, quel délai, et ce que voit l’utilisateur.',
        en: 'A rate limit caps what your organisation can send per minute: requests, input tokens, output tokens. The spend limit caps what it can pay.\nProgramme experiment 2: have a fake client return a 529 three times in a row. Note how many attempts, what delay, and what the user sees.',
      },
    },
    {
      id: 'tools',
      prop: 'c13_clock',
      at: { x: 1290, y: 470 },
      everyday: {
        analogy: { fr: 'En cuisine : un chef pour inventer un plat, un minuteur pour ce qui revient à heure fixe, et un commis qui refait les mêmes gestes sur le vieux four qu’on ne peut pas remplacer.', en: 'In a kitchen: a chef to invent a dish, a timer for what comes back at a fixed time, and a helper who repeats the same moves on the old oven that cannot be replaced.' },
        limit: { fr: 'Les frontières sont moins nettes qu’en cuisine : beaucoup d’outils mêlent les trois. Et un texte généré se relit, alors qu’une règle fait toujours la même chose.', en: 'The borders are less clear than in a kitchen: many tools mix the three. And generated text needs rereading, whereas a rule always does the same thing.' },
      },
      object: { fr: 'L’horloge de garde', en: 'The night-shift clock' },
      title: { fr: 'Le bon outil pour la tâche', en: 'The right tool for the task' },
      show: {
        fr: 'Toute tâche répétitive n’a pas besoin d’un agent. Générer du texte, enchaîner des applications par des règles, ou rejouer des clics dans un vieil écran sont trois métiers différents.',
        en: 'Not every repetitive task needs an agent. Generating text, chaining apps with rules, or replaying clicks on an old screen are three different jobs.',
      },
      mechanic: {
        kind: 'sort',
        prompt: { fr: 'Range chaque tâche de Brume & Quai sous l’outil qui lui convient.', en: 'Sort each Brume & Quai task under the tool that suits it.' },
        bins: [
          { id: 'gen', label: { fr: 'Générer (IA générative)', en: 'Generate (generative AI)' } },
          { id: 'auto', label: { fr: 'Automatiser (déclencheur + règles)', en: 'Automate (trigger + rules)' } },
          { id: 'rpa', label: { fr: 'RPA (rejouer des clics)', en: 'RPA (replay clicks)' } },
        ],
        items: [
          { id: 'brief', label: { fr: 'Rédiger le brief du jeudi à partir des notes', en: 'Write Thursday’s brief from the notes' }, bin: 'gen', why: { fr: 'Produire un texte nouveau à partir de sources : c’est le terrain du modèle.', en: 'Producing new text from sources: that is the model’s ground.' } },
          { id: 'summary', label: { fr: 'Résumer chaque mail long d’un client', en: 'Summarise each long client email' }, bin: 'gen', why: { fr: 'Comprendre et reformuler un texte libre demande un modèle.', en: 'Understanding and rephrasing free text needs a model.' } },
          { id: 'reminder', label: { fr: 'Envoyer un rappel la veille de chaque rendez-vous', en: 'Send a reminder the day before each meeting' }, bin: 'auto', why: { fr: 'Un déclencheur et une règle fixe : aucun besoin d’IA, et c’est plus fiable.', en: 'A trigger and a fixed rule: no AI needed, and more reliable.' } },
          { id: 'copy', label: { fr: 'Chaque lundi, copier les nouveaux rendez-vous dans un tableau', en: 'Every Monday, copy new meetings into a spreadsheet' }, bin: 'auto', why: { fr: 'Deux applications reliées par leurs API, selon un horaire : une automatisation simple.', en: 'Two apps linked through their APIs, on a schedule: a simple automation.' } },
          { id: 'legacy', label: { fr: 'Saisir les factures dans un vieux logiciel sans API', en: 'Enter invoices into an old app with no API' }, bin: 'rpa', why: { fr: 'Sans API, un robot logiciel imite les clics et la frappe dans l’interface.', en: 'Without an API, a software robot mimics clicks and typing in the interface.' } },
          { id: 'export', label: { fr: 'Exporter chaque soir un rapport depuis un portail sans API', en: 'Export a report every evening from a portal with no API' }, bin: 'rpa', why: { fr: 'Un parcours d’écrans toujours identique, sans autre accès : le cas typique de la RPA.', en: 'An always-identical screen path, with no other access: the typical RPA case.' } },
        ],
      },
      takeaway: {
        fr: 'Générer quand il faut comprendre ou écrire ; automatiser quand une règle suffit ; RPA quand seul l’écran est accessible. Le plus simple qui marche est le meilleur.',
        en: 'Generate when you need to understand or write; automate when a rule is enough; RPA when only the screen is reachable. The simplest thing that works is best.',
      },
      more: {
        fr: 'Les trois se combinent : une automatisation déclenche l’agent chaque matin, l’agent rédige le brief, et un envoi programmé le dépose. La RPA est fragile : un bouton déplacé dans l’écran suffit à la casser.',
        en: 'The three combine: an automation triggers the agent every morning, the agent writes the brief, and a scheduled send delivers it. RPA is fragile: a button moved on the screen is enough to break it.',
      },
    },
    {
      id: 'roadmap',
      prop: 'c13_plan',
      at: { x: 1075, y: 560 },
      everyday: {
        analogy: { fr: 'Un restaurant ouvre d’abord pour une seule tablée, avec un responsable en salle et une règle claire pour fermer la cuisine si le service dérape.', en: 'A restaurant first opens for a single table, with someone in charge on the floor and a clear rule for closing the kitchen if service goes wrong.' },
        limit: { fr: 'Une semaine réussie à petite échelle ne garantit pas la suite : plus d’utilisateurs, ce sont d’autres demandes, d’autres coûts, d’autres limites de débit. On mesure de nouveau à chaque étape.', en: 'A successful week at small scale does not guarantee what follows: more users means other requests, other costs, other rate limits. Measure again at every step.' },
      },
      object: { fr: 'Le tableau de route', en: 'The roadmap board' },
      title: { fr: 'Planifier une mise en service', en: 'Planning a go-live' },
      show: {
        fr: 'Un premier projet IA se planifie comme un autre : une étape à la fois, un responsable, une date, et un critère qui dit quand s’arrêter.',
        en: 'A first AI project is planned like any other: one step at a time, an owner, a date, and a criterion that says when to stop.',
      },
      mechanic: {
        kind: 'choice',
        prompt: { fr: 'Quelle fiche de projet est prête ?', en: 'Which project card is ready?' },
        scene: {
          fr: 'Inès veut que l’agent prépare ses rendez-vous pour toute l’agence. Trois fiches sont épinglées au tableau.',
          en: 'Inès wants the agent to prepare meetings for the whole agency. Three cards are pinned on the board.',
        },
        options: [
          {
            id: 'vague',
            label: { fr: '« On branche l’agent pour tout le monde, et on verra. »', en: '“We plug the agent in for everyone, and we’ll see.”' },
            correct: false,
            why: { fr: 'Ni étape, ni responsable, ni date, ni critère d’arrêt : personne ne saura si c’est un succès.', en: 'No step, no owner, no date, no stop criterion: nobody will know whether it worked.' },
          },
          {
            id: 'ready',
            label: {
              fr: '« Étape 1 : les briefs d’Inès seule, une semaine. Responsable : toi. Début : lundi. Arrêt et retour arrière si plus de 2 échecs sur 40 demandes, ou budget dépassé. »',
              en: '“Step 1: Inès’s briefs only, one week. Owner: you. Start: Monday. Stop and roll back if more than 2 failures in 40 requests, or budget exceeded.”',
            },
            correct: true,
            why: { fr: 'Exact. Un périmètre réduit d’abord, un responsable nommé, une date, et un critère d’arrêt mesurable dans le relevé du service.', en: 'Right. A narrow scope first, a named owner, a date, and a stop criterion measurable in the service log.' },
          },
          {
            id: 'nostop',
            label: { fr: '« Toute l’agence dès lundi. Responsable : l’équipe. On arrêtera si ça se passe mal. »', en: '“The whole agency from Monday. Owner: the team. We’ll stop if it goes badly.”' },
            correct: false,
            why: { fr: '« L’équipe » n’est personne, et « mal » n’est pas mesurable. Et tout le monde d’un coup, c’est la plus grosse panne possible.', en: '“The team” is nobody, and “badly” is not measurable. And everyone at once means the biggest possible outage.' },
          },
        ],
      },
      takeaway: {
        fr: 'Une feuille de route découpe le projet en étapes ; chacune a un responsable, une date et un critère d’arrêt chiffré. Le minimum du programme : une semaine en service, tests verts avant chaque mise à jour.',
        en: 'A roadmap cuts the project into steps; each has an owner, a date and a numeric stop criterion. The programme’s minimum: one week in service, tests green before every update.',
      },
      video: 'LCEmiRjPEtQ',
    },
  ],
  challenge: {
    title: { fr: 'La ronde de nuit', en: 'The night round' },
    brief: {
      fr: 'Trois épreuves avant le dernier étage : lire le relevé d’une nuit de service, publier sans tout casser, et réparer une clé qui fuit.',
      en: 'Three trials before the top floor: read the log of a night in service, ship without breaking everything, and fix a leaking key.',
    },
    steps: [
      {
        kind: 'spot',
        prompt: { fr: 'Relevé d’une nuit de service. Clique les trois lignes où le service a mal réagi.', en: 'Log of a night in service. Click the three lines where the service reacted badly.' },
        code: true,
        lines: [
          { text: { fr: '22:00 démarrage · clé : lue dans l’environnement', en: '22:00 start · key: read from the environment' }, faulty: false },
          { text: { fr: '22:14 req-014 · 529 overloaded_error · essai 1/3, attente 1 s', en: '22:14 req-014 · 529 overloaded_error · attempt 1/3, wait 1 s' }, faulty: false },
          { text: { fr: '22:14 req-014 · 529 overloaded_error · essai 2/3, attente 2 s', en: '22:14 req-014 · 529 overloaded_error · attempt 2/3, wait 2 s' }, faulty: false, why: { fr: 'Correct : passager, réessayé avec un délai qui double.', en: 'Correct: temporary, retried with a doubling delay.' } },
          { text: { fr: '22:14 req-014 · réponse reçue', en: '22:14 req-014 · response received' }, faulty: false },
          {
            text: { fr: '23:40 req-031 · 401 authentication_error · essai 1/3, attente 1 s', en: '23:40 req-031 · 401 authentication_error · attempt 1/3, wait 1 s' },
            faulty: true,
            why: { fr: 'Une clé fausse ne guérit pas en réessayant. Il fallait s’arrêter avec un message clair.', en: 'A wrong key does not heal by retrying. It should stop with a clear message.' },
          },
          {
            text: { fr: '23:41 erreur · clé sk-ant-api03-Xq7… refusée', en: '23:41 error · key sk-ant-api03-Xq7… refused' },
            faulty: true,
            why: { fr: 'La clé ne sort nulle part, même en partie : ni message d’erreur, ni trace.', en: 'The key appears nowhere, not even partly: no error message, no trace.' },
          },
          {
            text: { fr: '02:05 req-052 · appel envoyé · dépense 5,04 € / budget 5 € · alerte : budget dépassé', en: '02:05 req-052 · call sent · spend €5.04 / budget €5 · alert: budget exceeded' },
            faulty: true,
            why: { fr: 'Le plafond a été vérifié après l’appel : trop tard. Il doit passer avant, et refuser.', en: 'The cap was checked after the call: too late. It must come first, and refuse.' },
          },
          { text: { fr: '02:06 req-053 · refusée : budget du jour atteint · alerte envoyée', en: '02:06 req-053 · refused: daily budget reached · alert sent' }, faulty: false, why: { fr: 'Correct : refus avant l’appel, et une alerte.', en: 'Correct: refused before the call, with an alert.' } },
        ],
      },
      {
        kind: 'order',
        prompt: { fr: 'Remets dans l’ordre une mise à jour sûre du service.', en: 'Put a safe service update in order.' },
        items: [
          { id: 'change', label: { fr: 'Modifier l’agent sur ta machine', en: 'Change the agent on your machine' } },
          { id: 'tests', label: { fr: 'Lancer les 35 tests et les attaques, d’une seule commande', en: 'Run the 35 tests and the attacks, in a single command' } },
          { id: 'gate', label: { fr: 'Un test échoue : ne pas publier ; tous verts : continuer', en: 'A test fails: do not ship; all green: go on' }, hint: { fr: 'La décision de publier vient du résultat des tests.', en: 'The decision to ship comes from the test results.' } },
          { id: 'ship', label: { fr: 'Mettre la version d’avant de côté, puis publier la nouvelle', en: 'Set the previous version aside, then ship the new one' }, hint: { fr: 'On garde de quoi revenir en arrière avant de remplacer quoi que ce soit.', en: 'Keep a way back before replacing anything.' } },
          { id: 'watch', label: { fr: 'Une alerte tombe : revenir en arrière en une commande', en: 'An alert fires: roll back in one command' } },
        ],
      },
      {
        kind: 'choice',
        multiple: true,
        prompt: { fr: 'Que fais-tu ? Coche tout ce qui est nécessaire.', en: 'What do you do? Tick everything that is needed.' },
        scene: {
          fr: 'Tu as poussé une clé d’API dans un fichier suivi par git, puis tu l’as supprimée au commit suivant.',
          en: 'You pushed an API key in a file tracked by git, then deleted it in the next commit.',
        },
        options: [
          {
            id: 'revoke',
            label: { fr: 'Révoquer la clé et en créer une nouvelle', en: 'Revoke the key and create a new one' },
            correct: true,
            why: { fr: 'Une clé qui a fui est perdue : seule la révocation la rend inutilisable.', en: 'A leaked key is lost: only revoking it makes it unusable.' },
          },
          {
            id: 'env',
            label: { fr: 'Sortir la clé du dépôt et la lire dans l’environnement au démarrage', en: 'Take the key out of the repo and read it from the environment at start-up' },
            correct: true,
            why: { fr: 'C’est la correction durable : « Clé : lue dans l’environnement. »', en: 'That is the lasting fix: “Clé : lue dans l’environnement.”' },
          },
          {
            id: 'nothing',
            label: { fr: 'Rien : le fichier est supprimé', en: 'Nothing: the file is deleted' },
            correct: false,
            why: { fr: 'La clé reste dans l’historique git : n’importe qui avec le dépôt peut la retrouver.', en: 'The key stays in the git history: anyone with the repo can find it.' },
          },
          {
            id: 'retry',
            label: { fr: 'Passer max_retries à 10 pour compenser', en: 'Set max_retries to 10 to compensate' },
            correct: false,
            why: { fr: 'Les essais ne protègent pas une clé : ils ne servent qu’aux erreurs passagères.', en: 'Retries do not protect a key: they are only for temporary errors.' },
          },
        ],
      },
    ],
    reward: { name: { fr: 'Le volant de la chaufferie', en: 'The boiler-room handwheel' }, prop: 'c13_wheel' },
  },
  mission: {
    sector: { fr: 'Opérations et exploitation', en: 'Operations' },
    client: { fr: 'Transports Kerval, logistique régionale, 40 chauffeurs (fictif)', en: 'Transports Kerval, regional logistics, 40 drivers (fictional)' },
    brief: {
      fr: 'Notre assistant répond aux régulateurs : « où en est la livraison 4471 ? ». Il marche très bien sur le portable de la développeuse. Nous le voulons en service jour et nuit, sans facture surprise et sans panne que personne ne voit à 3 h du matin.',
      en: 'Our assistant answers the dispatchers: “where is delivery 4471?”. It works very well on the developer’s laptop. We want it in service day and night, with no surprise bill and no failure that nobody sees at 3 am.',
    },
    constraints: [
      { label: { fr: 'Informations disponibles', en: 'Available information' }, detail: { fr: 'Le suivi des livraisons, la suite de 35 tests de l’assistant, le relevé quotidien du service.', en: 'Delivery tracking, the assistant’s 35-test suite, the daily service log.' } },
      { label: { fr: 'Outils existants', en: 'Existing tools' }, detail: { fr: 'Un coffre à secrets, un script de publication qui garde la version d’avant, un téléphone d’astreinte, la console de l’API.', en: 'A secrets store, a release script that keeps the previous version, an on-call phone, the API console.' } },
      { label: { fr: 'Données confidentielles', en: 'Confidential data' }, detail: { fr: 'La clé d’API et les adresses des clients : ni dans le dépôt, ni dans une trace, ni dans une alerte.', en: 'The API key and customer addresses: not in the repository, not in a trace, not in an alert.' } },
      { label: { fr: 'Situations exceptionnelles', en: 'Exceptional situations' }, detail: { fr: 'API surchargée, limite de débit au pic du matin, budget du jour atteint, mise à jour ratée.', en: 'Overloaded API, rate limit at the morning peak, daily budget reached, a failed update.' } },
      { label: { fr: 'Validation humaine', en: 'Human approval' }, detail: { fr: 'Publier une version et relever le budget sont décidés par une responsable nommée. Une personne d’astreinte, désignée chaque semaine, reçoit les alertes.', en: 'Shipping a version and raising the budget are decided by a named owner. A person on call, designated each week, receives the alerts.' } },
      { label: { fr: 'Qualité de service', en: 'Service quality' }, detail: { fr: 'Jamais un statut inventé. En cas de panne, le régulateur est prévenu clairement et passe à la procédure manuelle.', en: 'Never an invented status. During a failure, the dispatcher is clearly told and switches to the manual procedure.' } },
    ],
    problem: {
      kind: 'choice',
      prompt: { fr: 'Quel est le vrai problème à résoudre ?', en: 'What is the real problem to solve?' },
      options: [
        { id: 'a', label: { fr: 'Supprimer l’astreinte : un agent autonome se surveille, se répare et se met à jour seul', en: 'Remove the on-call duty: an autonomous agent monitors, repairs and updates itself' }, correct: false, why: { fr: 'Un service qui relève son budget ou se publie seul n’a plus de garde-fou. Il faut quelqu’un de nommé pour décider.', en: 'A service that raises its own budget or ships itself has no safeguard left. Someone named must decide.' } },
        { id: 'b', label: { fr: 'Faire que le même assistant échoue proprement et prévienne quelqu’un : clé, essais, plafond, alerte, tests, retour arrière', en: 'Make the same assistant fail cleanly and warn someone: key, retries, cap, alert, tests, rollback' }, correct: true, why: { fr: 'Oui : l’agent ne change pas. On lui construit un service où chaque panne sort par une porte connue.', en: 'Yes: the agent does not change. You build it a service where every failure leaves through a known door.' } },
        { id: 'c', label: { fr: 'Passer à un modèle plus puissant pour qu’il n’y ait plus de pannes', en: 'Switch to a more powerful model so there are no more failures' }, correct: false, why: { fr: 'Une surcharge, une clé absente ou un budget dépassé ne dépendent pas de la qualité du modèle.', en: 'An overload, a missing key or an exceeded budget do not depend on the model’s quality.' } },
      ],
    },
    tasks: {
      kind: 'sort',
      prompt: { fr: 'Pour chaque tâche, la solution la plus simple qui suffit.', en: 'For each task, the simplest solution that is enough.' },
      bins: [
        { id: 'rule', label: { fr: 'Automatisation classique', en: 'Classic automation' } },
        { id: 'llm', label: { fr: 'Fonction LLM', en: 'LLM feature' } },
        { id: 'agent', label: { fr: 'Agent avec outils', en: 'Agent with tools' } },
        { id: 'human', label: { fr: 'Humain', en: 'Human' } },
      ],
      items: [
        { id: 't1', label: { fr: 'Vérifier le budget du jour avant chaque appel', en: 'Check the daily budget before each call' }, bin: 'rule', why: { fr: 'Une comparaison de deux nombres : du code, pas un modèle.', en: 'A comparison of two numbers: code, not a model.' } },
        { id: 't2', label: { fr: 'Réessayer après un 529, trois fois au plus, délai doublé', en: 'Retry after a 529, three times at most, doubling delay' }, bin: 'rule', why: { fr: 'Une boucle comptée et une attente : une règle fixe, plus fiable qu’un modèle.', en: 'A counted loop and a wait: a fixed rule, more reliable than a model.' } },
        { id: 't3', label: { fr: 'Résumer le relevé de la nuit pour la relève du matin', en: 'Summarise the night’s log for the morning handover' }, bin: 'llm', why: { fr: 'Un texte fourni à reformuler, relu par l’équipe : pas d’outil à appeler.', en: 'A given text to rephrase, reviewed by the team: no tool to call.' } },
        { id: 't4', label: { fr: 'Répondre « où en est la livraison 4471 ? » en consultant le suivi', en: 'Answer “where is delivery 4471?” by looking up tracking' }, bin: 'agent', why: { fr: 'Il faut choisir et appeler l’outil de suivi selon la question : c’est le travail de l’agent.', en: 'It must choose and call the tracking tool depending on the question: that is the agent’s job.' } },
        { id: 't5', label: { fr: 'Décider de publier une nouvelle version', en: 'Decide to ship a new version' }, bin: 'human', why: { fr: 'Les tests donnent le feu vert, la responsable nommée décide et en répond.', en: 'The tests give the green light, the named owner decides and answers for it.' } },
        { id: 't6', label: { fr: 'Relever le budget du jour après une alerte', en: 'Raise the daily budget after an alert' }, bin: 'human', why: { fr: 'Le plafond borne le pire cas : si le service pouvait le relever, il ne bornerait plus rien.', en: 'The cap bounds the worst case: if the service could raise it, it would bound nothing.' } },
      ],
    },
    tools: [
      { id: 'secret', label: { fr: 'Coffre à secrets : lire la clé', en: 'Secrets store: read the key' }, desc: { fr: 'Place la clé d’API dans l’environnement au démarrage.', en: 'Puts the API key into the environment at start-up.' }, role: 'needed', why: { fr: 'Sans clé, aucun appel. Et c’est ce qui évite de l’écrire dans le code ou le dépôt.', en: 'Without a key, no call. And it is what avoids writing it in the code or the repository.' } },
      { id: 'suivi', label: { fr: 'Suivi des livraisons : consulter', en: 'Delivery tracking: look up' }, desc: { fr: 'Lire le statut d’une livraison.', en: 'Read a delivery’s status.' }, role: 'needed', why: { fr: 'C’est la source des réponses : sans lui, l’assistant ne peut que deviner.', en: 'It is the source of the answers: without it, the assistant can only guess.' } },
      { id: 'journal', label: { fr: 'Relevé du service : écrire', en: 'Service log: write' }, desc: { fr: 'Demandes, échecs et dépense, jour après jour.', en: 'Requests, failures and spend, day after day.' }, role: 'needed', why: { fr: 'Le budget et le critère d’arrêt se lisent ici. Sans relevé, personne ne sait si le service va bien.', en: 'The budget and the stop criterion are read here. Without a log, nobody knows whether the service is healthy.' } },
      { id: 'alerte', label: { fr: 'Alerte vers l’astreinte', en: 'Alert to the on-call person' }, desc: { fr: 'Un message sur le téléphone de la personne de garde.', en: 'A message to the phone of the person on call.' }, role: 'needed', why: { fr: 'La nuit, c’est le seul lien entre une panne et un humain.', en: 'At night, it is the only link between a failure and a human.' } },
      { id: 'publier', label: { fr: 'Publication : publier et revenir en arrière', en: 'Release: ship and roll back' }, desc: { fr: 'Remplace la version en service, en gardant la précédente.', en: 'Replaces the version in service, keeping the previous one.' }, role: 'needed', why: { fr: 'Sans lui, pas de retour arrière en une commande.', en: 'Without it, no one-command rollback.' } },
      { id: 'console', label: { fr: 'Console de l’API : plafonds et clés', en: 'API console: limits and keys' }, desc: { fr: 'Relever le plafond de dépense, créer ou révoquer des clés.', en: 'Raise the spend limit, create or revoke keys.' }, role: 'forbidden', why: { fr: 'Un service qui peut relever son plafond ou créer des clés n’est plus borné par rien.', en: 'A service that can raise its own limit or create keys is no longer bounded by anything.' } },
    ],
    permissions: [
      { tool: 'secret', options: ['read', 'deny'], allowed: ['read'], why: { fr: 'Lire la clé au démarrage suffit : le service ne la modifie pas et ne l’affiche jamais.', en: 'Reading the key at start-up is enough: the service never changes it and never displays it.' } },
      { tool: 'alerte', options: ['auto', 'approve', 'deny'], allowed: ['auto'], why: { fr: 'Une alerte doit partir seule : à 2 h, il n’y a personne pour l’approuver.', en: 'An alert must go out on its own: at 2 am, nobody is there to approve it.' } },
      { tool: 'publier', options: ['approve', 'auto', 'deny'], allowed: ['approve'], why: { fr: 'Publier ou revenir en arrière : une commande, lancée par une personne nommée, après les tests.', en: 'Shipping or rolling back: one command, run by a named person, after the tests.' } },
    ],
    tests: [
      { id: 'q1', request: { fr: 'Lundi 6 h : premier démarrage du service sur le serveur.', en: 'Monday 6 am: first start of the service on the server.' }, needsTools: ['secret'], permission: { tool: 'secret', allowed: ['read'] }, ok: { fr: 'Le service affiche « Clé : lue dans l’environnement. » et démarre. La clé n’apparaît nulle part.', en: 'The service prints “Clé : lue dans l’environnement.” and starts. The key appears nowhere.' }, ko: { fr: 'Le service s’arrête : « Clé absente : définis ANTHROPIC_API_KEY. » Aucun régulateur n’a de réponse.', en: 'The service stops: “Clé absente : définis ANTHROPIC_API_KEY.” No dispatcher gets an answer.' } },
      { id: 'q2', request: { fr: '02:05, « Où en est la livraison 4471 ? » L’API répond 529, trois fois de suite.', en: '02:05, “Where is delivery 4471?” The API answers 529, three times in a row.' }, needsTools: ['suivi', 'alerte'], permission: { tool: 'alerte', allowed: ['auto'] }, ok: { fr: 'Après trois essais, le régulateur lit « indisponible, passe à la procédure manuelle », et l’astreinte reçoit une alerte précise.', en: 'After three attempts, the dispatcher reads “unavailable, switch to the manual procedure”, and the on-call person gets a precise alert.' }, ko: { fr: 'L’alerte ne part pas, ou attend un accord que personne ne donne à 2 h : la panne se découvre au matin.', en: 'The alert does not go out, or waits for an approval nobody gives at 2 am: the failure is discovered in the morning.' } },
      { id: 'q3', request: { fr: '04:30, une boucle d’essais s’emballe : le budget du jour est atteint.', en: '04:30, a retry loop runs away: the daily budget is reached.' }, needsTools: ['journal', 'alerte'], permission: { tool: 'console', allowed: ['deny'] }, critical: true, ok: { fr: 'La demande suivante est refusée avant l’appel, une alerte part. La responsable décidera au matin.', en: 'The next request is refused before the call, an alert goes out. The owner will decide in the morning.' }, ko: { fr: 'Le service avait accès à la console : le plafond a été relevé, et la boucle a tourné jusqu’au matin. La facture suit.', en: 'The service had access to the console: the limit was raised, and the loop ran until morning. The bill follows.' } },
      { id: 'q4', request: { fr: 'Vendredi 18 h : une nouvelle version est prête, 2 tests sur 35 sont rouges.', en: 'Friday 6 pm: a new version is ready, 2 tests out of 35 are red.' }, needsTools: ['journal'], permission: { tool: 'publier', allowed: ['approve', 'deny'] }, critical: true, ok: { fr: 'Rien n’est publié. La version en service reste celle qui passait tous les tests.', en: 'Nothing is shipped. The version in service stays the one that passed every test.' }, ko: { fr: 'La version est partie seule, tests rouges : tout le week-end, les régulateurs reçoivent des statuts faux.', en: 'The version shipped on its own, tests red: all weekend, dispatchers receive wrong statuses.' } },
      { id: 'q5', request: { fr: '03:10, après une mise à jour : le relevé montre 6 échecs sur 40 demandes, l’alerte tombe.', en: '03:10, after an update: the log shows 6 failures out of 40 requests, the alert fires.' }, needsTools: ['journal', 'alerte', 'publier'], permission: { tool: 'publier', allowed: ['approve', 'auto'] }, ok: { fr: 'La personne d’astreinte lance une commande : la version d’avant repart en quelques instants.', en: 'The on-call person runs one command: the previous version is back within moments.' }, ko: { fr: 'Aucun retour arrière possible : le service reste cassé jusqu’à l’arrivée de la développeuse.', en: 'No rollback possible: the service stays broken until the developer arrives.' } },
    ],
    limits: [
      { fr: 'Ces garde-fous attrapent les pannes, pas les réponses fausses : une réponse inexacte ne déclenche aucune alerte. C’est le rôle des 35 tests.', en: 'These safeguards catch failures, not wrong answers: an inaccurate answer triggers no alert. That is what the 35 tests are for.' },
      { fr: 'Les essais ne soignent que les erreurs passagères. Une panne longue demande une procédure manuelle, écrite à l’avance.', en: 'Retries only cure temporary errors. A long outage needs a manual procedure, written in advance.' },
      { fr: 'Le plafond borne la dépense, pas le service : une fois atteint, l’assistant refuse jusqu’au lendemain ou jusqu’à une décision humaine.', en: 'The cap bounds the spend, not the service: once reached, the assistant refuses until the next day or a human decision.' },
      { fr: 'Une alerte ne sert que si quelqu’un de nommé la lit : il faut un tour d’astreinte, et peu d’alertes.', en: 'An alert only helps if someone named reads it: you need an on-call rota, and few alerts.' },
    ],
  },
  teach: {
    setting: { fr: 'Session de formation · équipe d’exploitation · simulation pédagogique', en: 'Training session · operations team · teaching simulation' },
    colleagues: [
      {
        id: 'yanis',
        name: 'Yanis',
        role: { fr: 'Régulateur de nuit', en: 'Night dispatcher' },
        level: { fr: 'Débutant · utilisera l’assistant sans l’avoir construit', en: 'Beginner · will use the assistant without having built it' },
        kind: 'simple',
        says: { fr: 'Il marche déjà sur le portable de la développeuse. Qu’est-ce qui change quand on le met en service ?', en: 'It already works on the developer’s laptop. What changes when it goes into service?' },
        explain: [
          { id: 'e1', text: { fr: 'En service, personne ne regarde l’écran. Il doit donc savoir échouer proprement tout seul : s’arrêter sans rien inventer, laisser une trace et prévenir quelqu’un.', en: 'In service, nobody is watching the screen. So it must fail cleanly on its own: stop without inventing anything, leave a trace and warn someone.' }, scores: { accuracy: 2, simplicity: 2 }, note: { fr: 'L’idée centrale, en mots de tous les jours.', en: 'The central idea, in everyday words.' } },
          { id: 'e2', text: { fr: 'Rien : si ça marche en test, ça marchera pareil en service.', en: 'Nothing: if it works in testing, it will work the same in service.' }, scores: { accuracy: 0, simplicity: 2 }, note: { fr: 'Faux : en service arrivent la surcharge, la clé absente, le coût qui grimpe.', en: 'Wrong: service brings overload, a missing key, climbing costs.' } },
          { id: 'e3', text: { fr: 'Il faut du backoff exponentiel, de l’observabilité, un circuit breaker et une gestion des secrets.', en: 'You need exponential backoff, observability, a circuit breaker and secrets management.' }, scores: { accuracy: 2, simplicity: 0 }, note: { fr: 'Des mots justes, mais Yanis n’est pas développeur : il n’en retient aucun.', en: 'The right words, but Yanis is not a developer: none of them stick.' } },
        ],
        example: [
          { id: 'x1', text: { fr: 'À 2 h, l’API est surchargée : le service réessaie trois fois, puis t’affiche « indisponible, passe à la procédure manuelle » et alerte l’astreinte.', en: 'At 2 am, the API is overloaded: the service retries three times, then shows you “unavailable, switch to the manual procedure” and alerts the on-call person.' }, scores: { relevance: 2, example: 2 }, note: { fr: 'Sa nuit de travail, et ce qu’il verra à l’écran.', en: 'His night shift, and what he will see on screen.' } },
          { id: 'x2', text: { fr: 'C’est comme une voiture qui se gare toute seule.', en: 'It is like a car that parks itself.' }, scores: { relevance: 0, example: 1 }, note: { fr: 'Une image, sans lien avec la régulation des livraisons.', en: 'An image, with no link to dispatching deliveries.' } },
          { id: 'x3', text: { fr: 'Il y a plus de choses à prévoir.', en: 'There are more things to plan for.' }, scores: { relevance: 1, example: 0 }, note: { fr: 'Lesquelles ? Il ne peut rien se représenter.', en: 'Which ones? He cannot picture anything.' } },
        ],
        limit: [
          { id: 'l1', text: { fr: 'Ces garde-fous attrapent les pannes, pas les réponses fausses : un statut inexact ne déclenche aucune alerte. En cas de doute, vérifie dans le suivi.', en: 'These safeguards catch failures, not wrong answers: an inaccurate status triggers no alert. When in doubt, check in tracking.' }, scores: { limits: 2 }, note: { fr: 'La limite qui le concerne, avec un réflexe.', en: 'The limit that concerns him, with a habit.' } },
          { id: 'l2', text: { fr: 'Une fois en service avec ses alertes, plus besoin de le surveiller.', en: 'Once in service with its alerts, there is no need to watch it any more.' }, scores: { limits: 0, accuracy: 0 }, note: { fr: 'Dangereux : une alerte ne voit pas une réponse fausse, et quelqu’un doit la lire.', en: 'Dangerous: an alert does not see a wrong answer, and someone has to read it.' } },
          { id: 'l3', text: { fr: 'Il faudra un serveur plutôt qu’un portable.', en: 'It will need a server rather than a laptop.' }, scores: { limits: 1 }, note: { fr: 'Vrai, mais ce n’est pas une limite utile pour son travail.', en: 'True, but not a limit that is useful for his job.' } },
        ],
      },
      {
        id: 'clemence',
        name: 'Clémence',
        role: { fr: 'Responsable d’exploitation', en: 'Operations manager' },
        level: { fr: 'Intermédiaire · lit le relevé du service chaque matin', en: 'Intermediate · reads the service log every morning' },
        kind: 'confusion',
        says: { fr: 'S’il y a une erreur, il n’a qu’à réessayer jusqu’à ce que ça passe, non ?', en: 'If there is an error, it should just retry until it goes through, right?' },
        explain: [
          { id: 'e1', text: { fr: 'Seulement pour les pannes passagères, trois fois au plus, en doublant l’attente : insister sans pause aggrave la surcharge. Une clé fausse, elle, ne guérit pas en réessayant.', en: 'Only for temporary failures, three times at most, doubling the wait: insisting without a pause worsens the overload. A wrong key, on the other hand, does not heal by retrying.' }, scores: { accuracy: 2, simplicity: 2 }, note: { fr: 'Tu gardes ce qui est vrai dans son idée et tu poses les deux bornes.', en: 'You keep what is true in her idea and set the two bounds.' } },
          { id: 'e2', text: { fr: 'Oui : plus on réessaie vite, plus on a de chances de passer.', en: 'Yes: the faster you retry, the better your chances of getting through.' }, scores: { accuracy: 0, simplicity: 2 }, note: { fr: 'Faux : c’est exactement ce qui entretient une surcharge.', en: 'Wrong: that is exactly what keeps an overload going.' } },
          { id: 'e3', text: { fr: 'Ça dépend de l’idempotence, du jitter et du max_retries du SDK.', en: 'It depends on idempotency, jitter and the SDK’s max_retries.' }, scores: { accuracy: 1, simplicity: 0 }, note: { fr: 'Des notions réelles, mais qui ne répondent pas à sa question.', en: 'Real notions, but they do not answer her question.' } },
        ],
        example: [
          { id: 'x1', text: { fr: 'Quand le standard d’un entrepôt est saturé, rappeler chaque seconde l’encombre encore. Notre service attend 1 s, 2 s, 4 s, puis abandonne et alerte l’astreinte.', en: 'When a warehouse switchboard is jammed, calling back every second clogs it further. Our service waits 1 s, 2 s, 4 s, then gives up and alerts the on-call person.' }, scores: { relevance: 2, example: 2 }, note: { fr: 'Une situation de son métier, puis les vrais chiffres du service.', en: 'A situation from her job, then the service’s real figures.' } },
          { id: 'x2', text: { fr: 'C’est comme rafraîchir sans arrêt une billetterie de concert.', en: 'It is like endlessly refreshing a concert ticket site.' }, scores: { relevance: 0, example: 1 }, note: { fr: 'Parlant, mais loin de l’exploitation.', en: 'Vivid, but far from operations.' } },
          { id: 'x3', text: { fr: 'Parfois il faut insister, parfois non.', en: 'Sometimes you should insist, sometimes not.' }, scores: { relevance: 1, example: 0 }, note: { fr: 'Elle ne saura pas quand.', en: 'She will not know when.' } },
        ],
        limit: [
          { id: 'l1', text: { fr: 'Sans limite, une boucle d’essais peut tourner toute la nuit et faire grimper la facture. D’où les trois essais au plus, et le budget du jour vérifié avant chaque appel.', en: 'Without a limit, a retry loop can run all night and push the bill up. Hence three attempts at most, and the daily budget checked before each call.' }, scores: { limits: 2 }, note: { fr: 'Le pire cas, et ce qui le borne.', en: 'The worst case, and what bounds it.' } },
          { id: 'l2', text: { fr: 'Avec les essais automatiques, il n’y aura plus de panne visible.', en: 'With automatic retries, there will be no visible failure any more.' }, scores: { limits: 0, accuracy: 0 }, note: { fr: 'Faux : une panne longue épuise les trois essais. Il faut l’abandon propre et l’alerte.', en: 'Wrong: a long outage uses up the three attempts. You need the clean give-up and the alert.' } },
          { id: 'l3', text: { fr: 'Les limites de débit dépendent du niveau d’usage de notre compte.', en: 'Rate limits depend on our account’s usage tier.' }, scores: { limits: 1 }, note: { fr: 'Exact, mais cela ne dit pas pourquoi borner les essais.', en: 'Correct, but it does not say why retries must be bounded.' } },
        ],
      },
      {
        id: 'bruno',
        name: 'Bruno',
        role: { fr: 'Directeur des opérations', en: 'Operations director' },
        level: { fr: 'Avancé · pressé, veut le service en ligne cette semaine', en: 'Advanced · in a hurry, wants the service live this week' },
        kind: 'risky',
        says: { fr: 'Pour aller vite : mettez la clé dans le fichier de config du dépôt et publiez les mises à jour directement. On testera en service.', en: 'To move fast: put the key in the repo’s config file and ship updates directly. We will test in service.' },
        explain: [
          { id: 'e1', text: { fr: 'Deux raccourcis coûteux. Une clé dans le dépôt reste lisible dans l’historique, même supprimée : elle vit dans l’environnement. Et une mise à jour non testée casse le service pour tout le monde d’un coup.', en: 'Two costly shortcuts. A key in the repository stays readable in the history, even once deleted: it lives in the environment. And an untested update breaks the service for everyone at once.' }, scores: { accuracy: 2, simplicity: 2 }, note: { fr: 'Deux raisons nettes, sans sermon.', en: 'Two clear reasons, no lecture.' } },
          { id: 'e2', text: { fr: 'D’accord : tant que le dépôt est privé, la clé ne risque rien.', en: 'Fine: as long as the repository is private, the key is safe.' }, scores: { accuracy: 0, simplicity: 2 }, note: { fr: 'Faux : toute personne ou machine qui a une copie du dépôt a la clé, pour toujours.', en: 'Wrong: any person or machine with a copy of the repository has the key, forever.' } },
          { id: 'e3', text: { fr: 'Non : il faut un vault avec rotation, un pipeline CI/CD avec gates et un déploiement blue-green.', en: 'No: you need a vault with rotation, a CI/CD pipeline with gates and a blue-green deployment.' }, scores: { accuracy: 1, simplicity: 0 }, note: { fr: 'Plus que nécessaire, et dit en jargon : Bruno entend « trois mois de retard ».', en: 'More than needed, and said in jargon: Bruno hears “three months late”.' } },
        ],
        example: [
          { id: 'x1', text: { fr: 'Vendredi 18 h, une version non testée part : tout le week-end, les régulateurs reçoivent des statuts faux. Avec les 35 tests d’abord, elle ne partait pas ; avec la version d’avant gardée, on revient en une commande.', en: 'Friday 6 pm, an untested version ships: all weekend, dispatchers get wrong statuses. With the 35 tests first, it would not have shipped; with the previous version kept, you are back in one command.' }, scores: { relevance: 2, example: 2 }, note: { fr: 'Son exploitation, un vendredi soir : il voit le coût.', en: 'His operation, on a Friday evening: he sees the cost.' } },
          { id: 'x2', text: { fr: 'C’est comme un pilote qui décolle sans check-list.', en: 'It is like a pilot taking off without a checklist.' }, scores: { relevance: 0, example: 1 }, note: { fr: 'Une image forte, mais pas son service ni ses régulateurs.', en: 'A strong image, but not his service or his dispatchers.' } },
          { id: 'x3', text: { fr: 'Ça peut mal tourner.', en: 'It can go wrong.' }, scores: { relevance: 1, example: 0 }, note: { fr: 'Il le sait déjà. Sans exemple, il maintient sa demande.', en: 'He already knows. Without an example, he sticks to his request.' } },
        ],
        limit: [
          { id: 'l1', text: { fr: 'Même testée, une version peut casser. Donc, avant de publier : une personne d’astreinte nommée, un critère d’arrêt chiffré, et le retour arrière prêt.', en: 'Even tested, a version can break. So, before shipping: a named person on call, a numeric stop criterion, and the rollback ready.' }, scores: { limits: 2 }, note: { fr: 'Honnête sur les tests, et trois décisions à prendre.', en: 'Honest about tests, and three decisions to make.' } },
          { id: 'l2', text: { fr: 'Si ça casse, on corrigera en direct, c’est rapide.', en: 'If it breaks, we will fix it live, it is quick.' }, scores: { limits: 0, accuracy: 0 }, note: { fr: 'Corriger en direct, la nuit, sans retour arrière : la panne la plus longue possible.', en: 'Fixing live, at night, with no rollback: the longest possible outage.' } },
          { id: 'l3', text: { fr: 'Lancer les tests prend un peu de temps avant chaque publication.', en: 'Running the tests takes a little time before each release.' }, scores: { limits: 1 }, note: { fr: 'Vrai, mais c’est un coût, pas la limite à connaître.', en: 'True, but that is a cost, not the limit to know.' } },
        ],
      },
    ],
  },
  toolkit: {
    simple: { fr: 'Mettre en service, c’est faire tourner l’assistant sans personne devant l’écran. Il faut donc prévoir les pannes : chacune doit s’arrêter proprement, laisser une trace et prévenir quelqu’un.', en: 'Going into service means running the assistant with nobody at the screen. So you plan for failures: each must stop cleanly, leave a trace and warn someone.' },
    analogy: { fr: 'La chaudière qui tourne la nuit : thermostat, soupape de sécurité, voyant d’alarme, et un numéro d’astreinte collé dessus. Limite à dire : ces sécurités voient les pannes, pas les réponses fausses ; pour celles-ci, il faut des tests.', en: 'The boiler that runs at night: thermostat, safety valve, warning light, and an on-call number stuck on it. Limit to state: these safeties see failures, not wrong answers; for those, you need tests.' },
    useCase: { fr: 'Exploitation logistique : l’assistant des régulateurs tourne jour et nuit. Clé lue dans l’environnement, trois essais au plus, budget du jour, alerte vers l’astreinte, tests avant chaque version, retour arrière en une commande.', en: 'Logistics operations: the dispatchers’ assistant runs day and night. Key read from the environment, three attempts at most, daily budget, alert to the on-call person, tests before every version, one-command rollback.' },
    demo: { fr: 'En trois minutes : dessinez les cinq étapes de la boucle de service, puis jouez une panne à voix haute, « l’API répond 529 trois fois ». Demandez à chaque étape : que voit l’utilisateur, et qui est prévenu ?', en: 'In three minutes: draw the five steps of the service loop, then play a failure out loud, “the API answers 529 three times”. At each step ask: what does the user see, and who is warned?' },
    exercise: { fr: 'Par deux, écrivez la fiche de garde d’un assistant de votre équipe : où vit la clé, combien d’essais, quel budget par jour, quelle alerte et pour qui, comment revenir en arrière. Échangez les fiches et cherchez la panne non prévue.', en: 'In pairs, write the on-call card for an assistant in your team: where the key lives, how many attempts, what daily budget, which alert and for whom, how to roll back. Swap cards and look for the unplanned failure.' },
    questions: [
      { fr: 'Où vit la clé d’API, et pourquoi jamais dans le dépôt ?', en: 'Where does the API key live, and why never in the repository?' },
      { fr: 'Que fait-on d’un 429 ou d’un 529, et combien de fois ?', en: 'What do you do with a 429 or a 529, and how many times?' },
      { fr: 'Pourquoi vérifier le budget avant l’appel plutôt qu’après ?', en: 'Why check the budget before the call rather than after?' },
    ],
    mistakes: [
      { fr: 'Croire que ce qui marche sur un poste marchera pareil en service.', en: 'Believing that what works on one machine will work the same in service.' },
      { fr: 'Réessayer sans limite ni délai, ou réessayer une erreur qui ne guérira pas (401, 400).', en: 'Retrying without limit or delay, or retrying an error that will not heal (401, 400).' },
      { fr: 'Supprimer une clé qui a fui sans la révoquer : elle reste dans l’historique.', en: 'Deleting a leaked key without revoking it: it stays in the history.' },
    ],
    vigilance: [
      { fr: 'Une alerte ne vaut que si une personne nommée la reçoit : qui est de garde cette semaine ?', en: 'An alert is only worth something if a named person receives it: who is on call this week?' },
      { fr: 'Aucune publication sans tests verts, et jamais sans la version d’avant prête à repartir.', en: 'No release without green tests, and never without the previous version ready to restart.' },
      { fr: 'Un service qui ne tombe pas en panne peut quand même répondre faux : gardez les tests et relisez le relevé.', en: 'A service that does not fail can still answer wrongly: keep the tests and reread the log.' },
    ],
  },
  coverage: [
    { notion: { fr: 'Qu’est-ce qui change à la mise en service ?', en: 'What changes when you go live?' }, skill: { fr: 'Faire sortir chaque panne par une porte connue : abandon propre, trace, alerte', en: 'Make every failure leave through a known door: clean give-up, trace, alert' }, learn: 'loop', practice: 'teach', check: { fr: 'Question de fin du trajet de nuit, puis l’explication donnée à Yanis', en: 'Check question at the end of the night journey, then the explanation given to Yanis' } },
    { notion: { fr: 'Où ranger la clé d’API ?', en: 'Where should the API key be stored?' }, skill: { fr: 'Lire la clé dans l’environnement, et révoquer une clé qui a fui', en: 'Read the key from the environment, and revoke a leaked key' }, learn: 'code', practice: 'challenge', check: { fr: 'Première vanne du code, puis la clé qui fuit dans le défi', en: 'First valve of the code, then the leaking key in the challenge' } },
    { notion: { fr: 'Que faire d’une erreur 429 ou 529 ?', en: 'What do you do with a 429 or 529 error?' }, skill: { fr: 'Réessayer les erreurs passagères, s’arrêter sur les autres', en: 'Retry temporary errors, stop on the others' }, learn: 'errors', practice: 'challenge', check: { fr: 'Relier chaque code à sa réaction, puis lire le relevé de nuit', en: 'Link each code to its reaction, then read the night log' } },
    { notion: { fr: 'Pourquoi allonger le délai entre deux essais ?', en: 'Why lengthen the delay between two attempts?' }, skill: { fr: 'Borner les essais à trois, avec un délai qui double', en: 'Bound retries to three, with a doubling delay' }, learn: 'intro', practice: 'code', check: { fr: 'Vanne du délai dans le code, puis la réponse à Clémence', en: 'The delay valve in the code, then the answer to Clémence' } },
    { notion: { fr: 'Pourquoi fixer un plafond de dépense ?', en: 'Why set a spending cap?' }, skill: { fr: 'Vérifier le budget du jour avant l’appel, pour borner le pire cas', en: 'Check the daily budget before the call, to bound the worst case' }, learn: 'code', practice: 'mission', check: { fr: 'Test critique de la mission : le service ne peut pas relever son plafond', en: 'The mission’s critical test: the service cannot raise its own cap' } },
    { notion: { fr: 'Qu’est-ce qu’une alerte utile ?', en: 'What is a useful alert?' }, skill: { fr: 'Écrire une alerte rare et précise : quoi, quand, quoi faire', en: 'Write a rare, precise alert: what, when, what to do' }, learn: 'errors', practice: 'mission', check: { fr: 'Choisir l’alerte utile, puis l’alerte vers l’astreinte dans la mission', en: 'Choose the useful alert, then the alert to the on-call person in the mission' } },
    { notion: { fr: 'Comment mettre à jour sans tout casser ?', en: 'How do you update without breaking everything?' }, skill: { fr: 'Lancer les 35 tests avant de publier, et ne pas publier si un test échoue', en: 'Run the 35 tests before shipping, and do not ship if a test fails' }, learn: 'challenge', practice: 'mission', check: { fr: 'Ordonner une mise à jour sûre, puis le test « 2 tests rouges » de la mission', en: 'Order a safe update, then the mission’s “2 red tests” test' } },
    { notion: { fr: 'Comment revenir en arrière ?', en: 'How do you roll back?' }, skill: { fr: 'Garder la version d’avant et revenir en une commande', en: 'Keep the previous version and roll back in one command' }, learn: 'challenge', practice: 'mission', check: { fr: 'Dernière étape de la mise à jour sûre, puis le retour arrière de 03:10', en: 'Last step of the safe update, then the 03:10 rollback' } },
    { notion: { fr: 'Build : la boucle de service', en: 'Build: the service loop' }, skill: { fr: 'Ordonner budget, travail, essais, abandon, alerte', en: 'Order budget, work, retries, give-up, alert' }, learn: 'loop', practice: 'lab', check: { fr: 'Remettre le trajet dans l’ordre, puis une semaine de relevé au labo', en: 'Put the journey in order, then a week of logging in the lab' } },
    { notion: { fr: 'Break / Fix : clé qui fuit, essais qui s’emballent', en: 'Break / Fix: leaking key, runaway retries' }, skill: { fr: 'Nommer la cause d’une casse et la corriger en une ligne', en: 'Name the cause of a break and fix it in one line' }, learn: 'challenge', practice: 'lab', check: { fr: 'Le relevé de nuit et la clé du défi, puis les trois casses sur ton service', en: 'The night log and the key in the challenge, then the three breaks on your own service' } },
    { notion: { fr: 'Evals : une panne écrite comme un cas de test', en: 'Evals: a failure written as a test case' }, skill: { fr: 'Écrire situation, comportement attendu et vérification dans la trace', en: 'Write the situation, expected behaviour and check in the trace' }, learn: 'mission', practice: 'lab', check: { fr: 'Les cinq demandes de test de la mission, puis les fiches 36 à 38 au labo', en: 'The mission’s five test requests, then cards 36 to 38 in the lab' } },
    { notion: { fr: 'Choisir l’outil selon le besoin', en: 'Choosing the tool for the need' }, skill: { fr: 'Préférer une règle quand elle suffit, un agent quand il faut choisir un outil', en: 'Prefer a rule when it is enough, an agent when a tool must be chosen' }, learn: 'tools', practice: 'mission', check: { fr: 'Tri générer / automatiser / RPA, puis le tri des tâches de la mission', en: 'The generate / automate / RPA sort, then the mission’s task sort' } },
    { notion: { fr: 'Planifier : responsable, date, critère d’arrêt, astreinte', en: 'Planning: owner, date, stop criterion, on-call' }, skill: { fr: 'Écrire une étape de projet avec un responsable nommé et un critère d’arrêt chiffré', en: 'Write a project step with a named owner and a numeric stop criterion' }, learn: 'roadmap', practice: 'teach', check: { fr: 'Choisir la fiche prête, puis la limite donnée à Bruno', en: 'Choose the ready card, then the limit given to Bruno' } },
  ],
  videos: [
    {
      id: 'LCEmiRjPEtQ',
      title: 'Andrej Karpathy: Software Is Changing (Again)',
      channel: 'Y Combinator',
      lang: 'en',
      note: { fr: 'Sur les produits à autonomie partielle : avancer par petites étapes, un humain qui vérifie vite.', en: 'On partial-autonomy products: move in small steps, with a human who verifies quickly.' },
      programme: false,
    },
  ],
  resources: [
    { title: 'Errors', url: 'https://platform.claude.com/docs/en/api/errors', kind: 'doc', source: 'Claude Docs', lang: 'en', note: { fr: 'Les codes d’erreur de l’API, puis les reprises : que faire d’un 429, d’un 529, d’un 500.', en: 'The API error codes, then retries: what to do with a 429, a 529, a 500.' }, programme: true },
    { title: 'Rate limits', url: 'https://platform.claude.com/docs/en/api/rate-limits', kind: 'doc', source: 'Claude Docs', lang: 'en', note: { fr: 'Les limites de débit, puis les plafonds de dépense de l’organisation.', en: 'Rate limits, then the organisation’s spend limits.' }, programme: true },
    { title: 'III. Config', url: 'https://12factor.net/config', kind: 'article', source: 'The Twelve-Factor App', lang: 'en', note: { fr: 'Une seule page : pourquoi la configuration et les secrets vivent dans l’environnement, jamais dans le code.', en: 'A single page: why configuration and secrets live in the environment, never in the code.' }, programme: true },
    { title: 'venv — Creation of virtual environments', url: 'https://docs.python.org/3/library/venv.html', kind: 'doc', source: 'Python documentation', lang: 'en', note: { fr: 'Repère python -m venv et activate : une installation reproductible.', en: 'Find python -m venv and activate: a reproducible setup.' }, programme: true },
  ],
};

export default ch13;
