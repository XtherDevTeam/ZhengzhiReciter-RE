import * as fs from "fs";
import * as path from "path";

export default {
    name: "backend-api",
    methods: {
        /**
         * Load a knowledge library from a markdown file.
         * @param _path path to markdown file.
         * @param callback callback function. callback(is_success, result)
         */
        load_library(_path, callback) {
            fs.readFile(path.join(_path), "utf-8", (err, data) => {
                if (err) {
                    callback(false, "cannot open file.");
                } else {
                    let lines = data.replaceAll(/\r/g, "").split('\n');
                    let result = [], cur = {title: "", suggestions: "", points: []};
                    for (let Index in lines) {
                        let I = lines[Index];
                        if (I.startsWith('#')) {
                            I = I.substring(2);
                            if (cur.title !== "") {
                                result.push(cur);
                                cur = {title: "", suggestions: "", points: []};
                            }
                            cur.title = I;
                        } else if (I.startsWith('-')) {
                            I = I.substring(2);
                            cur.points.push(I);
                        } else if (I.startsWith('|')) {
                            I = I.substring(1);
                            cur.suggestions += I + '\n';
                        }
                    }
                    if (cur.title !== "") {
                        result.push(cur);
                    }
                    callback(true, result);
                }
            })
        },
        get_today_date() {
            let d = new Date();
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        }
    }
}