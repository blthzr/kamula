# TIE-23500 Web-ohjelmointi harjoitustyö

## Kamula
## Ryhmän numero: 126
## Työn teki: Samu Laaksonen

### Ympäristöstä ja muita huomioita

* Työ testattu 
    * Node.js:n versiolla 0.10.25
    * MongoDB:n versiolla 2.4.9
* Node.js käyttää porttia 3000, e.g. http://127.0.0.1:3000/
* MongoDB asennuksen kanssa käytetty vakioporttia 27017
* Työtä on kehitetty ja ajettu Windows ympäristössä lokaalein Node.js ja MongoDB asennuksin

### Työn kansiorakenteesta:

* kamula/

    * api/ 
    
        * Sisältää Kamulan ulospäin tarjoaman rajapinnan
        
        * Tarjoaa ominaisuudet käyttäjien, tilapäivitysten ja kommenttien hallintaan
        
    * documentation/
    
        * Sisältää dokumentaation Kamula:n REST-API:sta
        
    * test/
    
        * Testit käyttäjien, tilapäivitysten ja kommenttien tietokantatoiminnallisuuden testaamiseen
        
    * views/
    
        * Kamula projektissa käytetyt käyttäjälle selaimessa näkyvät sivut
        
    * routes/
    
        * Kamula:n palvelinpään logiikka. Hoitaa pyydettyjen urlien resurssien "reititykset"
        
    * public/
    
        * Kamula:n sivustoilla näkyvät yleiset osat ja muu julkinen materiaali
        
    * node_modules/
    
        * Kamula projektissa käytettävät Node.js moduulit
        
#### Kysymykset ja ehdotukset otetaan vastaan trackerin kautta
        