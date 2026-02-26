let fin_du_mois = 0;
const date = 28;
const mois = 1;
let ovulation = 0;

if (
  mois == 1 ||
  mois == 3 ||
  mois == 5 ||
  mois == 7 ||
  mois == 8 ||
  mois == 10 ||
  mois == 12
) {
  fin_du_mois = 31;
} else if (mois == 2) {
  fin_du_mois = 28;
} else {
  fin_du_mois = 30;
}

ovulation = date + 13; //41
if (ovulation > fin_du_mois) {
  const diff = ovulation - fin_du_mois;
  ovulation = diff + 1;
}

console.log('date', ovulation);
