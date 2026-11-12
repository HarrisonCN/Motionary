'use strict';

function choices(value) {
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        }
        catch {
            return [];
        }
    }
    if (!Array.isArray(value))
        return [];
    const seen = new Set();
    return value.filter(v => v && typeof v === 'object' && typeof v.value === 'string' && !seen.has(v.value) && (seen.add(v.value), true)).slice(0, 1000).map(v => ({ value: v.value, label: String(v.label ?? v.value), disabled: v.disabled === true, group: v.group ? String(v.group) : undefined }));
}
let sequence = 0;
function choiceId() { return `usa-choice-${++sequence}`; }

exports.choiceId = choiceId;
exports.choices = choices;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/chunks/form-options-lnCyapKT.cjs.map