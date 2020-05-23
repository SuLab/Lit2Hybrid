export class eUtils {
    static get RequestInterval() { return 1000 / 3; }
    static get ApiKeyRequestInterval() { return 1000 / 10; }
    static get PubmedBaseUrl() { return `https://www.ncbi.nlm.nih.gov/pubmed`; }
    static get eUtilsBaseUrl() {
        return `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`;
    }
    
    static getPubmedUrl(term, modifier) {
        let search = term + ' AND ' + modifier;
        search = !term ? modifier : !modifier ? term : search
        let url = `${this.PubmedBaseUrl}/?term=${search}`;
        return encodeURI(url);
    }

    static geteUtilsUrl(term, modifier, apikey) {
        let search = term + ' AND ' + modifier;
        search = !term ? modifier : !modifier ? term : search
        if (apikey) apikey = "&api_key=" + apikey
        let url = `${this.eUtilsBaseUrl}?db=pubmed${apikey}&rettype=count&term=${search}&retmode=json`;
        return encodeURI(url);
    }
}