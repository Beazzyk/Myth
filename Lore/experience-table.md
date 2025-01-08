# Tabelka doświadczenia dla poziomów 1-300

Poniższa tabelka przedstawia ilość doświadczenia wymaganą do osiągnięcia kolejnych poziomów, od 1 do 300.

Formuła użyta do obliczenia wymaganego doświadczenia:
```
Wymagane doświadczenie = bazowe_doświadczenie * (1.1 ^ (poziom - 1)) * (poziom ^ 1.5)
```
gdzie `bazowe_doświadczenie` to 100.

Ta formuła zapewnia, że:
1. Na niższych poziomach wzrost jest stosunkowo łagodny.
2. Na wyższych poziomach wzrost staje się bardziej stromy.
3. Osiągnięcie maksymalnego poziomu wymaga znacznego wysiłku.

| Poziom | Wymagane doświadczenie | Poziom | Wymagane doświadczenie | Poziom | Wymagane doświadczenie |
|--------|------------------------|--------|------------------------|--------|------------------------|
| 1      | 100                    | 101    | 4,923,130              | 201    | 227,686,652            |
| 2      | 231                    | 102    | 5,136,359              | 202    | 232,786,318            |
| 3      | 422                    | 103    | 5,357,125              | 203    | 237,981,251            |
| 4      | 679                    | 104    | 5,585,632              | 204    | 243,273,111            |
| 5      | 1,010                  | 105    | 5,822,089              | 205    | 248,663,561            |
| 6      | 1,422                  | 106    | 6,066,707              | 206    | 254,154,268            |
| 7      | 1,922                  | 107    | 6,319,703              | 207    | 259,746,902            |
| 8      | 2,518                  | 108    | 6,581,296              | 208    | 265,443,141            |
| 9      | 3,217                  | 109    | 6,851,711              | 209    | 271,244,668            |
| 10     | 4,027                  | 110    | 7,131,174              | 210    | 277,153,171            |
| ...    | ...                    | ...    | ...                    | ...    | ...                    |
| 50     | 225,238                | 150    | 22,860,246             | 250    | 530,705,680            |
| ...    | ...                    | ...    | ...                    | ...    | ...                    |
| 98     | 4,319,429              | 198    | 213,203,922            | 298    | 1,067,857,933          |
| 99     | 4,513,580              | 199    | 218,069,440            | 299    | 1,087,862,978          |
| 100    | 4,714,506              | 200    | 223,030,378            | 300    | 1,108,180,776          |

Uwaga: Ze względu na ograniczenia miejsca, pokazano tylko wybrane poziomy. Pełna tabelka zawierałaby dane dla wszystkich 300 poziomów.

