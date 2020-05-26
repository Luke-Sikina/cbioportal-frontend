import data from "pages/patientView/genomicOverview/mockData";

export function dateOrNever(dateStr: string | undefined | null): string {
    if (!dateStr) {
        return "Never";
    }
    const date = new Date(dateStr);
    const pieces = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours() > 12 ? date.getHours() - 12 : date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    ].map(n => twoDig(n));
    const amPm = date.getHours() > 12 ? "PM" : "AM";

    return `${pieces[0]}-${pieces[1]}-${pieces[2]} ${pieces[3]}:${pieces[4]}:${pieces[5]} ${amPm}`;
}

function twoDig(num: number): string {
    if (num > 9) {
        return num.toString();
    }
    return "0" + num.toString();
}

export function parseUrlParams() {
    return window.location.search.substring(1)
        .split("&")
        .map(p => p.split("="))
        .reduce((a, c) => {a[c[0]] = c[1]; return a}, {} as any);
}