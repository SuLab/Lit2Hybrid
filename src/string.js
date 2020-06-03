export class String {
    static split(str) {
        if (str) {
            str = str
                .split(/\r\n|\n|\r/)
                .map(x => x.trim())
                .filter(x => x);
                
            return str;
        } else return [];
    }
}
