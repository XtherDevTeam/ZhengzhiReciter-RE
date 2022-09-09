export default {
    name: 'frontend-api',
    methods: {
        getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getSimilarity(s, t) {
            if (s === "")
                return 0.0.toFixed(4);
            const n = s.length, m = t.length, d = [];
            let i, j, s_i, t_j, cost;
            if (n === 0) return m;
            if (m === 0) return n;
            for (i = 0; i <= n; i++) {
                d[i] = [];
                d[i][0] = i;
            }
            for (j = 0; j <= m; j++) {
                d[0][j] = j;
            }
            for (i = 1; i <= n; i++) {
                s_i = s.charAt(i - 1);
                for (j = 1; j <= m; j++) {
                    t_j = t.charAt(j - 1);
                    if (s_i === t_j) {
                        cost = 0;
                    } else {
                        cost = 1;
                    }
                    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
                }
            }
            const l = s.length > t.length ? s.length : t.length;
            return (1 - d[n][m] / l).toFixed(4);
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
                console.log(i, "before:", inputs[i], points[i]);
                const input = inputs[i].replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
                const point = points[i].replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
                console.log(i, 'processed strings:', input, point);
                console.log(i, '我趣', this.getSimilarity(input, point));
                if (this.getSimilarity(input, point) < 0.8) {
                    fell_test++;
                }
            }
            if ((fell_test / inputs.length) > 0.2) {
                return false;
            }
            return true;
        },
        get_correct_rate(input_val, point_val) {
            const input = input_val.replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
            const point = point_val.replaceAll(/，|。|：|”|“|‘|,|:|"|·|—|、|（|）|【|】/g, "");
            return this.getSimilarity(input, point);
        }
    }
}