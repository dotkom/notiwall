# Changelog
Denne changeloggen er på norsk.
Alle viktige endringer i Notiwall dokumenteres i denne filen.
Dette prosjektet følger [Semantic Versioning](http://semver.org/).

## Versjonshistorie

### YYYY-MM-DD Versjon 1.1 (planlagt)
* Bedre options-side
* Events fra kalenderne til linjeforeningene

### 2016-03-09 Versjon 1.1
* Win! Et halvt år siden siste update, og likevel har Notiwall fungert tilnærmet plettfritt.
* Fusjonerte HiST inn i NTNU
* Fjernet støtte for Hackerspace (Online/Abakus) på grunn av en lang periode hvor dør-APIet ikke har levert data
* Fjernet 3 linjeforeninger++: Theodor (død nettside), Projeksjon (død nettside), Adressa Student (nedlagt feed)

### 2015-08-01 Versjon 1.0
* Skilte ut Online Notiwall fra Online Notifier som en egen extension, med følgende funksjonalitet:
  * Nyheter fra linjeforeninger, studentmedier og mer
  * Middagsmeny og lunsjmeny fra SiT-kantiner
  * Sanntidsbuss og orakel fra AtB
  * For linjeforeninger med Notipi: Kontorstatus, møteplan og kaffestatus
* Fjernet all Notifier-spesifikk funksjonalitet og trimmet betraktelig
* Eget verktøybibliotek kalt "notiwall.js" for nye Notiwalls
* Utvidet bruk av nettleserens APIer
  * Live reloading av Notiwalls ved endringer i options
  * Forhindrer at operativsystemet går i sleep mode
  * Kun én Notiwall kan være åpen av gangen
