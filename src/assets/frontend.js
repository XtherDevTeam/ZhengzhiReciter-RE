export default {
    name: 'frontend-api',
    methods: {
        getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getSimilarity(str1, str2) {
            let sameNum = 0
            for (let i = 0; i < str1.length; i++) {
                for (let j = 0; j < str2.length; j++) {
                    if (str1[i] === str2[j]) {
                        sameNum++
                        break
                    }
                }
            }
            let length = str1.length > str2.length ? str1.length : str2.length
            return (sameNum / length) * 100 || 0
        },
        point_getter(type, temp_recited, all_recited, count) {
            if (type === "goal_new") {
                return all_recited + temp_recited;
            } else if (type === "goal_review") {
                return this.getRndInteger(1, all_recited - temp_recited - 1);
            } else if (type === "random_recite") {
                return this.getRndInteger(1, all_recited);
            }
        },
        run_judge(inputs, points) {
            let fell_test = 0;
            for (let i = 0; i < inputs.length; i++) {
                console.log(i, "before:" , inputs[i], points[i]);
                const input = inputs[i].replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
                const point = points[i].replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
                console.log(i, 'processed strings:', input, point);
                if (this.getSimilarity(input, point) < 0.8) {
                    fell_test++;
                }
            }
            if ((fell_test / inputs.length) > 0.2) {
                return false;
            }
            return true;
        }
    }
}