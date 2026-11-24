import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BarChart, Bar, ComposedChart, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, ReferenceDot, ScatterChart, Scatter, ZAxis, LabelList } from 'recharts';
import { DATAFEED_KILDE, DATAFEED_PRODUKT_HISTORIKK, DATAFEED_INDEKS_HISTORIKK } from '../data/pensumDatafeedHistorikk';
import { PENSUM_SELSKAPSNOEKKELTALL, referanseEksponering, defaultPensumProdukter, defaultProduktEksponering, defaultProduktRapportMeta, defaultPensumStandardLosninger, produktBeskrivelser } from '../data/pensumDefaults';
import PensumBelaning from './PensumBelaning';
// FormuesplanleggerTab removed — stolpediagram-visningen er nå hovedsiden
import { parseBelop, TRANSAKSJONSHONORAR_PST, ASSET_COLORS, ASSET_COLORS_LIGHT, PORTEFOLJE_FARGER, CATEGORY_COLORS, DEFAULT_EIENDOM, DEFAULT_KUNDEKAPITAL, DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_TEMPLATE_FILENAME, HISTORIKK_ARFELT, HISTORIKK_2026_YTD, PENSUM_COLORS, RAPPORT_DATO, RAPPORT_DATO_ISO, RAPPORT_DATO_OBJEKT, RAPPORT_MAANED, RAPPORT_AAR_TALL, RISIKOFRI_RENTE, periodeStartDato, beregnPortefoljeStatistikk, beregnScenarioAvkastning, fremskrivVerdi, fremskrivMedKontantstrom, beregnSisteAarNokkeltall, RISK_PROFILES, beregnAllokering, beregnProduktNokkeltall, beregnProduktStatistikk, beregnKorrelasjonsmatrise, byggMaanedssluttSerie, erGyldigTall, erPptTemplateFilnavn, finnStartVerdiVedPeriode, TILLEGG_TYPER, TILLEGG_MAKS, rensTillegg, tilleggAvkastning, fremskrivTillegg, beregnTotalbilde, byggPortefoljeSerie, beregnFallFraTopp, formatCurrency, formatDateEuro, formatHistorikkEtikett, formatNumber, formatPercent, aggregerEksponering, aggregerVerdensdeler, beregnKostnader, lagProduktFraMorningstar, cmaKlasseForMorningstarFond, CMA_KLASSER, MORNINGSTAR_DATO, oversettEksponering, beregnAarsavkastningFraData, inferPerioderPerAarFraHistorikk, oppdaterHistorikkTilRapportDato, parseHistorikkDato, skalerVekterTilHundreListe, fordelRestVektListe, validerSiderFormat } from '../lib/pensumCore';
import { AllokeringRow, CollapsibleSection, CurrencyInput, KategoriHeaderRow, SammenligningRow, StatCard } from './pensum/PensumFieldComponents';
import { LoginModal, RegisterModal } from './pensum/AuthModals';
import LunaAssistant from './pensum/LunaAssistant';
import DagensPortefolje from './pensum/DagensPortefolje';
import { analyserDagens, sammenlignDagensMotNy, beholdteSomTillegg, erTilleggFraDagens, rensPosisjoner, rensPlattformAvkastning } from '../lib/dagensPortefolje';
import { byggForslagModell } from '../lib/forslagModell';
import { FORSLAG_SIDER, standardSider, lagForslagPptx } from '../lib/forslagPptx';
import { ForslagOpptak } from '../lib/forslagOpptak';
import ForslagForhandsvisning from './pensum/ForslagForhandsvisning';

const TOM_EKSISTERENDE_PORTEFOLJE = { fond: [], aksjer: [], kontanter: 0, kilde: '' };

const PENSUM_LOGO = 'data:image/webp;base64,UklGRrgYAABXRUJQVlA4WAoAAAAwAAAASwIAHQEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBIcQ0AAA3wn22bl2bb/s1VwT0dyFmB04GkAkkFYAVoBcYKDBUoFQQrCHYwqeCadMBVwb0Mc/ziRyJy/yAiHEqy2jYkjkvaA6NHkb5ALf4/Fv9l8V8W/2XxXxb/ZfFf/n+ELP7LJXqZkSRyavH/sbwli/8SJVuj+5Y6iPtWdWNnBsnyIbDGwPdXKtbG2a+6ng+2zeBsatZxXN8rOwu8e5SgH4QfN4muCvf0y3FM2V7uyuuTLwnSYSRfT+PTc3+gRxep40M1JzU2znr39P/duH7mXDztX6rjMYbrszo0z7kU+Th7ZemT/qmqyUapjbnsnvOe6WGTjLMs/Tg85c9mp3Mz0udzfngtbDxI+NSryC9r6PS87J7HH+t77cogCwxs8+2sMvHWyDtcl5dBe1hPeWC29c0l20TKmOmh7YnOLW9VN5vlsii7d7PMPI67lsKDC+iVzjAff7+dY8kP5Kd2+m+W+cDOnCWXajvXTCa/l5+CT53ngq8M0p44nA2/WMG3Oeab5+nCH+ZFu2ZqtvmJD/aZWL9SYb45LM+j3T3nk4qabb5nVzXjPHZnzfW2YtR0n2e6pWXOAdne5pzdWxZxH/Yvc86jTLnTaAQ995gqUEM1yqnFtdJ8H41cbRMhrNSSCQ2xs9HfAHi145SFCzBI/QBmTuMuWCZj332vRrf7JN2yunFFBD9j9EKWGyn0qxdiZtv3cMMYw8AhqnOCVIpVVThSWdj2JfUDmDmNITbSxiGxCLpNwkoHcEjN/cj6a2it2BGxjV97JFgo2TsDihsCHwEDOkjyXT2IJeqGSkqn5+ltywWpkUzfkK52OfT9PJaug3/jre+QyBM+Faanp1QJ5ye6j6Slb4K7vHYF2ufMNhGYUUgcyA6bO+HNU/SHneEIbDBhk/m7UqtEw5TqKgAlE8K1Gp6SOaerCqXMJtbKB+GhXibL+UjcLR7l6f1Tqe/6w0AGEoDqiPmyk4qBWxky97uNdY/8LG4Dx1NUvtaM/OufMVHt7gMybJ9INcjmpUynYURFCCsqd+9VLTCkMLuGwWCmn3Cpc8Sxjh2XSr1rUuTgK4XYPyG7DmUH4LE6CqfoPDj1fTs5T/pLAgcjoKZXG7gsEF9+6jIi9s116AIn0ha+BBzn6dmAH/ELaqH3qvRrroOf1lYmjQFpXNRrd4PPEDcq7MA5bMRMSmFzlUBGg+Q/HZoHEgGx8w2320N9wShtb3mXfzgdYa5+dkVvhQmv1tVXCmHeHJzDBvH0/FE9Rl1Wf5QyaGqk5yUP70kU3FQLppBCJGzayAu4LG8ObiCuD6emcej8uZlAp2f1KLp1PQ+o07nLbrfxT3RwLN8HPUXno1/YM0V7sIdecQaO8lMqIcPL3oTP5qJRmDzq3VCzC+EUnz9dW5i5kffbIxnSA9jlNyf0wUPmqwJEubr/Q5yZxbaB58/WUQEaB/3026lYbNE/+IabTJP3MjlqWDqchjx9Zs5llAfIp4c5ReHO+2igO1eupOPiWhz9fwQ3N/WAp0/OuWCqb1ASLXNId11SP/+fsAVH1sAQB57igw01aXMszHVO1/NfaCrsLQP/IN3DycAUtuDI3lzAEeHnGjZn5dMLGqSC90kqXFvr5wUc6VcEFUGItsrPIzOmaug+L6RQNCohZNvB/T2dTs4XXMT9DFMM8A8yAx3j+lYBBCnto2gSJuTy25ODTTXgo13mleE2gaUZowjmboie1V8ddlLmTraJbVpTQQtZksXb1Cx899g0PlfAix26zKFP12+z1PP1c2zR+R/kkAyRCpzYopOFJet6wXnkSfqC82NO3A82BuuS3aFdG8bri7PmYEkGI/JdP68Mt2n6TVZ+jeZqWIvAWkRrer6wYV2zOMb8jJH8FJ5P1E8O/jUeuLSQYFMriYc6AJeIjJGGZiEZ7hRvjB9xoLt5h3TGHB7UNjZABetLg04a+94rlY/6rC9UPVNR2on6Ee3xYigKk8TPeJoiPbTkcLw2khFQ3a3tNnpute2iMcmcZAy30/LFL0ph21pzziMic2vQhJ51xKfWM9KLb2yz35519nsSB+j2zDrvo09TdfqcIxfBqqJZ6Bqehn2Q20SdtUkFTcgZZxMsKJmHNmL1yIyzSabiHu42IaeScwSFXj4y17TZj359h+TaXHP1KFsNMs9MAcbhSHLtMMccZakUz2GG+e1tAhFJfnGEY+Wi/jiahfMErKWxhZMC+STHk23LWy7wH/hxeKrJKahIqRcyC/1bH94ZlLd3CoRXgZwH/VvtgMVJKHlsgKb2htp8Z0MaBKu9I236oYNdOOO1hkCgAVisQXnFipAAf1dBPmM2sRAU8KQRTianSmXYPcB9w9qvDlIgpFFso7ThIr9l/CxSal1QMALkmhypSuUFg3JTOgIErUKu1PbGFUN4kBuzLSuIQJMGEamdQLswxguGwKDTXSsIhHNYEQrgb5kfY7tG0ToyImjUvRnZL+L7nJbUfY5Uc7JKmU1SCoAQN/OOQSvlIJojAhNJqN0SjJQBSKRnBrVrxjXPO2l8APhJfB8hNNydUmadYGdHRgDqU4ipuQmYrFDG45UzyRu3CAQOqE38wyv2f49JHy5yjeJDAj9yUWQqCkbzCjS81zwQytnuZGRykEvfGDAkrKj1IsKJPAzg49jRtHJRShN8o2PzLtuCApC1idBYe28H9viqI9IInNrQptjvY1ptZCdG6eONZPMwSBwIqRv19qOzt19xoziqXBsftwhOJiJIwwPpYXmNUGziwyfliXXMDZ/ymFUNiVJFR3+JEsr5K5V4b6fXa9Seo7A9BAahFWkHCWHh5pZ2MBGwyWX30AoBbniO6xuUX1X/pK0jjc9WmITKLRE+t6r+swqCnSp4JpMkNqez7FJk1K1JOdbuzduqJKkbDPZ66Qbx63PfXnqUchiDn8mYxiqbtY5EkEJsoX4kkF4VFuQ++0R7RoLunKgy8BGZtRWqbmmOcrng1LGGmRWNsF2R0a74aRGihL3PMrrIW5tCC6hW7Y4YT2mU39wDkU5RYhy0L2OaQjU1jn/hNusPWJMzQISq9cpIKLZVGTd8glpG0VrtzvriBys/0LzLBoQtsxFy6+92udjbFO2tf4sQaff54muOh3jpfSwfkzFNcA8i/l2NMRcHinspEFBRveAUuydG0nGFki22cC2UqmLtf1jgR4L4X7ZjgQrDq7YvIB2SGWsQYFNt4ae9fjLj1VAF2LrbtzXHg5M2wR1RMSxiGuBIIG6Bamm7V0kaF++NDAjiow0q/XsZWIGFgpe2XOSdiPtl4NPXrKU57lJCODvO73yXCVUPqNNA+SxyWSwpaxA0SEBCCrURGM/XxeSlXPua42FdQnfkNFKzhhsbghR2JJx2V8dE6zw7XQVACEMgO+helAPhs3EgtnE6+1wLxu6WLpl09EhdwvkdcMlbqB4Q/xE+y7ms73DxBmkThxDbwafh3eSNFz3US7aox6cT1TUMjcEgqnUkashUSRrr8/0qB+InNvpTDg4QlRchtpXs8NH7YNaGOw39CX08cPF/1fpV8EHP2tDVNOGzoM1ONmvEsT300DB5C4wnqDkejuCbVJXNiLVq/co3yvEaCO9ITNfDnNX5IADSq+0YRsqurc96QmKHT7KGEFq6ZFJSE2euZoJwhloYbc8EdA3Wyljos2C2risH6La1FXpoXYKKoOb4/UU2Om+j/DzNNETurE1bxjGOpPba1DyQIcxAhM82I2QLV0tUg34n9CNcLFIIUe/eGhXLTSDbxc5lft9lwD2+S67yyej4dcvbYgLPq9GOBLMiD5IFMuBQNFF6j3z7gB0+r0iOcdsmZS9F6YkizuaFWN7gjQM648Hte1MbFp6N8u/0hlLHia9OH8ln3d2O24oU0yCSAMUZMflKpcIckIFbW2vlCL5FjQmSLpPWwWjujc3+k/g09j6iCRb6Y1HeR6CnbJr6X+mWfAnY2P76EgZh86XqnzAYSabhHCkUXg1ynTQk1CwQwa3ttenNf5qix2voyLN+dPHICIQeMVM9oBpzvzp1Tqfo1pbpes7XHNFvJLgz9OtQtYBpqNaW+azvtnHGpKALxQKh2ovEBH5/Te82tjGtqjB8KNeM2YTc3lApgloYPGs3rx96n9a3EGWNo3ukpEFom6qGuPe88cDiA7bmUNPowaVKLUlwjhT4Z2M8HRBuwAGh2otIfD+xP0bysY0fPhxd4iwK+1USikKis8qEYfiXlyhKtgp7G9EjZQxC8Sj5Pm88vyhKdGl6yaqmb3SxVlmtbLkFbtHU0HNIINiV6NjvuwAEGGEe52kOJ9LqmwTSVn8eB4mujtJvAEpTfpQqjRCCEIrwK505aI/XeJsgkrwj8XPftEGgItCjV+oLIsMdMTKBIUBH1KUNbUXP1VNI/EyxZM66uZLtDwyETxWE+UOH1TkwFhJAoC8WHAE5vJaH7HaiQEdPHoeak9LpxqfxfupboDZunRLICDtJ7wJWdvxLjBb/H4v/svgv/yUpi//iZh6pEnqbexiwyEk5zT1Su4zEMPukZrtNhrfC5/nzz9Pl4Qu2mHmOCR6s1OL/45eUxX9x0ZwkOzcnyeL/Y/FfFv9l8V8W/2XxXxb/5b+BZPFfFABWUDggUAkAADBKAJ0BKkwCHgE+USiSRiOioaEik1lQcAoJZ27hc95rWCB8gHX/n1b/l+2C0H6r+q+kNyn3FPF9DvT/ly83efT+weoT9SewF4s36Ue4P7L/cB+yvrJ/8P1Bf331AP8F/pPWe/3P/////wBfu37Df7OenT7J3978+D1AP//6gH//67/oB/APoA/P3v8FNZUsbDDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpILMe7rPT71lSxsMMUkGKSDFJBikf7iZ6fesqWNhhikgxSQYd6fyZdl2XZGrAo9wetrAcd56fesqWNhhikgth5uC7LkfVkJ0hFjllNQD7VCzsxyEa1J1vWt1p4blTjZadBK0DEND3Xeen3rKljYX1J1CY/qAfaozXxRTtbZhf2a2S+VZ2QYpIMUkGKEi7t5JtfExPJz48VazxHkT2sMNbvgLkFUsbDDFI/lIkrEcfx+VdC2ZxMbokT2orWHYU9phzVx+DyDCq70Fr54fHmykCNkF//4sh+UwEgju6KB0U5SFKEma4YJCwgk57YiWNoZZ0nBexkFAMA85KfSk271JDDDxSSn32E33yPwQ6nsdfEAReRjI0ogrZU57HX20FCbhY2ETznJkenfI/fZWNhhikgxSQYpIMOqa+79MobxkySAHeen3rKljYYYpIMUkGKSDDzlrfFQcd56fesqWNhhikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKR+gAAP79SkAAAAAAHZuwA2VaBRfArf/69s08t0BYXfxPfEXIGr5KHyi3EsvlB6OoXIwRp6WHLpRp3m0TjCBRw+4sV1RrwhnB4Wc61k/oIqlzPitE7dXqj+7AAASeVDZL4kPoqfFpSk6Wr0AG2R+4HOwxNvWLIX5U3tJTpTPkqMFjBYAvxIzaCsYQ42iTPavnTLwxfHNRiF7TabEySrMsYF83XE0SSizTAC45NJ+Gl1craUZ+JYLPottcGPhwBfLgZ8w/sTdcvSSTwpRV+DzYQpicELAW5F9Dp0Hn0RW+QxeysWg91fNzXcbmnxGcWlvaF/tLikguvwUBfQo7rZVI0utFQNHkr9Au6B60XhqQ44LkklEj0Jd4Tb82foFZLyi1Y24uJDfis80lonJ5eji4AyOa8TA+/CPNgInlzbBSYQUOybwxQ3pF6I6864sLUJo4IHrkcFyL/08hBtwwVP9xDGcfwFAxmvrT+Px75WsQZKzkUJ1h/RHeHCcq+5TV2JgK5PD9WCHhu5EF0WiOwvMzg57MY7VB71ne0aQCBIgTM3ShLVnk7PvMk0uWww9Hy/EPUnvSBLECGcNLZf7ivHIIYMDlSnmv1qYuKlTJsVabdAuMkd4AVDXULelTaNx4cDur7/hIzRnbAr2jvEUVSLvjMAXbAJ/CJOjlfhQ9fgjTDI+mBpOlfbPv/+rl+hnfUKncu8Avzus1k//1jDkTiR2IQ/GsBejGyxtZQqDb0NVIylJjCgwUwXfLPFhHaGHzrTbmFuxhw4gsvUlv9bY78co3B9c7qvbRmaoFDqPw7ZbPYABw4oyjr81Ns/Ioh5pk7kOd2FT1tvoNtrwAy6Qk6ekPET1B7uIsqyPExrcb9MU1hj6tMkf6afUhK+pME4UaBz8MpInFCG0ixATttQwXhYjqlQoqmRavsBC+HkaWe5UXti21OgrNI/Ugk8NYq6h3OcutLMYXLG8hPAZPwh8HhctUrtdwT8vnl5on7H/k9uVDO0+2MyhZ8Ns6www1BtUAN0pz+vFqABojLbfkojH7huP2NrtlQWLRoN+kiD9+NyBrG7PscXMN62uTHI6dOyEBDV5wZAYVYZNgNAzugAYgQoxf0ZZk165WN3M/OwodpbLeaPC4Fh0bBibCus2EkC+RhfaZ0FBkznAtRfpDBCVLLkCwOTXjAdlk4DB7JfmYaJdLoPT6E/oWsu5l5DN0s5acWMgnDDIup/qRQuYO+jurVOW+rxvT9PPc5jPVQMOZGowP7IO344lNqKsBTszdVVzPuVHugBT+5VSPvKv9rbRcKQBBZPZS2rJydTx5FRQZolKK4fqbEFSpyy1wXIKfsoRVxEF4dYGweDkXBjguscpGkgvP4wRwY+nPLO2c7X1SKZJf8zycLacv/8YBbcmj+heUQOqjMqDxI32mVRVnH6FS1wV3GbTEml9GiytPATjEU5Nn8+x3LA2DuBQpye9w80VOhivsU+n//WJD62+zF+kqlXDVgTpeEcLYTYbskebfyL9qabAhjW/NnILaE+i6jWAQQgxTFgdsoWWfBxN4HAcZ2fEtTqx7vc2yUVm0a0h8b1HoK5FinnF0uA6lFjnytzcWVoXsusX8fjvBmsDX18JfJmTxxY0cPpN7/WGCu5rmlsmE1danVxC93WZfbRlMv2Om3D22UR3Bt2x7GSTEJIEaM+mEa4YkmerlKQIiPOV61fRqnXwlFT1Zt750N4sft7WS8oSasSV3PEh39e6anKcCcOy6RFVnhYfiWp5BogzPM4CXLDZSD7gXsAKvU+9u1zov32aqGfGZxq927LBF/hAGNZD+znLaGRFJ/lRyl4nlcrbyqMFsxe3Yyv6VwACsFqwfbL5z3oau8O/rmfkvjY/cGKVpIxXLp6brXpjEHxiTHM/EAsnf7nlY5rkW17PE81Y7DD5Ba/S1MC4mbuAjHazGYhKqN8dvsxCFrekRLEoMQcsYcHdEVvOIuar2shAJ4ZHTs8sQv3uEzaq/D6pJw9Zmnp3Gjkx/8/Vmvv7mrR2BTrjKbf3uIt4w/vBm8c+vO8CNEXMh4H9NcEqzf5/BBElth44vKBJw55EZ4jF6QkLpQKXtZIojU6gSd/BY+xz3UsOG5nqKmeEorWfJdPJ8O9Ai/wgNc8WAKvKAF3QIpBDeyYdE2+YK+ysQcXPXVV6oXe9jsJ/zia3sqBjTNlg0hiLN4oVebht1TLyfB4oDgR71s/QbN8I8yq7e9ICua59FWOx2vdWlu/HxA+alQmvGLxUJXJlLr4n2N//6H1Ci5g76GoDF/vaAQkA3ZI/NnJUH/PcBjBCzVMAAAAAAAAAAAAAAAlRwDsfAiqDUYtQDTNhEFfdbUalHtktoRlfoKH9fa7d2xWkgAAAAAAAAAAAA';

const RISIKOFRI_RENTE_TEKST = `${String(RISIKOFRI_RENTE).replace('.', ',')} %`;
// Norsk desimaltegn for tall som vises med prosenttegn; annen tekst returneres uendret.
// Faste farger per verdensdel, slik at samme verdensdel har samme farge overalt.
const VERDENSDEL_FARGER = { 'Nord-Amerika': '#0D2841', 'Europa': '#6B9DB8', 'Asia': '#C4967E', 'Resten av verden': '#2D6A6A', 'Ikke fordelt': '#CBD5E1' };
// Verktøy som brukes sjeldnere enn byggeren og forslaget, samlet under én fane.
const VERKTOY_FANER = [
  { id: 'formuesplanlegger', navn: 'Formuesplanlegger', hjelp: 'Fremskriv hele formuen per aktivaklasse, med lån og mål.' },
  { id: 'scenario', navn: 'Fondssammenligning', hjelp: 'Sammenlign fond og indekser: årsavkastning, risiko og korrelasjon.' },
  { id: 'belaning', navn: 'Belåning', hjelp: 'Regn på belåning, reinvestering og kontantuttak.' },
];

const PB_GRUPPER = [
  { id: 'portefolje', tittel: 'Portefølje' },
  { id: 'prognose', tittel: 'Prognose' },
  { id: 'historikk', tittel: 'Historikk og risiko' },
];

const pst = (v) => (typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v ?? ''))) ? String(v).replace('.', ',') : v;

export default function PensumPrognoseModell() {
  const [activeTab, setActiveTab] = useState('input');
  const [showPessimistic, setShowPessimistic] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  // Kakestykket pekeren står over i porteføljebyggeren: { kake: 'produkt' | 'aktiva', id }
  const [kakeHover, setKakeHover] = useState(null);
  const [delmal, setDelmal] = useState([]);  // Delmål / milepæler i chartet
  const [visDelmal, setVisDelmal] = useState(false);  // Vis delmål-seksjon
  const [malAktiv, setMalAktiv] = useState(false);  // Hele mål-seksjonen aktiv (valgfri som lån/rebalansering)
  const [hovedmal, setHovedmal] = useState({ navn: '', belop: 0, visIGraf: true, malAar: 0 });  // Hovedmål
  const [visSluttSammensetning, setVisSluttSammensetning] = useState(false);
  const [sluttSammensetningAar, setSluttSammensetningAar] = useState(10);
  const [akkumulerRenter, setAkkumulerRenter] = useState(false);  // Lånerenter akkumuleres i stedet for å trekkes fra kontantstrøm
  const [autoRebalanserAllokering, setAutoRebalanserAllokering] = useState(false);
  const [belopInputModus, setBelopInputModus] = useState(false);
  const [autoRebalanserPensum, setAutoRebalanserPensum] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ aksjer: false, renter: false, alternative: false });
  const [expandedKundeKategorier, setExpandedKundeKategorier] = useState({ likvide: true, illikvide: true, pe: false, eiendom: false });

  // Bruker-autentisering
  const [bruker, setBruker] = useState(null); // { epost, pin, navn }
  const [visLoginModal, setVisLoginModal] = useState(false);
  const [visRegistrerModal, setVisRegistrerModal] = useState(false);
  const [authFeilmelding, setAuthFeilmelding] = useState('');
  const [ventPaaRegistrering, setVentPaaRegistrering] = useState(false); // Venter på registrering før lagring

  const [kundeNavn, setKundeNavn] = useState('');
  const [kundeSelskap, setKundeSelskap] = useState('');
  const [risikoprofil, setRisikoprofil] = useState('Moderat');
  const [horisont, setHorisont] = useState(10);
  const [localHorisont, setLocalHorisont] = useState('10');
  const [radgiver, setRadgiver] = useState('');
  const [dato, setDato] = useState(new Date().toISOString().split('T')[0]);
  
  // Kundens økonomiske situasjon starter tom og fylles inn per kundekort.
  // Standardverdier: 10 mill totalt (8 mill likvid + 1 mill PE + 1 mill eiendom)
  const [aksjerKunde, setAksjerKunde] = useState(DEFAULT_KUNDEKAPITAL.aksjerKunde);
  const [aksjefondKunde, setAksjefondKunde] = useState(DEFAULT_KUNDEKAPITAL.aksjefondKunde);
  const [renterKunde, setRenterKunde] = useState(DEFAULT_KUNDEKAPITAL.renterKunde);
  const [kontanterKunde, setKontanterKunde] = useState(DEFAULT_KUNDEKAPITAL.kontanterKunde);
  const [peFondKunde, setPeFondKunde] = useState(DEFAULT_KUNDEKAPITAL.peFondKunde);
  const [unoterteAksjerKunde, setUnoterteAksjerKunde] = useState(DEFAULT_KUNDEKAPITAL.unoterteAksjerKunde);
  const [shippingKunde, setShippingKunde] = useState(DEFAULT_KUNDEKAPITAL.shippingKunde);
  const [egenEiendomKunde, setEgenEiendomKunde] = useState(DEFAULT_KUNDEKAPITAL.egenEiendomKunde);
  const [eiendomSyndikatKunde, setEiendomSyndikatKunde] = useState(DEFAULT_KUNDEKAPITAL.eiendomSyndikatKunde);
  const [eiendomFondKunde, setEiendomFondKunde] = useState(DEFAULT_KUNDEKAPITAL.eiendomFondKunde);
  const [innskudd, setInnskudd] = useState(0);
  const [uttak, setUttak] = useState(0);
  
  // Allokering & Prognose - investert beløp og alternative investeringer
  const [investertBelop, setInvestertBelop] = useState(null); // null = bruk totalKapital fra kundeinformasjon
  // Egen budsjett-state for Formuesplanleggeren — slik at endringer her
  // ikke påvirker Porteføljebygging eller Investeringsforslag (egne prosesser).
  const [formuesPlanleggerBelop, setFormuesPlanleggerBelop] = useState(null);
  // visAlternativeAllokering: null = auto (basert på om kunden har alt.inv.), true/false = manuelt satt
  const [visAlternativeAllokering, setVisAlternativeAllokering] = useState(null);

  // Lånefinansiering på Prognoser med indekser
  const [prognoseFinansiering, setPrognoseFinansiering] = useState([]);
  const [laanAktiv, setLaanAktiv] = useState(false);
  // Collapsible "Forutsetninger og mål"-panel på Porteføljebygger-fanen
  const [visForutsetninger, setVisForutsetninger] = useState(false);
  const [sisteVerktoy, setSisteVerktoy] = useState('formuesplanlegger');
  const [kundeSok, setKundeSok] = useState('');
  // Kundens øvrige investeringer: lagt inn for hånd, i kroner, utenfor Pensum-forslaget.
  const [tilleggAktiv, setTilleggAktiv] = useState(false);
  const [tillegg, setTillegg] = useState([]);
  const [visTilleggIPrognose, setVisTilleggIPrognose] = useState(true);
  // Dagens portefølje: kundens nåværende posisjoner, ofte hos andre banker.
  const [visDagens, setVisDagens] = useState(false);
  const [dagensPosisjoner, setDagensPosisjoner] = useState([]);
  const [dagensPlattformAvk, setDagensPlattformAvk] = useState([]);
  // Gruppene i porteføljebyggeren kan foldes sammen hver for seg.
  const [pbGrupper, setPbGrupper] = useState({ portefolje: true, prognose: true, historikk: true });
  const pbGruppeHode = (id, tittel, undertittel) => (
    <button id={'pb-gruppe-' + id} type="button" onClick={() => setPbGrupper(prev => ({ ...prev, [id]: !prev[id] }))} aria-expanded={pbGrupper[id]}
      className="w-full flex items-center gap-3 pt-2 text-left group" style={{ scrollMarginTop: '1rem' }}>
      <svg className={"w-4 h-4 flex-shrink-0 transition-transform " + (pbGrupper[id] ? "rotate-90" : "")} style={{ color: PENSUM_COLORS.salmon }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
      <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: PENSUM_COLORS.darkBlue }}>{tittel}</span>
      <span className="text-xs text-gray-400 hidden sm:inline">{undertittel}</span>
      <span className="flex-1 border-t border-gray-200"></span>
      <span className="text-xs text-gray-400 group-hover:text-gray-600">{pbGrupper[id] ? 'Skjul' : 'Vis'}</span>
    </button>
  );
  // 'nytt' = lån legges oppå porteføljen (øker eksponering)
  // 'eksisterende' = lånet finansierer allerede porteføljen (eksponering = portefølje)
  const [laanModus, setLaanModus] = useState('nytt');

  // ── Uavhengige forutsetninger for Porteføljebyggeren (kobles IKKE til
  //    Formuesplanleggeren). Samme funksjoner, egne verdier. ──
  const [pbLaanAktiv, setPbLaanAktiv] = useState(false);
  const [pbPrognoseFinansiering, setPbPrognoseFinansiering] = useState([]);
  const [pbLaanModus, setPbLaanModus] = useState('nytt');
  const [pbAkkumulerRenter, setPbAkkumulerRenter] = useState(false);
  const [pbMalAktiv, setPbMalAktiv] = useState(false);
  const [pbHovedmal, setPbHovedmal] = useState({ navn: '', belop: 0, visIGraf: true, malAar: 0 });
  const [pbVisDelmal, setPbVisDelmal] = useState(false);
  const [pbDelmal, setPbDelmal] = useState([]);
  const [pbVisSluttSammensetning, setPbVisSluttSammensetning] = useState(false);
  const [pbSluttSammensetningAar, setPbSluttSammensetningAar] = useState(10);

  const [investeringsFormaal, setInvesteringsFormaal] = useState('Utvikle finansiell formue');
  const [likviditetsbehov, setLikviditetsbehov] = useState('Begrenset');
  const [scenarioParams, setScenarioParams] = useState({ pessimistisk: -2, optimistisk: 12 });
  const [dashboardPeriode, setDashboardPeriode] = useState('5y');
  const [dashboardProdukter, setDashboardProdukter] = useState(['basis', 'global-core-active', 'global-edge', 'global-hoyrente', 'nordisk-hoyrente', 'norge-a', 'energy-a', 'banking-d', 'financial-d']);
  const [sammenligningPeriodeScen, setSammenligningPeriodeScen] = useState('max');
  // Porteføljebygging — sammenligning mot benchmarks
  const [portCompPeriode, setPortCompPeriode] = useState('3Å');
  const [portCompIndekser, setPortCompIndekser] = useState(['MSCI World', 'Oslo Børs']);
  const [portCompVisProdukter, setPortCompVisProdukter] = useState([]);
  const [forslagSider, setForslagSider] = useState(() => standardSider());
  const [forslagLaster, setForslagLaster] = useState(false);
  const [forslagVurdering, setForslagVurdering] = useState('');
  const TOM_RADGIVER2 = { navn: '', tittel: '', telefon: '', epost: '' };
  const [radgiver2, setRadgiver2] = useState(TOM_RADGIVER2);
  const [visRadgiver2, setVisRadgiver2] = useState(false);
  const ventLagringRef = useRef(false);
  const [start, setStart] = useState({ navn: '', belop: '', horisont: '10', profil: 'Moderat' });
  const [valgtePensumScen, setValgtePensumScen] = useState([]);
  const [valgteIndekserScen, setValgteIndekserScen] = useState(['MSCI World', 'Oslo Børs', 'Norske Statsobl.']);
  const [visPortefoljeScen, setVisPortefoljeScen] = useState(true);
  // Fondssammenligning
  const [eksterneFond, setEksterneFond] = useState(null);
  const [eksterneFondLoading, setEksterneFondLoading] = useState(false);
  // Søk i "Legg til produkt → Eksterne fond" på Porteføljebygger-fanen
  const [eksterneFondSok, setEksterneFondSok] = useState('');
  const [fondSokDebounced, setFondSokDebounced] = useState('');
  const [fondSokResultater, setFondSokResultater] = useState([]);
  const fondSokTimerRef = useRef(null);
  const fondSokInputRef = useRef(null);
  const [fondKategoriFilter, setFondKategoriFilter] = useState('');
  const [valgteFond, setValgteFond] = useState([]);
  const [visPensumIFondComp, setVisPensumIFondComp] = useState([]);
  const [visPortefoljeIFondComp, setVisPortefoljeIFondComp] = useState(false);
  const [fondVekter, setFondVekter] = useState({}); // { isin: vekt } for konkurranseportefølje
  const [visKonkurrentPortefolje, setVisKonkurrentPortefolje] = useState(false);
  const [skjulEnkeltfond, setSkjulEnkeltfond] = useState(false); // skjul individuelle fond-linjer
  const [slaSammenPortefoljer, setSlaSammenPortefoljer] = useState(false); // merge eks + ekstern → Nåværende portefølje
  const [visFondssammenligning, setVisFondssammenligning] = useState(false); // collapsible external fund search
  const [fondSammenligningVisning, setFondSammenligningVisning] = useState('avkastning');
  const [visSamletPortefolje, setVisSamletPortefolje] = useState(false); // Pensum + eksisterende sammenslått
  const [visEksisterendeIChart, setVisEksisterendeIChart] = useState(true); // toggle eksisterende i chart

  // ── Eksisterende portefølje (kundens nåværende investeringer) ──
  const [eksisterendePortefolje, setEksisterendePortefolje] = useState({
    fond: [],        // [{ id, navn, isin, belop, forvalter, kategori, ter, avk1y, avk3y, avk5y, volatilitet, geografi, matchet: bool }]
    aksjer: [],      // [{ navn, belop }] — enkeltaksjer samlet eller individuelt
    kontanter: 0,
    kilde: '',       // f.eks. 'Nordea', 'DNB', 'Manuelt'
  });



  // Lazy-load Morningstar-data for fondssammenligning og eksisterende portefølje
  const lastEksterneFond = useCallback(async () => {
    if (eksterneFond || eksterneFondLoading) return;
    setEksterneFondLoading(true);
    try {
      const res = await fetch('/data/eksterne-fond.json');
      const data = await res.json();
      setEksterneFond(data);
    } catch (e) {
      console.error('Kunne ikke laste eksterne fond:', e);
    }
    setEksterneFondLoading(false);
  }, [eksterneFond, eksterneFondLoading]);

  // Fuzzy fondssøk — matcher ord i søkestrengen mot fondsnavnet, scorer etter relevans
  const sokEksterneFondFuzzy = useCallback((query, maks = 20) => {
    if (!eksterneFond || !query || query.length < 2) return [];
    const q = query.toLowerCase().trim();

    // Direkte ISIN-match
    if (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/i.test(q) || (q.length === 12 && /^[a-z]{2}[a-z0-9]+$/.test(q))) {
      return eksterneFond.filter(f => f.isin?.toLowerCase() === q).slice(0, 1);
    }

    // Split query into words, remove noise
    const stopord = new Set(['fond', 'fund', 'a', 'b', 'i', 'bp', 'bi', 'acc', 'dis', 'distr', 'nok', 'sek', 'eur', 'usd', 'the', 'of', 'og', 'for', 'til', 'av']);
    const queryOrd = q.split(/[\s\-–—/,()]+/).filter(w => w.length >= 2 && !stopord.has(w));
    if (queryOrd.length === 0) return [];

    const resultater = [];
    for (const f of eksterneFond) {
      const navn = (f.n || '').toLowerCase();
      const navnOrd = navn.split(/[\s\-–—/,()]+/);

      let navnTreff = 0;
      let ordGrenseBonus = 0;
      for (const qo of queryOrd) {
        if (navn.includes(qo)) {
          navnTreff++;
          if (navnOrd.some(no => no === qo || no.startsWith(qo))) ordGrenseBonus += 0.5;
        }
      }

      if (navnTreff === 0) continue;

      // Score: fraction of query words matched + bonuses
      const dekningsgrad = navnTreff / queryOrd.length;
      if (dekningsgrad < 0.4) continue;

      let score = dekningsgrad * 3 + ordGrenseBonus;
      // Bonus: full query is substring of name
      if (navn.includes(q)) score += 3;
      // Bonus: all query words matched in name
      if (navnTreff === queryOrd.length) score += 2;
      // Bonus: name starts with first query word (brand match)
      if (queryOrd[0] && navnOrd[0]?.startsWith(queryOrd[0])) score += 1;
      // Slight bonus for AUM (prefer larger, more well-known funds)
      if (f.aum > 500000000) score += 0.3;
      else if (f.aum > 100000000) score += 0.1;

      resultater.push({ fond: f, score });
    }

    return resultater
      .sort((a, b) => b.score - a.score)
      .slice(0, maks)
      .map(r => r.fond);
  }, [eksterneFond]);



  // Markedssyn - oppdateres månedlig via admin
  const [markedssynData, setMarkedssynData] = useState({
    periode: 'mars 2026',
    makro: 'Global vekst holder seg moderat positiv, men med økt usikkerhet rundt geopolitikk og handelspolitikk. Vi forventer at sentralbankene fortsetter en gradvis lettelsessyklus, som støtter både aksje- og kredittmarkeder.',
    risiko: 'Volatiliteten har vært tiltagende. Vi tilnærmer oss dette ved å diversifisere bredt, holde en betydelig rentedel som buffer, og velge fond med dokumentert lavere nedsiderisiko enn bredt marked.',
    muligheter: 'Norske aksjer handles fortsatt med rabatt mot globale indekser. Aktive satellitter med eksponering mot nordiske industriselskaper og global high yield gir attraktiv risikojustert avkastning i dagens marked.',
  });
  const [markedssynAnalyserer, setMarkedssynAnalyserer] = useState(false);
  const [sammenligningProfil, setSammenligningProfil] = useState('Offensiv');
  const [sammenligningAllokering, setSammenligningAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Offensiv'));
  const [allokering, setAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Moderat'));

  // Rebalansering - årlig endring i allokering
  const [pensumRebalanseringAktiv, setPensumRebalanseringAktiv] = useState(false);
  const [pensumRebalanseringer, setPensumRebalanseringer] = useState([]);
  // Scatter plot: hvilke komponenter er på (default: ingen — kun Pensum-port + indekser vises)
  const [scatterAktiveKomponenter, setScatterAktiveKomponenter] = useState({});
  // Scatter plot: vis/skjul Pensum-portefølje og indekser (default: alle på)
  const [scatterVisPort, setScatterVisPort] = useState(true);
  const [scatterAktiveIndekser, setScatterAktiveIndekser] = useState({ 'msci-world': true, 'oslo-bors': true, 'norske-statsobl': true });
  const [rebalanseringAktiv, setRebalanseringAktiv] = useState(false);
  const [rebalanseringer, setRebalanseringer] = useState([
    { fraAktiva: 'Eiendom', tilAktiva: 'Globale Aksjer', prosentPerAar: 10 }
  ]);

  // Kostnadsanalyse - hva koster det å ikke investere?
  const [kostnadsanalyseAktiv, setKostnadsanalyseAktiv] = useState(false);
  const [skattepliktigFormue, setSkattepliktigFormue] = useState(10000000);
  const [aarligForbruk, setAarligForbruk] = useState(0);
  const [inflasjon, setInflasjon] = useState(2);
  const [renteAvkastning, setRenteAvkastning] = useState(4);

  // Lagring av kunder - bruker window.storage API (Claude's persistent storage)
  const [lagredeKunder, setLagredeKunder] = useState([]);
  const [aktivKundeId, setAktivKundeId] = useState(null);
  const [visKundeliste, setVisKundeliste] = useState(false);
  const [lagringsStatus, setLagringsStatus] = useState('');

  // Pensum Løsninger - fond og mandater med historisk avkastning og eksponeringsdata
  // aktivatype: 'aksje', 'rente' eller 'alternativ'
  // likviditet: 'likvid' eller 'illikvid'
  const [produktEksponering, setProduktEksponering] = useState(defaultProduktEksponering);
  const [produktRapportMeta, setProduktRapportMeta] = useState(defaultProduktRapportMeta);
  const [aktivEksponeringProduktId, setAktivEksponeringProduktId] = useState('global-core-active');


  // State for historikkdata og visning
  const [produktHistorikk, setProduktHistorikk] = useState(() => oppdaterHistorikkTilRapportDato(DATAFEED_PRODUKT_HISTORIKK));
  const [historikkPeriode, setHistorikkPeriode] = useState('5y'); // 1y, 3y, 5y, max
  const [visScenarioanalyse, setVisScenarioanalyse] = useState(false);
  const [scenarioLosninger, setScenarioLosninger] = useState({ pessimistisk: null, optimistisk: null });
  const [showPessimisticLosninger, setShowPessimisticLosninger] = useState(true);
  const [valgteProdukterHistorikk, setValgteProdukterHistorikk] = useState(['global-core-active', 'global-edge', 'basis']);
  
  // Valgt produkt for detaljvisning
  const [valgtProduktDetalj, setValgtProduktDetalj] = useState(null);
  
  const [pensumProdukter, setPensumProdukter] = useState(() => JSON.parse(JSON.stringify(defaultPensumProdukter)));
  
  // Admin-innstillinger
  const [adminPassord, setAdminPassord] = useState('');
  const [erAdmin, setErAdmin] = useState(false);
  const [adminMelding, setAdminMelding] = useState('');
  const [adminBrukere, setAdminBrukere] = useState(null);
  // Admin-passordet sjekkes på serveren (PENSUM_ADMIN_PASSORD) og sendes med admin-kall.
  const loggInnAdmin = async () => {
    try {
      const resp = await fetch('/api/brukere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin', passord: adminPassord })
      });
      if (resp.ok) { setErAdmin(true); setAdminMelding(''); } else { setAdminMelding('Feil passord'); }
    } catch (e) {
      setAdminMelding('Kunne ikke kontakte serveren');
    }
  };

  // Debounce fond search — only update state for debounced results, not per keystroke
  const handleFondSokChange = useCallback((e) => {
    const val = e.target.value;
    if (fondSokTimerRef.current) clearTimeout(fondSokTimerRef.current);
    fondSokTimerRef.current = setTimeout(() => {
      setFondSokDebounced(val);
      setFondSokResultater(sokEksterneFondFuzzy(val, 50));
    }, 200);
  }, [sokEksterneFondFuzzy]);

  const storageGet = async (key) => {
    if (typeof window === 'undefined') return null;
    // Try window.storage first, then localStorage
    let val = null;
    if (window.storage && window.storage.get) {
      try {
        const result = await window.storage.get(key);
        if (result && result.value) val = result.value;
      } catch (e) { /* fallthrough */ }
    }
    if (!val && typeof localStorage !== 'undefined') {
      try { val = localStorage.getItem(key); } catch (e) { /* ignore */ }
    }
    return val;
  };

  const storageSet = async (key, value) => {
    if (typeof window === 'undefined') return false;
    let saved = false;
    // Always try BOTH storage mechanisms for redundancy
    if (window.storage && window.storage.set) {
      try { await window.storage.set(key, value); saved = true; } catch (e) { /* fallthrough */ }
    }
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(key, value); saved = true; } catch (e) { /* ignore */ }
    }
    return saved;
  };

  const storageDelete = async (key) => {
    if (typeof window === 'undefined') return false;
    // Delete from BOTH storage mechanisms
    if (window.storage && window.storage.delete) {
      try { await window.storage.delete(key); } catch (e) { /* ignore */ }
    }
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
    return true;
  };
  // Standard avkastningsrater — beregnes fra CMA-data (samme metodikk som Porteføljebygger):
  // hver aktivaklasse mappes til ett eller flere Pensum-produkter, og forventet avkastning
  // er gjennomsnittet av produktenes forventetAvkastning. Admin kan overstyre per klasse.
  const CMA_FALLBACK_RATER = { globaleAksjer: 10, norskeAksjer: 11, hoyrente: 7.5, investmentGrade: 5, privateEquity: 15, eiendom: 8 };
  const CMA_KILDE_PROGNOSE = {
    globaleAksjer: ['global-core-active', 'global-edge', 'acadian-global-equity', 'capital-group-new-pers', 'dnb-global-enhanced', 'guinness-global-equity-income'],
    norskeAksjer: ['norge-a'],
    hoyrente: ['global-hoyrente', 'nordisk-hoyrente'],
    privateEquity: ['turnstone-pe', 'unoterte-aksjer'],
    eiendom: ['amaron-re']
    // investmentGrade beregnes som hoyrente − 2,5 (IG/HY-spread) — ingen IG-produkter i CMA-arket
  };
  const cmaAvkastninger = useMemo(() => {
    const alleProdukt = [
      ...(pensumProdukter.enkeltfond || []),
      ...(pensumProdukter.fondsportefoljer || []),
      ...(pensumProdukter.eksterneFond || []),
      ...(pensumProdukter.alternative || [])
    ];
    const snitt = (ids, fallback) => {
      const verdier = ids.map(id => alleProdukt.find(p => p.id === id)?.forventetAvkastning).filter(erGyldigTall);
      if (verdier.length === 0) return fallback;
      return parseFloat((verdier.reduce((s, v) => s + v, 0) / verdier.length).toFixed(1));
    };
    const hoyrente = snitt(CMA_KILDE_PROGNOSE.hoyrente, CMA_FALLBACK_RATER.hoyrente);
    return {
      globaleAksjer: snitt(CMA_KILDE_PROGNOSE.globaleAksjer, CMA_FALLBACK_RATER.globaleAksjer),
      norskeAksjer: snitt(CMA_KILDE_PROGNOSE.norskeAksjer, CMA_FALLBACK_RATER.norskeAksjer),
      hoyrente,
      investmentGrade: parseFloat(Math.max(0, hoyrente - 2.5).toFixed(1)),
      privateEquity: snitt(CMA_KILDE_PROGNOSE.privateEquity, CMA_FALLBACK_RATER.privateEquity),
      eiendom: snitt(CMA_KILDE_PROGNOSE.eiendom, CMA_FALLBACK_RATER.eiendom)
    };
  }, [pensumProdukter]);
  // Admin-overstyringer per klasse (partielt objekt). Nøkler som ikke er overstyrt
  // arver fra cmaAvkastninger og endres dermed automatisk når CMA-data endres.
  const [avkastningsraterOverride, setAvkastningsraterOverride] = useState({});
  const avkastningsrater = useMemo(() => ({ ...cmaAvkastninger, ...avkastningsraterOverride }), [cmaAvkastninger, avkastningsraterOverride]);
  const setAvkastningsrater = useCallback((updater) => {
    setAvkastningsraterOverride((prev) => {
      const current = { ...cmaAvkastninger, ...prev };
      const next = typeof updater === 'function' ? updater(current) : updater;
      // Behold bare nøkler som faktisk avviker fra CMA, slik at CMA-endringer fortsatt forplanter seg
      const filtrert = {};
      Object.keys(next).forEach(k => {
        if (next[k] !== cmaAvkastninger[k]) filtrert[k] = next[k];
      });
      return filtrert;
    });
  }, [cmaAvkastninger]);
  const [avkastningsraterLaast, setAvkastningsraterLaast] = useState(false);

  // Last admin-data fra storage ved oppstart

  const beregnAarsavkastningFraHistorikk = useCallback(
    (produktId, aar) => beregnAarsavkastningFraData(produktHistorikk?.[produktId]?.data, aar),
    [produktHistorikk]
  );

  const hentAarsverdiForProdukt = useCallback((produkt, felt, aar) => {
    if (aar === RAPPORT_DATO_OBJEKT.getFullYear()
      && Object.prototype.hasOwnProperty.call(HISTORIKK_2026_YTD, produkt?.id)) {
      return HISTORIKK_2026_YTD[produkt.id];
    }
    const fraHistorikk = beregnAarsavkastningFraHistorikk(produkt?.id, aar);
    if (erGyldigTall(produkt?.[felt])) return produkt[felt];
    return fraHistorikk;
  }, [beregnAarsavkastningFraHistorikk]);

  useEffect(() => {
    const lastAdminData = async () => {
      try {
        const raterValue = await storageGet('pensum_admin_avkastningsrater');
        if (raterValue) {
          // Lagrede verdier kan være enten full rate-objekt (gammelt format) eller
          // partielt override-objekt (nytt format). Begge tolkes som overrides — keys
          // som matcher CMA filtreres ut neste gang noen redigerer.
          try { setAvkastningsraterOverride(JSON.parse(raterValue) || {}); } catch {}
        }

        // Lagrede produktdata gjelder bare for rapportdatoen de ble lagret for. Etter en
        // månedsoppdatering (ny rapportdato) brukes standarddataene, ellers ville nye
        // avkastningstall og CMA-forventninger aldri slått gjennom i denne nettleseren.
        const produktValue = await storageGet('pensum_admin_produkter');
        const produktDato = await storageGet('pensum_admin_produkter_rapportdato');
        if (produktValue && produktDato === RAPPORT_DATO) {
          // Lagrede produkter kan være eldre enn feltene for kostnad og valuta, og mangle nye
          // produkter. Disse feltene og manglende produkter hentes fra standarddataene;
          // admins egne endringer (avkastning, risiko osv.) beholdes.
          const lagret = JSON.parse(produktValue);
          const METAFELT = ['honorar', 'andelsklasser', 'lopendeKostnad', 'suksesshonorar', 'valuta', 'gruppe'];
          const flettet = {};
          Object.keys(defaultPensumProdukter).forEach((kat) => {
            const std = defaultPensumProdukter[kat] || [];
            const liste = (lagret?.[kat] || []).map((p) => {
              const d = std.find((x) => x.id === p.id);
              if (!d) return p;
              const meta = Object.fromEntries(METAFELT.filter((f) => p[f] === undefined && d[f] !== undefined).map((f) => [f, d[f]]));
              return { ...p, ...meta };
            });
            flettet[kat] = [...liste, ...std.filter((d) => !liste.some((p) => p.id === d.id)).map((d) => JSON.parse(JSON.stringify(d)))];
          });
          setPensumProdukter({ ...lagret, ...flettet });
        }

        const laastValue = await storageGet('pensum_admin_avkastningsrater_laast');
        if (laastValue) {
          setAvkastningsraterLaast(JSON.parse(laastValue));
        }

        const markedssynValue = await storageGet('pensum_admin_markedssyn');
        if (markedssynValue) {
          setMarkedssynData(JSON.parse(markedssynValue));
        }
      } catch (e) {
        console.log('Kunne ikke laste admin-data:', e);
      }
    };
    lastAdminData();
  }, []);

  // Innstillinger for Pensum Løsninger
  const [visAlternative, setVisAlternative] = useState(false);

  // Porteføljeallokering for Pensum-produkter
  // Startporteføljen er standardporteføljen for Moderat (samme som standard risikoprofil),
  // slik at forslaget og risikoprofilen stemmer overens fra start.
  const [pensumAllokering, setPensumAllokering] = useState(() => {
    const alle = [...defaultPensumProdukter.enkeltfond, ...defaultPensumProdukter.fondsportefoljer, ...defaultPensumProdukter.alternative];
    return (defaultPensumStandardLosninger['50/50 uten basis']?.allokeringer['Allokering 1 (Kjerne)'] || [])
      .map(r => ({ id: r.id, navn: alle.find(p => p.id === r.id)?.navn || r.id, vekt: r.vekt, kategori: r.kategori }));
  });

  // Standardporteføljer-knapper (Defensiv/Moderat/Dynamisk/Offensiv)
  // bruker "uten basis"-variantene med Allokering 1 (Kjerne) fra Definerte porteføljer.
  // Definerte porteføljer-dropdown gir bredere utvalg (m/u Basis, Allok 2 og 3).
  const pensumStandardPortefoljer = useMemo(() => {
    const alleProdukter = [...defaultPensumProdukter.enkeltfond, ...defaultPensumProdukter.fondsportefoljer, ...(defaultPensumProdukter.eksterneFond || []), ...defaultPensumProdukter.alternative];
    const tilAllokering = (rader) => rader.map(r => {
      const prod = alleProdukter.find(p => p.id === r.id);
      return { id: r.id, navn: prod ? prod.navn : r.id, vekt: r.vekt, kategori: r.kategori };
    });
    const losning = (navn) => defaultPensumStandardLosninger[navn]?.allokeringer['Allokering 1 (Kjerne)'] || [];
    return {
      'Defensiv': tilAllokering(losning('30/70 uten basis')),
      'Moderat': tilAllokering(losning('50/50 uten basis')),
      'Dynamisk': tilAllokering(losning('70/30 uten basis')),
      'Offensiv': tilAllokering(losning('100% Aksjer'))
    };
  }, []);

  const [valgtPensumProfil, setValgtPensumProfil] = useState('Moderat');

  // Definerte porteføljer fra Pensum (skisse)
  const [valgtStandardLosning, setValgtStandardLosning] = useState(null);
  const [valgtAllokering, setValgtAllokering] = useState('Allokering 1 (Kjerne)');

  const velgPensumStandardPortefolje = (profil) => {
    setValgtPensumProfil(profil);
    setValgtStandardLosning(null);
    setPensumAllokering(pensumStandardPortefoljer[profil]);
  };

  // Startsiden: tre spørsmål, så rett til porteføljebyggeren med standardporteføljen for profilen.
  const startNyKunde = () => {
    if ((kundeNavn || aktivKundeId) && !confirm('Dette starter et nytt forslag og erstatter porteføljen som ligger inne nå. Vil du fortsette?')) return;
    const belop = parseBelop(start.belop);
    const aar = Math.min(40, Math.max(1, parseInt(start.horisont, 10) || 10));
    if (start.navn.trim()) setKundeNavn(start.navn.trim());
    if (belop > 0) setInvestertBelop(belop);
    setHorisont(aar); setLocalHorisont(String(aar));
    setRisikoprofil(start.profil);
    velgPensumStandardPortefolje(start.profil);
    setActiveTab('losninger');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const velgDefinertPortefolje = (losningNavn, allokNavn) => {
    const losning = defaultPensumStandardLosninger[losningNavn];
    if (!losning) return;
    const allok = losning.allokeringer[allokNavn];
    if (!allok) return;
    const allleProdukter = [...defaultPensumProdukter.enkeltfond, ...defaultPensumProdukter.fondsportefoljer, ...(defaultPensumProdukter.eksterneFond || []), ...defaultPensumProdukter.alternative];
    const ny = allok.map(item => {
      const prod = allleProdukter.find(p => p.id === item.id);
      return { id: item.id, navn: prod ? prod.navn : item.id, vekt: item.vekt, kategori: item.kategori };
    });
    setValgtStandardLosning(losningNavn);
    setValgtAllokering(allokNavn);
    setPensumAllokering(ny);
  };

  const leggTilPensumProdukt = (produkt, kategori) => {
    if (!pensumAllokering.find(p => p.id === produkt.id)) {
      // Morningstar-fond tar med seg produkt og eksponering, uansett hvor de legges til fra.
      const morningstar = produkt.kilde === 'morningstar' ? { produkt, eksponering: produktEksponering?.[produkt.id] || {} } : undefined;
      setPensumAllokering(prev => [...prev, { id: produkt.id, navn: produkt.navn, vekt: 0, kategori, ...(morningstar ? { morningstar } : {}) }]);
    }
  };

  // Fond fra Morningstar-universet: produkt og eksponering lages fra fondsdataene og
  // lagres også på allokeringsraden, slik at fondet finnes igjen når kundekortet lastes.
  const leggTilMorningstarFond = (fond) => {
    const { produkt, eksponering } = lagProduktFraMorningstar(fond);
    if (pensumAllokering.find(p => p.id === produkt.id)) return;
    setPensumProdukter(prev => ((prev.eksterneFond || []).some(p => p.id === produkt.id) ? prev : { ...prev, eksterneFond: [...(prev.eksterneFond || []), produkt] }));
    setProduktEksponering(prev => ({ ...prev, [produkt.id]: eksponering }));
    setPensumAllokering(prev => [...prev, { id: produkt.id, navn: produkt.navn, vekt: 0, kategori: 'eksterneFond', morningstar: { produkt, eksponering } }]);
  };

  const fjernPensumProdukt = (id) => {
    setPensumAllokering(prev => prev.filter(p => p.id !== id));
  };

  const oppdaterPensumVekt = (id, nyVekt) => {
    setPensumAllokering(prev => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const basis = investertBelop !== null ? investertBelop : totalKapital;
      const oppdater = (liste) => liste.map(p => ({
        ...p,
        belop: basis > 0 ? Math.round((p.vekt / 100) * basis) : (p.belop || 0),
      }));
      if (!autoRebalanserPensum) {
        return oppdater(prev.map(p => p.id === id ? { ...p, vekt: Math.max(0, Math.min(100, nyVekt)) } : p));
      }
      return oppdater(fordelRestVektListe(prev, idx, nyVekt));
    });
  };

  // Kronebeløp-modus i Porteføljebyggeren: skriv inn kr per produkt og få
  // vektprosent beregnet automatisk (nyttig når man replikerer en eksisterende
  // portefølje fra FA der man kjenner beløpene, ikke prosentene).
  const [pensumBelopModus, setPensumBelopModus] = useState(false);
  const oppdaterPensumBelop = (id, nyBelop) => {
    const cleanBelop = Math.max(0, Math.round(Number(nyBelop) || 0));
    const basis = investertBelop !== null ? investertBelop : totalKapital;
    const nyeBelop = pensumAllokering.map(p => {
      if (p.id === id) return cleanBelop;
      if (typeof p.belop === 'number') return p.belop;
      return basis > 0 ? Math.round((p.vekt / 100) * basis) : 0;
    });
    const nyTotal = nyeBelop.reduce((s, b) => s + b, 0);
    setPensumAllokering(prev => prev.map((p, i) => ({
      ...p,
      belop: nyeBelop[i],
      vekt: nyTotal > 0 ? parseFloat(((nyeBelop[i] / nyTotal) * 100).toFixed(2)) : 0,
    })));
    if (nyTotal > 0) setInvestertBelop(nyTotal);
  };

  const [pensumDragVekter, setPensumDragVekter] = useState({});
  const startPensumDrag = (id, value) => {
    setPensumDragVekter((prev) => ({ ...prev, [id]: value }));
  };
  const commitPensumDrag = (id) => {
    const nyVekt = pensumDragVekter[id];
    if (!erGyldigTall(nyVekt)) return;
    oppdaterPensumVekt(id, Number(nyVekt));
    setPensumDragVekter((prev) => {
      const neste = { ...prev };
      delete neste[id];
      return neste;
    });
  };

  const normaliserPensumTil100 = useCallback(() => {
    setPensumAllokering((prev) => skalerVekterTilHundreListe(prev));
  }, []);

  const pensumTotalVekt = pensumAllokering.reduce((s, p) => s + p.vekt, 0);


  // Morningstar-fond i en lastet portefølje (kundekort) legges tilbake i produktlisten.
  useEffect(() => {
    const mangler = pensumAllokering.filter(a => a.morningstar?.produkt && !(pensumProdukter.eksterneFond || []).some(p => p.id === a.id));
    if (!mangler.length) return;
    setPensumProdukter(prev => ({ ...prev, eksterneFond: [...(prev.eksterneFond || []), ...mangler.map(a => a.morningstar.produkt)] }));
    setProduktEksponering(prev => ({ ...prev, ...Object.fromEntries(mangler.map(a => [a.id, a.morningstar.eksponering || {}])) }));
  }, [pensumAllokering, pensumProdukter.eksterneFond]);

  const valgtePensumProdukterMedEksponering = useMemo(() => {
    const produktMap = new Map([...(pensumProdukter?.enkeltfond || []), ...(pensumProdukter?.fondsportefoljer || []), ...(pensumProdukter?.eksterneFond || []), ...(pensumProdukter?.alternative || [])]
      .filter((p) => p?.id)
      .map((p) => [p.id, p]));
    return pensumAllokering
      .filter((p) => (p.vekt || 0) > 0)
      .map((p) => {
        const basis = produktMap.get(p.id) || { id: p.id, navn: p.navn };
        return {
          ...basis,
          vekt: p.vekt,
          rapport: produktRapportMeta?.[p.id] || {},
          eksponering: produktEksponering?.[p.id] || {}
        };
      })
      .sort((a, b) => (b.vekt || 0) - (a.vekt || 0));
  }, [pensumAllokering, pensumProdukter, produktEksponering, produktRapportMeta]);

  useEffect(() => {
    if (!valgtePensumProdukterMedEksponering.length) return;
    if (!valgtePensumProdukterMedEksponering.some((p) => p.id === aktivEksponeringProduktId)) {
      setAktivEksponeringProduktId(valgtePensumProdukterMedEksponering[0].id);
    }
  }, [valgtePensumProdukterMedEksponering, aktivEksponeringProduktId]);

  const aktivtEksponeringsProdukt = useMemo(
    () => valgtePensumProdukterMedEksponering.find((p) => p.id === aktivEksponeringProduktId) || valgtePensumProdukterMedEksponering[0] || null,
    [valgtePensumProdukterMedEksponering, aktivEksponeringProduktId]
  );

  // Beregn vektet historisk avkastning
  const beregnPensumHistorikk = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    const aarKolonner = HISTORIKK_ARFELT;
    const aarMapping = { aar2026: 2026, aar2025: 2025, aar2024: 2024, aar2023: 2023, aar2022: 2022 };
    const resultat = {};

    const beregnFraHistorikk = (produktId, aar) => beregnAarsavkastningFraData(produktHistorikk?.[produktId]?.data, aar);

    aarKolonner.forEach((aarFelt) => {
      let vektetSum = 0;
      let totalVekt = 0;
      pensumAllokering.forEach((allok) => {
        const produkt = alleProdukt.find((p) => p.id === allok.id);
        if (!produkt || allok.vekt <= 0) return;

        // Publisert YTD fra månedsrapporten er fasit. Datafeed-historikken brukes
        // til grafer og som fallback for produkter uten et rapportert YTD-tall.
        const erInnevaerendeAar = aarMapping[aarFelt] === RAPPORT_DATO_OBJEKT.getFullYear();
        const harRapportertYtd = erInnevaerendeAar
          && Object.prototype.hasOwnProperty.call(HISTORIKK_2026_YTD, produkt.id);
        let avkastning = harRapportertYtd ? HISTORIKK_2026_YTD[produkt.id] : null;
        if (!erGyldigTall(avkastning)) {
          avkastning = harRapportertYtd
            ? null
            : (erGyldigTall(produkt?.[aarFelt]) ? Number(produkt[aarFelt]) : null);
        }
        // Mangler det rapporterte tallet (f.eks. et fond som startet i år), brukes kursene –
        // de samme som i grafen – slik at produktet ikke faller ut av årets tall alene.
        if (!erGyldigTall(avkastning)) {
          avkastning = beregnFraHistorikk(produkt.id, aarMapping[aarFelt]);
        }
        // Produkter uten historikk (f.eks. PE og eiendom) holdes utenfor. Forventet
        // avkastning er en modellantakelse og skal ikke vises som historisk avkastning.

        if (erGyldigTall(avkastning)) {
          vektetSum += avkastning * allok.vekt;
          totalVekt += allok.vekt;
        }
      });
      resultat[aarFelt] = totalVekt > 0 ? vektetSum / totalVekt : null;
    });

    return resultat;
  }, [pensumAllokering, pensumProdukter, produktHistorikk]);

  // Beregn aktivafordeling (aksjer vs renter vs alternativer)
  // Pensum Basis (aktivatype 'dynamisk'/'blandet') splittes 50/50 mellom aksjer og renter.
  const pensumAktivafordeling = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    let aksjeVekt = 0;
    let renteVekt = 0;
    let alternativVekt = 0;
    let kontantVekt = 0;

    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        if (produkt.aktivatype === 'aksje') {
          aksjeVekt += allok.vekt;
        } else if (produkt.aktivatype === 'rente') {
          renteVekt += allok.vekt;
        } else if (produkt.aktivatype === 'alternativ') {
          alternativVekt += allok.vekt;
        } else if (produkt.aktivatype === 'kontanter') {
          kontantVekt += allok.vekt;
        } else if (produkt.aktivatype === 'blandet' || produkt.aktivatype === 'dynamisk') {
          aksjeVekt += allok.vekt * 0.5;
          renteVekt += allok.vekt * 0.5;
        }
      }
    });

    return [
      { name: 'Aksjer', value: parseFloat(aksjeVekt.toFixed(1)), color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: parseFloat(renteVekt.toFixed(1)), color: PENSUM_COLORS.salmon },
      { name: 'Alternativer', value: parseFloat(alternativVekt.toFixed(1)), color: PENSUM_COLORS.teal },
      { name: 'Kontanter', value: parseFloat(kontantVekt.toFixed(1)), color: PENSUM_COLORS.gray }
    ];
  }, [pensumAllokering, pensumProdukter]);

  // Beregn likviditetsfordeling
  const pensumLikviditet = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    let likvidVekt = 0;
    let illikvidVekt = 0;
    
    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        if (produkt.likviditet === 'likvid') {
          likvidVekt += allok.vekt;
        } else if (produkt.likviditet === 'illikvid') {
          illikvidVekt += allok.vekt;
        }
      }
    });
    
    return { likvid: likvidVekt, illikvid: illikvidVekt };
  }, [pensumAllokering, pensumProdukter]);

  // Beregn forventet avkastning for Pensum-portefølje
  const pensumForventetAvkastning = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    let vektetSum = 0;
    let totalVekt = 0;

    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        // Bruk forventet avkastning fremover (fra produktdata eller rapportmeta)
        const fAvk = produkt.forventetAvkastning ?? produktRapportMeta?.[allok.id]?.expectedReturn;
        const avkastning = erGyldigTall(fAvk) ? fAvk : 0;
        vektetSum += avkastning * allok.vekt;
        totalVekt += allok.vekt;
      }
    });

    return totalVekt > 0 ? vektetSum / totalVekt : 0;
  }, [pensumAllokering, pensumProdukter, produktRapportMeta]);

  // Volatilitet som brukes i scenarioene. Forventet avkastning er CMA-basert, så risikoen
  // hentes også fra CMA (vektet forventet risiko per produkt). Vektet snitt ser bort fra
  // spredningsgevinst og er derfor et forsiktig anslag. Historisk porteføljevolatilitet
  // brukes bare som reserve når produktene mangler forventet risiko.
  const pensumScenarioVolatilitet = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    let sum = 0; let vekt = 0;
    pensumAllokering.forEach((a) => {
      const r = alleProdukt.find((p) => p.id === a.id)?.forventetRisiko;
      if (a.vekt > 0 && erGyldigTall(r)) { sum += r * a.vekt; vekt += a.vekt; }
    });
    if (vekt > 0) return { verdi: sum / vekt, kilde: 'forventet' };
    const historisk = beregnPortefoljeStatistikk(pensumAllokering, produktHistorikk, periodeStartDato(5))
      ?? beregnPortefoljeStatistikk(pensumAllokering, produktHistorikk, periodeStartDato(3));
    if (erGyldigTall(historisk?.risiko)) return { verdi: historisk.risiko, kilde: 'historisk' };
    return { verdi: 10, kilde: 'standard' };
  }, [pensumAllokering, pensumProdukter, produktHistorikk]);

  
  const valgtLosning = null; // Fjernet gammel state

  // Kundearkivet tilhører den innloggede brukeren. Fritekstfeltet «Rådgiver» brukes bare
  // når ingen er logget inn, slik at et annet navn i feltet ikke bytter eller overskriver arkivet.
  const arkivEier = (bruker?.navn || radgiver || '').trim();
  const arkivNokkel = (eier) => 'pensum_kunder_' + eier.toLowerCase().replace(/\s+/g, '_');
  const lesArkiv = async (eier) => {
    if (!eier) return [];
    let loaded = null; let lesefeil = null;
    try {
      if (window.storage && window.storage.get) {
        const result = await window.storage.get(arkivNokkel(eier));
        if (result && result.value) loaded = result.value;
      }
    } catch (e) { lesefeil = e; }
    if (!loaded && typeof localStorage !== 'undefined') {
      try { loaded = localStorage.getItem(arkivNokkel(eier)); } catch (e) { lesefeil = e; }
    }
    // En lesefeil uten noe å falle tilbake på er ikke det samme som et tomt arkiv:
    // kast, slik at lagring og sletting ikke skriver en tom liste over kundene.
    if (!loaded && lesefeil) throw lesefeil;
    if (!loaded) return [];
    // Et skadet arkiv skal ikke ta ned siden. Kaster videre, slik at lagring ikke skriver over det.
    const liste = JSON.parse(loaded);
    return Array.isArray(liste) ? liste : [];
  };
  const [arkivFeil, setArkivFeil] = useState(false);
  useEffect(() => {
    let avbrutt = false;
    lesArkiv(arkivEier)
      .then((liste) => { if (!avbrutt) { setLagredeKunder(liste); setArkivFeil(false); } })
      .catch(() => { if (!avbrutt) { setLagredeKunder([]); setArkivFeil(true); } });
    return () => { avbrutt = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arkivEier]);

  // Hent alle data som objekt
  const getKundeData = useCallback(() => ({
    id: aktivKundeId || Date.now().toString(),
    kundeNavn,
    kundeSelskap,
    radgiver,
    dato,
    risikoprofil,
    horisont,
    aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde,
    peFondKunde, unoterteAksjerKunde, shippingKunde,
    egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde,
    innskudd, uttak,
    allokering,
    scenarioParams,
    investeringsFormaal,
    likviditetsbehov,
    // Porteføljebygger (Pensum-portefølje) — egne tilpasninger må lagres
    pensumAllokering,
    valgtPensumProfil,
    valgtStandardLosning,
    valgtAllokering,
    pensumRebalanseringAktiv,
    pensumRebalanseringer,
    // Budsjett-overstyringer
    investertBelop,
    formuesPlanleggerBelop,
    // Forutsetninger og mål — Porteføljebygger (uavhengig)
    pbLaanAktiv, pbPrognoseFinansiering, pbLaanModus, pbAkkumulerRenter,
    pbMalAktiv, pbHovedmal, pbVisDelmal, pbDelmal,
    pbVisSluttSammensetning, pbSluttSammensetningAar,
    tilleggAktiv, tillegg,
    dagensPosisjoner, dagensPlattformAvk,
    // Forutsetninger og mål — Formuesplanlegger
    laanAktiv, prognoseFinansiering, laanModus, akkumulerRenter,
    malAktiv, hovedmal, visDelmal, delmal,
    visSluttSammensetning, sluttSammensetningAar,
    rebalanseringAktiv, rebalanseringer,
    // Kundens eksisterende portefølje, sammenligningsfond og sidevalg hører til kundekortet.
    eksisterendePortefolje, valgteFond, fondVekter, forslagSider, forslagVurdering,
    radgiver2: visRadgiver2 ? radgiver2 : null,
    // Schema-versjon for fremtidige migreringer
    schemaVersion: 2,
    sistEndret: new Date().toISOString()
  }), [aktivKundeId, kundeNavn, kundeSelskap, radgiver, eksisterendePortefolje, valgteFond, fondVekter, forslagSider, forslagVurdering, radgiver2, visRadgiver2, dato, risikoprofil, horisont, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, innskudd, uttak, allokering, scenarioParams, investeringsFormaal, likviditetsbehov, pensumAllokering, valgtPensumProfil, valgtStandardLosning, valgtAllokering, pensumRebalanseringAktiv, pensumRebalanseringer, investertBelop, formuesPlanleggerBelop, pbLaanAktiv, pbPrognoseFinansiering, pbLaanModus, pbAkkumulerRenter, pbMalAktiv, pbHovedmal, pbVisDelmal, pbDelmal, pbVisSluttSammensetning, pbSluttSammensetningAar, tilleggAktiv, tillegg, dagensPosisjoner, dagensPlattformAvk, laanAktiv, prognoseFinansiering, laanModus, akkumulerRenter, malAktiv, hovedmal, visDelmal, delmal, visSluttSammensetning, sluttSammensetningAar, rebalanseringAktiv, rebalanseringer]);

  // Last inn kundedata
  const lastKundeData = useCallback((data) => {
    setAktivKundeId(data.id);
    setKundeNavn(data.kundeNavn || '');
    setKundeSelskap(data.kundeSelskap || '');
    setDato(data.dato || new Date().toISOString().split('T')[0]);
    // Et importert eller gammelt kort kan ha en profil som ikke finnes lenger.
    const profil = RISK_PROFILES[data.risikoprofil] ? data.risikoprofil : 'Moderat';
    setRisikoprofil(profil);
    setEksisterendePortefolje(data.eksisterendePortefolje && Array.isArray(data.eksisterendePortefolje.fond) ? data.eksisterendePortefolje : TOM_EKSISTERENDE_PORTEFOLJE);
    setValgteFond(Array.isArray(data.valgteFond) ? data.valgteFond : []);
    setFondVekter(data.fondVekter && typeof data.fondVekter === 'object' ? data.fondVekter : {});
    setForslagSider(Array.isArray(data.forslagSider) ? data.forslagSider : standardSider());
    setForslagVurdering(typeof data.forslagVurdering === 'string' ? data.forslagVurdering : '');
    setVisRadgiver2(!!data.radgiver2?.navn);
    setRadgiver2(data.radgiver2?.navn ? { navn: '', tittel: '', telefon: '', epost: '', ...data.radgiver2 } : { navn: '', tittel: '', telefon: '', epost: '' });

    // Pensum-portefølje: bruk lagret hvis tilgjengelig, ellers fall tilbake til
    // standardprofil basert på risikoprofil (bakoverkompatibilitet med eldre kunder).
    if (Array.isArray(data.pensumAllokering) && data.pensumAllokering.length > 0) {
      setPensumAllokering(data.pensumAllokering);
      setValgtPensumProfil(data.valgtPensumProfil || profil);
    } else {
      setValgtPensumProfil(profil);
      if (pensumStandardPortefoljer[profil]) {
        setPensumAllokering(pensumStandardPortefoljer[profil]);
      }
    }
    if (data.valgtStandardLosning !== undefined) setValgtStandardLosning(data.valgtStandardLosning);
    if (data.valgtAllokering) setValgtAllokering(data.valgtAllokering);
    if (typeof data.pensumRebalanseringAktiv === 'boolean') setPensumRebalanseringAktiv(data.pensumRebalanseringAktiv);
    if (Array.isArray(data.pensumRebalanseringer)) setPensumRebalanseringer(data.pensumRebalanseringer);

    setHorisont(data.horisont || 10);
    setLocalHorisont((data.horisont || 10).toString());
    setAksjerKunde(data.aksjerKunde || 0);
    setAksjefondKunde(data.aksjefondKunde || 0);
    setRenterKunde(data.renterKunde || 0);
    setKontanterKunde(data.kontanterKunde || 0);
    setPeFondKunde(data.peFondKunde || 0);
    setUnoterteAksjerKunde(data.unoterteAksjerKunde || 0);
    setShippingKunde(data.shippingKunde || 0);
    setEgenEiendomKunde(data.egenEiendomKunde || 0);
    setEiendomSyndikatKunde(data.eiendomSyndikatKunde || 0);
    setEiendomFondKunde(data.eiendomFondKunde || 0);
    setInnskudd(data.innskudd || 0);
    setUttak(data.uttak || 0);
    if (data.allokering) setAllokering(data.allokering);
    if (data.scenarioParams) setScenarioParams(data.scenarioParams);
    if (data.investeringsFormaal) setInvesteringsFormaal(data.investeringsFormaal);
    if (data.likviditetsbehov) setLikviditetsbehov(data.likviditetsbehov);

    // Budsjett-overstyringer (null = bruk totalKapital)
    setInvestertBelop(data.investertBelop !== undefined ? data.investertBelop : null);
    setFormuesPlanleggerBelop(data.formuesPlanleggerBelop !== undefined ? data.formuesPlanleggerBelop : null);

    // Forutsetninger og mål — Porteføljebygger
    if (typeof data.pbLaanAktiv === 'boolean') setPbLaanAktiv(data.pbLaanAktiv);
    if (Array.isArray(data.pbPrognoseFinansiering)) setPbPrognoseFinansiering(data.pbPrognoseFinansiering);
    if (data.pbLaanModus) setPbLaanModus(data.pbLaanModus);
    if (typeof data.pbAkkumulerRenter === 'boolean') setPbAkkumulerRenter(data.pbAkkumulerRenter);
    if (typeof data.pbMalAktiv === 'boolean') setPbMalAktiv(data.pbMalAktiv);
    if (data.pbHovedmal) setPbHovedmal(data.pbHovedmal);
    if (typeof data.pbVisDelmal === 'boolean') setPbVisDelmal(data.pbVisDelmal);
    if (Array.isArray(data.pbDelmal)) setPbDelmal(data.pbDelmal);
    if (typeof data.pbVisSluttSammensetning === 'boolean') setPbVisSluttSammensetning(data.pbVisSluttSammensetning);
    setTilleggAktiv(data.tilleggAktiv === true);
    setTillegg(rensTillegg(data.tillegg));
    setDagensPosisjoner(rensPosisjoner(data.dagensPosisjoner));
    setDagensPlattformAvk(rensPlattformAvkastning(data.dagensPlattformAvk));
    if (typeof data.pbSluttSammensetningAar === 'number') setPbSluttSammensetningAar(data.pbSluttSammensetningAar);

    // Forutsetninger og mål — Formuesplanlegger
    if (typeof data.laanAktiv === 'boolean') setLaanAktiv(data.laanAktiv);
    if (Array.isArray(data.prognoseFinansiering)) setPrognoseFinansiering(data.prognoseFinansiering);
    if (data.laanModus) setLaanModus(data.laanModus);
    if (typeof data.akkumulerRenter === 'boolean') setAkkumulerRenter(data.akkumulerRenter);
    if (typeof data.malAktiv === 'boolean') setMalAktiv(data.malAktiv);
    if (data.hovedmal) setHovedmal(data.hovedmal);
    if (typeof data.visDelmal === 'boolean') setVisDelmal(data.visDelmal);
    if (Array.isArray(data.delmal)) setDelmal(data.delmal);
    if (typeof data.visSluttSammensetning === 'boolean') setVisSluttSammensetning(data.visSluttSammensetning);
    if (typeof data.sluttSammensetningAar === 'number') setSluttSammensetningAar(data.sluttSammensetningAar);
    if (typeof data.rebalanseringAktiv === 'boolean') setRebalanseringAktiv(data.rebalanseringAktiv);
    if (Array.isArray(data.rebalanseringer)) setRebalanseringer(data.rebalanseringer);

    setVisKundeliste(false);
    setActiveTab('input');
  }, [pensumStandardPortefoljer]);

  // ============ BRUKER-AUTENTISERING ============
  
  // Last bruker fra storage ved oppstart
  useEffect(() => {
    const lastBruker = async () => {
      try {
        const brukerJson = await storageGet('pensum_aktiv_bruker');
        if (brukerJson) {
          const brukerData = JSON.parse(brukerJson);
          setBruker(brukerData);
          if (brukerData.navn) setRadgiver(brukerData.navn);
        }
      } catch (e) {
        console.log('Kunne ikke laste bruker:', e);
      }
    };
    lastBruker();
  }, []);

  // Registrer ny bruker
  const registrerBruker = useCallback(async (registrerNavn, registrerEpost, registrerPin, ekstraFelter = {}) => {
    setAuthFeilmelding('');

    if (!registrerEpost || !registrerEpost.includes('@')) {
      setAuthFeilmelding('Vennligst oppgi en gyldig e-postadresse');
      return;
    }
    if (!registrerPin || registrerPin.length < 4) {
      setAuthFeilmelding('PIN må være minst 4 tegn');
      return;
    }
    if (!registrerNavn) {
      setAuthFeilmelding('Vennligst oppgi ditt navn');
      return;
    }

    try {
      const epostNormalisert = registrerEpost.toLowerCase().trim();
      let nyBruker = null;

      // Try server API first
      try {
        const resp = await fetch('/api/brukere', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ epost: epostNormalisert, pin: registrerPin, navn: registrerNavn, telefon: ekstraFelter.telefon || '', tittel: ekstraFelter.tittel || 'Investeringsrådgiver' })
        });
        if (resp.status === 409) {
          setAuthFeilmelding('Denne e-postadressen er allerede registrert');
          return;
        }
        if (resp.ok) {
          // Serveren sender ikke PIN tilbake; behold den lokalt slik at egne profilendringer kan bekreftes.
          nyBruker = { ...(await resp.json()), pin: registrerPin };
        }
      } catch (apiErr) {
        console.log('API ikke tilgjengelig, bruker lokal lagring:', apiErr);
      }

      // Fallback to local storage if API failed
      if (!nyBruker) {
        const brukereKey = 'pensum_brukere';
        let brukere = {};
        const raw = await storageGet(brukereKey);
        if (raw) brukere = JSON.parse(raw);

        if (brukere[epostNormalisert]) {
          setAuthFeilmelding('Denne e-postadressen er allerede registrert');
          return;
        }

        nyBruker = {
          epost: epostNormalisert,
          pin: registrerPin,
          navn: registrerNavn,
          telefon: ekstraFelter.telefon || '',
          tittel: ekstraFelter.tittel || 'Investeringsrådgiver',
          bilde: '',
          opprettet: new Date().toISOString()
        };

        brukere[epostNormalisert] = nyBruker;
        await storageSet(brukereKey, JSON.stringify(brukere));
      }

      await storageSet('pensum_aktiv_bruker', JSON.stringify(nyBruker));

      setBruker(nyBruker);
      setRadgiver(nyBruker.navn);
      setVisRegistrerModal(false);

      if (ventPaaRegistrering) {
        setVentPaaRegistrering(false);
        ventLagringRef.current = true;
      }
    } catch (e) {
      setAuthFeilmelding('Kunne ikke registrere bruker. Prøv igjen.');
      console.error('Registreringsfeil:', e);
    }
  }, [ventPaaRegistrering]);

  // Logg inn bruker
  const loggInnBruker = useCallback(async (loginEpost, loginPin) => {
    setAuthFeilmelding('');

    if (!loginEpost || !loginPin) {
      setAuthFeilmelding('Vennligst fyll inn e-post og PIN');
      return;
    }

    try {
      const epostNormalisert = loginEpost.toLowerCase().trim();
      let brukerData = null;

      // PIN sjekkes på serveren; serveren sender aldri PIN tilbake.
      try {
        const resp = await fetch('/api/brukere', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', epost: epostNormalisert, pin: loginPin })
        });
        if (resp.status === 401) {
          setAuthFeilmelding('Feil PIN-kode');
          return;
        }
        if (resp.ok) brukerData = { ...(await resp.json()), pin: loginPin };
      } catch (apiErr) {
        console.log('API ikke tilgjengelig, bruker lokal lagring:', apiErr);
      }

      // Reserve: brukere som bare er lagret lokalt i denne nettleseren
      if (!brukerData) {
        const raw = await storageGet('pensum_brukere');
        const lokal = (raw ? JSON.parse(raw) : {})[epostNormalisert] || null;
        if (!lokal) {
          setAuthFeilmelding('Fant ingen bruker med denne e-postadressen');
          return;
        }
        if (lokal.pin !== loginPin) {
          setAuthFeilmelding('Feil PIN-kode');
          return;
        }
        brukerData = lokal;
      }

      await storageSet('pensum_aktiv_bruker', JSON.stringify(brukerData));

      setBruker(brukerData);
      setRadgiver(brukerData.navn);
      setVisLoginModal(false);

      // Hvis vi ventet på innlogging for å lagre, gjør det nå
      if (ventPaaRegistrering) {
        setVentPaaRegistrering(false);
        ventLagringRef.current = true;
      }
    } catch (e) {
      setAuthFeilmelding('Kunne ikke logge inn. Prøv igjen.');
      console.error('Innloggingsfeil:', e);
    }
  }, [ventPaaRegistrering]);

  // Logg ut bruker
  const loggUtBruker = useCallback(async () => {
    try {
      await storageDelete('pensum_aktiv_bruker');
    } catch (e) {
      console.log('Kunne ikke slette bruker fra storage:', e);
    }
    setBruker(null);
    setRadgiver('');
  }, []);

  const [visProfilPanel, setVisProfilPanel] = useState(false);

  // Oppdater brukerprofil (bilde, telefon, tittel)
  const oppdaterBrukerProfil = useCallback(async (felt, verdi) => {
    if (!bruker) return;
    const oppdatertBruker = { ...bruker, [felt]: verdi };
    setBruker(oppdatertBruker);
    await storageSet('pensum_aktiv_bruker', JSON.stringify(oppdatertBruker));
    // Update server too
    try {
      await fetch('/api/brukere', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epost: bruker.epost, pin: bruker.pin, [felt]: verdi })
      });
    } catch (e) {
      console.log('Kunne ikke oppdatere bruker på server:', e);
    }
  }, [bruker]);

  // Håndter bildeopplasting for rådgiver
  const handleBildeUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      alert('Bildet er for stort. Maks 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      oppdaterBrukerProfil('bilde', ev.target.result);
    };
    reader.readAsDataURL(file);
  }, [oppdaterBrukerProfil]);

  // Intern lagringsfunksjon (etter autentisering)
  const lagreKundeEtterAuth = useCallback(async () => {
    if (!kundeNavn && !kundeSelskap) {
      alert('Vennligst fyll inn investor- eller selskapsnavn først');
      return;
    }
    
    if (!arkivEier) return;
    const storageKey = arkivNokkel(arkivEier);
    const kundeData = getKundeData();

    // Les arkivet på nytt rett før skriving, slik at en utdatert liste i minnet
    // (f.eks. rett etter innlogging) aldri skriver over det som ligger lagret.
    let arkiv;
    try { arkiv = await lesArkiv(arkivEier); } catch (e) {
      alert('Kundearkivet kunne ikke leses, så kunden ble ikke lagret. Bruk «Eksporter» for å lagre kunden som fil.');
      return;
    }
    let oppdatertListe;
    const eksisterendeIndex = arkiv.findIndex(k => k.id === kundeData.id);
    if (eksisterendeIndex >= 0) {
      oppdatertListe = [...arkiv];
      oppdatertListe[eksisterendeIndex] = kundeData;
    } else {
      oppdatertListe = [...arkiv, kundeData];
    }

    const jsonStr = JSON.stringify(oppdatertListe);
    let saved = false;
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, jsonStr);
        saved = true;
      }
    } catch (e) {
      console.log('window.storage save failed:', e);
    }
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(storageKey, jsonStr); saved = true; } catch (e) { /* ignore */ }
    }
    setLagredeKunder(oppdatertListe);
    setAktivKundeId(kundeData.id);
    if (saved) {
      setLagringsStatus(`Lagret: ${kundeData.kundeNavn || kundeData.kundeSelskap}`);
      setTimeout(() => setLagringsStatus(''), 2000);
    } else {
      alert('Automatisk lagring er ikke tilgjengelig. Bruk "Eksporter" for å lagre kunden som fil.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arkivEier, kundeNavn, kundeSelskap, getKundeData]);

  // «Lagre» uten å være innlogget: lagringen fullføres når innloggingen er på plass,
  // med brukeren og arkivet slik de er da.
  useEffect(() => {
    if (bruker && ventLagringRef.current) {
      ventLagringRef.current = false;
      lagreKundeEtterAuth();
    }
  }, [bruker, lagreKundeEtterAuth]);

  // Lagre kunde (hovedfunksjon)
  const lagreKunde = useCallback(async () => {
    if (!kundeNavn && !kundeSelskap) {
      alert('Vennligst fyll inn investor- eller selskapsnavn først');
      return;
    }
    
    // Hvis bruker ikke er innlogget, vis valg
    if (!bruker) {
      setVentPaaRegistrering(true);
      setVisLoginModal(true);
      return;
    }
    
    // Bruker er innlogget, lagre direkte
    await lagreKundeEtterAuth();
  }, [kundeNavn, kundeSelskap, bruker, lagreKundeEtterAuth]);

  // Slett kunde
  const slettKunde = useCallback(async (id) => {
    if (!confirm('Er du sikker på at du vil slette denne kunden?')) return;
    if (!arkivEier) return;
    const storageKey = arkivNokkel(arkivEier);
    let arkiv;
    try { arkiv = await lesArkiv(arkivEier); } catch (e) { alert('Kundearkivet kunne ikke leses, så ingenting ble slettet.'); return; }
    const oppdatertListe = arkiv.filter(k => k.id !== id);
    
    const jsonStr = JSON.stringify(oppdatertListe);
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, jsonStr);
      }
    } catch (e) {
      console.log('Could not save to window.storage:', e);
    }
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(storageKey, jsonStr); } catch (e) { /* ignore */ }
    }

    setLagredeKunder(oppdatertListe);
    if (aktivKundeId === id) setAktivKundeId(null);
  }, [radgiver, lagredeKunder, aktivKundeId]);

  // Ny kunde
  const nyKunde = useCallback(() => {
    setAktivKundeId(null);
    setTilleggAktiv(false);
    setTillegg([]);
    setDagensPosisjoner([]);
    setDagensPlattformAvk([]);
    setKundeNavn('');
    setKundeSelskap('');
    setDato(new Date().toISOString().split('T')[0]);
    setRisikoprofil('Moderat');
    setHorisont(10);
    setLocalHorisont('10');
    setAksjerKunde(DEFAULT_KUNDEKAPITAL.aksjerKunde);
    setAksjefondKunde(DEFAULT_KUNDEKAPITAL.aksjefondKunde);
    setRenterKunde(DEFAULT_KUNDEKAPITAL.renterKunde);
    setKontanterKunde(DEFAULT_KUNDEKAPITAL.kontanterKunde);
    setPeFondKunde(DEFAULT_KUNDEKAPITAL.peFondKunde);
    setUnoterteAksjerKunde(DEFAULT_KUNDEKAPITAL.unoterteAksjerKunde);
    setShippingKunde(DEFAULT_KUNDEKAPITAL.shippingKunde);
    setEgenEiendomKunde(DEFAULT_KUNDEKAPITAL.egenEiendomKunde);
    setEiendomSyndikatKunde(DEFAULT_KUNDEKAPITAL.eiendomSyndikatKunde);
    setEiendomFondKunde(DEFAULT_KUNDEKAPITAL.eiendomFondKunde);
    setInnskudd(0);
    setUttak(0);
    setAllokering(beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Moderat', avkastningsrater));
    // Pensum-forslaget følger risikoprofilen også for en ny kunde.
    setValgtPensumProfil('Moderat');
    setPensumAllokering(pensumStandardPortefoljer['Moderat']);
    setInvestertBelop(null);
    setFormuesPlanleggerBelop(null);
    setInvesteringsFormaal('Utvikle finansiell formue');
    setLikviditetsbehov('Begrenset');
    // Forrige kundes portefølje, sammenligningsfond og sidevalg skal ikke følge med.
    setEksisterendePortefolje(TOM_EKSISTERENDE_PORTEFOLJE);
    setValgteFond([]);
    setFondVekter({});
    setForslagSider(standardSider());
    setForslagVurdering('');
    setVisRadgiver2(false);
    setRadgiver2({ navn: '', tittel: '', telefon: '', epost: '' });
    setVisKundeliste(false);
    setActiveTab('input');
  }, [avkastningsrater, pensumStandardPortefoljer]);

  const brukLunaFelter = useCallback((fields = {}, { byttFane = true } = {}) => {
    const brukTekst = (key, setter) => { if (typeof fields[key] === 'string' && fields[key].trim()) setter(fields[key].trim()); };
    const brukTall = (key, setter) => { if (typeof fields[key] === 'number' && Number.isFinite(fields[key]) && fields[key] >= 0) setter(fields[key]); };
    brukTekst('kundeNavn', setKundeNavn);
    brukTekst('kundeSelskap', setKundeSelskap);
    brukTekst('investeringsFormaal', setInvesteringsFormaal);
    brukTekst('likviditetsbehov', setLikviditetsbehov);
    if (['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].includes(fields.risikoprofil)) setRisikoprofil(fields.risikoprofil);
    brukTall('horisont', (value) => { setHorisont(value); setLocalHorisont(String(value)); });
    brukTall('aksjerKunde', setAksjerKunde); brukTall('aksjefondKunde', setAksjefondKunde);
    brukTall('renterKunde', setRenterKunde); brukTall('kontanterKunde', setKontanterKunde);
    brukTall('peFondKunde', setPeFondKunde); brukTall('unoterteAksjerKunde', setUnoterteAksjerKunde);
    brukTall('shippingKunde', setShippingKunde); brukTall('egenEiendomKunde', setEgenEiendomKunde);
    brukTall('eiendomSyndikatKunde', setEiendomSyndikatKunde); brukTall('eiendomFondKunde', setEiendomFondKunde);

    const likvid = ['aksjerKunde', 'aksjefondKunde', 'renterKunde', 'kontanterKunde']
      .reduce((sum, key) => sum + (typeof fields[key] === 'number' ? fields[key] : ({ aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde })[key]), 0);
    const pe = typeof fields.peFondKunde === 'number' ? fields.peFondKunde : peFondKunde;
    const eiendom = ['egenEiendomKunde', 'eiendomSyndikatKunde', 'eiendomFondKunde']
      .reduce((sum, key) => sum + (typeof fields[key] === 'number' ? fields[key] : ({ egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde })[key]), 0);
    setAllokering(beregnAllokering(likvid, pe, eiendom, fields.risikoprofil || risikoprofil, avkastningsrater));
    if (byttFane) setActiveTab('input');
  }, [aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, risikoprofil, avkastningsrater]);

  // Eksporter til fil
  const eksporterKunde = useCallback(() => {
    const data = getKundeData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Kunde_' + (kundeNavn || 'ukjent').replace(/[^a-zA-Z0-9æøåÆØÅ]/g, '_') + '.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getKundeData, kundeNavn]);

  // Importer fra fil
  const importerKunde = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        data.id = Date.now().toString(); // Ny ID for importert kunde
        lastKundeData(data);
        alert('Kunde importert! Husk å lagre for å beholde endringene.');
      } catch (err) {
        alert('Kunne ikke lese filen. Sjekk at det er en gyldig JSON-fil.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [lastKundeData]);

  const likvideTotal = aksjerKunde + aksjefondKunde + renterKunde + kontanterKunde;
  const peTotal = peFondKunde + unoterteAksjerKunde + shippingKunde;
  const eiendomTotal = egenEiendomKunde + eiendomSyndikatKunde + eiendomFondKunde;
  const illikvideTotal = peTotal + eiendomTotal;
  const totalKapital = likvideTotal + illikvideTotal;
  const nettoKontantstrom = innskudd - uttak;

  // Porteføljebyggerens egne lån-utledede verdier (uavhengig av Formuesplanleggeren)
  const pbPortefoljeBelop = investertBelop !== null ? investertBelop : totalKapital;
  const pbTotalLaan = pbLaanAktiv ? pbPrognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0), 0) : 0;
  const pbAarligRentekostnad = pbLaanAktiv ? pbPrognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0) * (Number(l.rente) || 0) / 100, 0) : 0;
  const pbEksisterendeLaanModus = pbLaanAktiv && pbLaanModus === 'eksisterende';
  const pbEgenkapitalBelop = pbEksisterendeLaanModus ? Math.max(0, pbPortefoljeBelop - pbTotalLaan) : pbPortefoljeBelop;
  const pbEffektivtInvestertBelop = pbEksisterendeLaanModus ? pbPortefoljeBelop : pbEgenkapitalBelop + pbTotalLaan;

  // Sjekk om kunden har alternative investeringer
  const harAlternativeInvesteringer = illikvideTotal > 0;
  // Effektiv verdi for checkbox: bruker manuell verdi hvis satt, ellers basert på kundedata
  const effektivVisAlternative = visAlternativeAllokering !== null ? visAlternativeAllokering : harAlternativeInvesteringer;

  // Beregn prognose for Pensum-portefølje (må være etter totalKapital er definert)
  const pensumPrognose = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    const totalVekt = pensumAllokering.reduce((s, p) => s + (p.vekt || 0), 0) || 1;
    const produkterMedAvk = pensumAllokering.filter(a => a.vekt > 0).map(a => {
      const produkt = alleProdukt.find(p => p.id === a.id);
      const fAvk = produkt?.forventetAvkastning ?? produktRapportMeta?.[a.id]?.expectedReturn ?? 0;
      return { id: a.id, navn: a.navn, vektPct: a.vekt / totalVekt, avkastning: (erGyldigTall(fAvk) ? fAvk : 0) / 100 };
    });

    // Eksponeringsgrunnlag inkluderer lån (gearing) når lånefinansiering er aktiv.
    const kapital = pbEffektivtInvestertBelop;
    // Vektet lånerente brukes når rentene akkumuleres på lånet.
    const veietLaaneRente = pbTotalLaan > 0
      ? pbPrognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0) * (Number(l.rente) || 0) / 100, 0) / pbTotalLaan
      : 0;
    // Når rentene ikke akkumuleres, belaster de den årlige kontantstrømmen.
    const effektivKontantstrom = nettoKontantstrom - (pbAkkumulerRenter ? 0 : pbAarligRentekostnad);
    let aktueltLaan = pbTotalLaan;
    const prognose = [];
    const verdier = {};
    produkterMedAvk.forEach(p => { verdier[p.id] = p.vektPct * kapital; });

    for (let i = 0; i <= horisont; i++) {
      const row = { year: new Date().getFullYear() + i };

      // Lånebalanse vokser hvert år når renter akkumuleres (compound)
      if (i > 0 && pbAkkumulerRenter) {
        aktueltLaan = aktueltLaan * (1 + veietLaaneRente);
      }

      // Apply yearly rebalansering before growth (skip year 0)
      if (pensumRebalanseringAktiv && i > 0 && pensumRebalanseringer.length > 0) {
        pensumRebalanseringer.forEach(reb => {
          const fra = produkterMedAvk.find(p => p.id === reb.fraId);
          const til = produkterMedAvk.find(p => p.id === reb.tilId);
          if (!fra || !til) return;
          const flyttBelop = (verdier[fra.id] || 0) * ((reb.prosentPerAar || 0) / 100);
          verdier[fra.id] = (verdier[fra.id] || 0) - flyttBelop;
          verdier[til.id] = (verdier[til.id] || 0) + flyttBelop;
        });
      }

      let total = 0;
      produkterMedAvk.forEach(p => {
        if (i > 0) {
          // Apply net cash flow (etter rentekostnad) proportionally to current weights
          const sumNa = produkterMedAvk.reduce((s, q) => s + (verdier[q.id] || 0), 0) || 1;
          const naVekt = (verdier[p.id] || 0) / sumNa;
          const cashflow = effektivKontantstrom * naVekt;
          verdier[p.id] = Math.max(0, (verdier[p.id] + cashflow) * (1 + p.avkastning));
        }
        row[p.navn] = Math.round(verdier[p.id]);
        total += verdier[p.id];
      });
      row.verdi = Math.round(total);
      row.total = Math.round(total);
      row.laanBalanse = Math.round(aktueltLaan);
      row.nettoEtterLaan = Math.round(total - aktueltLaan);
      prognose.push(row);
    }
    return prognose;
  }, [pensumAllokering, pensumProdukter, produktRapportMeta, totalKapital, investertBelop, horisont, nettoKontantstrom, pensumRebalanseringAktiv, pensumRebalanseringer, pbEffektivtInvestertBelop, pbTotalLaan, pbAarligRentekostnad, pbAkkumulerRenter, pbPrognoseFinansiering]);

  const pensumProduktFarger = PORTEFOLJE_FARGER;
  // Øvrige investeringer: fremskrivning og totalbilde, bare når funksjonen er slått på.
  const tilleggLinjer = useMemo(() => (tilleggAktiv ? rensTillegg(tillegg).filter((x) => x.belop > 0) : []), [tilleggAktiv, tillegg]);
  const tilleggFrem = useMemo(() => fremskrivTillegg(tilleggLinjer, horisont), [tilleggLinjer, horisont]);
  const totalbilde = useMemo(() => (tilleggLinjer.length ? beregnTotalbilde({
    pensumBelop: pbEffektivtInvestertBelop, pensumKlasser: pensumAktivafordeling, pensumAvkastning: pensumForventetAvkastning, tillegg: tilleggLinjer,
  }) : null), [tilleggLinjer, pbEffektivtInvestertBelop, pensumAktivafordeling, pensumForventetAvkastning]);
  const TILLEGG_NAVN = 'Øvrige investeringer';
  // Prognosegrafen får et ekstra lag for øvrige investeringer når de skal vises.
  const prognoseMedTillegg = useMemo(() => (tilleggLinjer.length && visTilleggIPrognose
    ? pensumPrognose.map((rad, i) => ({ ...rad, [TILLEGG_NAVN]: tilleggFrem[i]?.total || 0 }))
    : pensumPrognose), [pensumPrognose, tilleggFrem, tilleggLinjer, visTilleggIPrognose]);
  // Analysen av dagens portefølje, og sammenligningen mot Pensum-forslaget pluss det som beholdes.
  const dagensAnalyse = useMemo(() => analyserDagens(dagensPosisjoner, dagensPlattformAvk), [dagensPosisjoner, dagensPlattformAvk]);
  const dagensMotNy = useMemo(() => sammenlignDagensMotNy(dagensAnalyse, {
    pensumBelop: pbEffektivtInvestertBelop, pensumKlasser: pensumAktivafordeling, pensumAvkastning: pensumForventetAvkastning,
    pensumProdukter: pensumAllokering.filter((a) => a.vekt > 0).length, beholdt: dagensAnalyse?.beholdtePosisjoner || [],
  }), [dagensAnalyse, pbEffektivtInvestertBelop, pensumAktivafordeling, pensumForventetAvkastning, pensumAllokering]);
  // Forslaget «bruker» dagens portefølje når beløpet hos Pensum er det som flyttes, og det som
  // beholdes ligger under kundens øvrige investeringer.
  const dagensBruktIForslaget = Boolean(dagensAnalyse) && investertBelop === dagensAnalyse.flyttes
    && Math.round(tillegg.filter(erTilleggFraDagens).reduce((sum, x) => sum + (x.belop || 0), 0)) === Math.round(dagensAnalyse.beholdes)
    && (dagensAnalyse.beholdes === 0 || tilleggAktiv);
  const brukDagensIForslaget = () => {
    if (!dagensAnalyse) return;
    if (dagensAnalyse.flyttes > 0) setInvestertBelop(dagensAnalyse.flyttes);
    const beholdt = beholdteSomTillegg(dagensPosisjoner);
    setTillegg((prev) => [...prev.filter((x) => !erTilleggFraDagens(x)), ...beholdt].slice(0, TILLEGG_MAKS));
    if (beholdt.length) setTilleggAktiv(true);
  };
  const oppdaterTillegg = (id, endring) => setTillegg((prev) => prev.map((x) => (x.id === id ? { ...x, ...endring } : x)));
  const leggTilTillegg = (type = 'aksjer', navn = '') => setTillegg((prev) => (prev.length >= TILLEGG_MAKS ? prev : [...prev, { id: `t-${Date.now()}-${prev.length}`, navn, type, belop: 0, avkastning: null }]));
  // Lager linjer av formuespostene på kundekortet, så tallene ikke må skrives to ganger.
  const hentTilleggFraKundekort = () => {
    const poster = [
      ['Aksjer', 'aksjer', aksjerKunde], ['Aksjefond', 'aksjer', aksjefondKunde], ['Renter', 'renter', renterKunde], ['Kontanter', 'kontanter', kontanterKunde],
      ['PE-fond', 'pe', peFondKunde], ['Unoterte aksjer', 'pe', unoterteAksjerKunde], ['Shipping', 'annet', shippingKunde],
      ['Egen eiendom', 'eiendom', egenEiendomKunde], ['Eiendomssyndikat', 'eiendom', eiendomSyndikatKunde], ['Eiendomsfond', 'eiendom', eiendomFondKunde],
    ].filter(([, , belop]) => belop > 0);
    setTillegg((prev) => {
      const finnes = new Set(prev.map((x) => x.navn.toLowerCase()));
      const nye = poster.filter(([navn]) => !finnes.has(navn.toLowerCase())).map(([navn, type, belop], i) => ({ id: `t-kort-${Date.now()}-${i}`, navn, type, belop, avkastning: null }));
      return [...prev, ...nye].slice(0, TILLEGG_MAKS);
    });
  };
  const valgteProdukterForChart = pensumAllokering.filter(a => a.vekt > 0);



  const oppdaterSammenligningProfil = useCallback((nyProfil) => {
    setSammenligningProfil(nyProfil);
    setSammenligningAllokering(beregnAllokering(likvideTotal, peTotal, eiendomTotal, nyProfil, avkastningsrater));
  }, [likvideTotal, peTotal, eiendomTotal]);

  const updateSammenligningVekt = useCallback((index, newVekt) => {
    setSammenligningAllokering(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], vekt: newVekt };
      return updated;
    });
  }, []);

  const updateSammenligningAvkastning = useCallback((index, avk) => {
    setSammenligningAllokering(prev => { const u = [...prev]; u[index] = { ...u[index], avkastning: parseFloat(avk) || 0 }; return u; });
  }, []);

  const resetTilAutomatisk = useCallback((nyProfil) => {
    const profil = nyProfil || risikoprofil;
    if (nyProfil) setRisikoprofil(nyProfil);
    // Hvis alternative ikke skal vises, bruk 0 for PE og Eiendom
    const brukPE = effektivVisAlternative ? peTotal : 0;
    const brukEiendom = effektivVisAlternative ? eiendomTotal : 0;
    setAllokering(beregnAllokering(likvideTotal, brukPE, brukEiendom, profil, avkastningsrater));
    // Synkroniser til porteføljebygger
    if (nyProfil && pensumStandardPortefoljer[profil]) {
      setValgtPensumProfil(profil);
      setPensumAllokering(pensumStandardPortefoljer[profil]);
    }
  }, [likvideTotal, peTotal, eiendomTotal, risikoprofil, effektivVisAlternative, pensumStandardPortefoljer]);

  // Luna får et begrenset arbeidsbilde uten navn, e-post eller andre direkte
  // personopplysninger. Opplysninger rådgiveren selv skriver i chatten sendes
  // naturlig nok med den aktuelle forespørselen.
  const lunaContext = useMemo(() => {
    const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
    const stat3 = beregnPortefoljeStatistikk(pensumAllokering, produktHistorikk, periodeStartDato(3));
    const kostnad = beregnKostnader(pensumAllokering, alleProd, pbEffektivtInvestertBelop);
    const avrund = (v, d = 1) => (erGyldigTall(v) ? Number(v.toFixed(d)) : undefined);
    return {
      activeTab: activeTab === 'allokering' ? 'formuesplanlegger' : activeTab,
      customer: {
        hasInvestorName: Boolean(kundeNavn),
        hasCompanyName: Boolean(kundeSelskap),
        risikoprofil, horisont, investertBelop, investeringsFormaal, likviditetsbehov,
      },
      capital: {
        aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde,
        egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, likvideTotal, illikvideTotal, totalKapital,
      },
      portfolio: {
        products: pensumAllokering.filter((a) => a.vekt > 0).map((a) => ({ id: a.id, navn: a.navn, vekt: a.vekt })),
        totalWeight: avrund(pensumAllokering.reduce((sum, a) => sum + (a.vekt || 0), 0)),
        assetClasses: pensumAktivafordeling.filter((a) => a.value > 0).map((a) => ({ name: a.name, value: a.value })),
        expectedReturn: avrund(pensumForventetAvkastning),
        risk3y: avrund(stat3?.risiko),
        maxDrawdown3y: avrund(stat3?.maxDrawdown),
        endValue: pensumPrognose.length ? pensumPrognose[pensumPrognose.length - 1].verdi : undefined,
        costPct: kostnad.linjer.length ? avrund(kostnad.pst, 2) : undefined,
      },
      otherInvestments: tilleggAktiv ? rensTillegg(tillegg).filter((x) => x.belop > 0).map((x) => ({ navn: x.navn, type: x.type, belop: x.belop, avkastning: tilleggAvkastning(x) })) : [],
    };
  }, [activeTab, kundeNavn, kundeSelskap, risikoprofil, horisont, investertBelop, investeringsFormaal, likviditetsbehov, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, likvideTotal, illikvideTotal, totalKapital, pensumAllokering, pensumProdukter, produktHistorikk, pensumAktivafordeling, pensumForventetAvkastning, pensumPrognose, pbEffektivtInvestertBelop, tilleggAktiv, tillegg]);

  const utforLunaHandlinger = useCallback(async (actions) => {
    if (!Array.isArray(actions) || actions.length === 0) return;

    const penger = (value) => Math.min(1000000000000, Math.max(0, Math.round(Number(value) || 0)));
    const profiler = ['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'];
    const likviditetsnivaaer = ['Begrenset', 'Moderat', 'Høyt'];
    const faner = ['input', 'dagens', 'losninger', 'formuesplanlegger', 'scenario', 'belaning', 'rapport'];

    let nesteProfil = risikoprofil;
    let nesteKapital = {
      aksjerKunde,
      aksjefondKunde,
      renterKunde,
      kontanterKunde,
      peFondKunde,
      unoterteAksjerKunde,
      shippingKunde,
      egenEiendomKunde,
      eiendomSyndikatKunde,
      eiendomFondKunde,
    };
    // Regner ut porteføljen fra et forslag. Kaster feil uten å endre noe hvis forslaget ikke går opp.
    const byggPortefoljeFraForslag = (pensumPortefoljeForslag) => {
      const produktMap = new Map([
        ...(pensumProdukter.enkeltfond || []).map((produkt) => [produkt.id, { ...produkt, kategori: 'enkeltfond' }]),
        ...(pensumProdukter.fondsportefoljer || []).map((produkt) => [produkt.id, { ...produkt, kategori: 'fondsportefoljer' }]),
        ...(pensumProdukter.eksterneFond || []).map((produkt) => [produkt.id, { ...produkt, kategori: 'eksterneFond' }]),
        ...(pensumProdukter.alternative || []).map((produkt) => [produkt.id, { ...produkt, kategori: 'alternative' }]),
      ]);
      const standard = (pensumStandardPortefoljer[pensumPortefoljeForslag.profile] || []).map((item) => ({ ...item }));
      const standardMap = new Map(standard.map((item) => [item.id, item]));
      const laaste = new Map();

      pensumPortefoljeForslag.weights.forEach((item) => {
        if (!item || !produktMap.has(item.productId) || typeof item.weight !== 'number') return;
        const produkt = produktMap.get(item.productId);
        const standardVekt = Number(standardMap.get(item.productId)?.vekt) || 0;
        const oppgittVekt = Math.max(0, Math.min(100, Number(item.weight)));
        const vekt = item.constraint === 'minimum' ? Math.max(standardVekt, oppgittVekt) : oppgittVekt;
        laaste.set(item.productId, {
          id: item.productId,
          navn: produkt.navn,
          kategori: produkt.kategori,
          vekt,
        });
      });

      if (laaste.size === 0) throw new Error('Luna foreslo ingen gyldige Pensum-produkter.');
      const laastTotal = Array.from(laaste.values()).reduce((sum, item) => sum + item.vekt, 0);
      if (laastTotal > 100.001) throw new Error('De ønskede produktvektene overstiger 100%.');

      const ulaste = standard.filter((item) => !laaste.has(item.id));
      const ulasteStandardTotal = ulaste.reduce((sum, item) => sum + (Number(item.vekt) || 0), 0);
      const rest = Math.max(0, 100 - laastTotal);
      const nyPortefolje = [
        ...ulaste.map((item) => ({
          ...item,
          vekt: ulasteStandardTotal > 0 ? (Number(item.vekt) || 0) * rest / ulasteStandardTotal : 0,
        })),
        ...Array.from(laaste.values()),
      ].filter((item) => item.vekt > 0.0001);

      if (rest > 0 && ulasteStandardTotal <= 0) throw new Error('Porteføljen kan ikke balanseres til 100%.');
      nyPortefolje.forEach((item) => { item.vekt = parseFloat(item.vekt.toFixed(2)); });
      const avrundetTotal = nyPortefolje.reduce((sum, item) => sum + item.vekt, 0);
      const justeringsrad = nyPortefolje.find((item) => !laaste.has(item.id)) || nyPortefolje[0];
      if (justeringsrad && Math.abs(100 - avrundetTotal) >= 0.001) {
        justeringsrad.vekt = parseFloat((justeringsrad.vekt + (100 - avrundetTotal)).toFixed(2));
      }

      return nyPortefolje;
    };
    // Valider porteføljeforslaget før noe endres, slik at et ugyldig forslag ikke rører kundekortet.
    const portefoljeHandling = [...actions].reverse().find((action) => action?.type === 'set_pensum_portfolio' && profiler.includes(action?.payload?.profile) && Array.isArray(action?.payload?.weights));
    const planlagtPortefolje = portefoljeHandling ? byggPortefoljeFraForslag(portefoljeHandling.payload) : null;

    // Eksakt portefølje (f.eks. kundens beholdning): vekter fra beløp eller oppgitte vekter.
    const eksaktHandling = [...actions].reverse().find((action) => action?.type === 'set_exact_portfolio' && Array.isArray(action?.payload?.holdings));
    const eksaktPlan = (() => {
      if (!eksaktHandling) return null;
      const grupper = [['enkeltfond', pensumProdukter.enkeltfond], ['fondsportefoljer', pensumProdukter.fondsportefoljer], ['alternative', pensumProdukter.alternative], ['eksterneFond', pensumProdukter.eksterneFond]];
      const finn = (id) => { for (const [kategori, liste] of grupper) { const p = (liste || []).find((x) => x.id === id); if (p) return { p, kategori: p.gruppe === 'kontanter' ? 'kontanter' : kategori }; } return null; };
      const rader = eksaktHandling.payload.holdings.map((h) => ({ ...h, funn: finn(h?.productId) })).filter((h) => h.funn);
      const medBelop = rader.length > 0 && rader.every((h) => typeof h.amount === 'number' && h.amount > 0);
      const verdi = (h) => (medBelop ? h.amount : (typeof h.weight === 'number' && h.weight > 0 ? h.weight : 0));
      const sum = rader.reduce((acc, h) => acc + verdi(h), 0);
      if (!rader.length || !(sum > 0) || rader.some((h) => !(verdi(h) > 0))) throw new Error('Porteføljen kunne ikke legges inn: fant ingen gyldige produkter med beløp eller vekt.');
      const portefolje = rader.map((h) => ({ id: h.funn.p.id, navn: h.funn.p.navn, kategori: h.funn.kategori, vekt: parseFloat(((verdi(h) / sum) * 100).toFixed(2)) }));
      // Avrundingsrest legges på den største posten, slik at summen blir nøyaktig 100.
      const storst = portefolje.reduce((a, b) => (b.vekt > a.vekt ? b : a));
      storst.vekt = parseFloat((storst.vekt + 100 - portefolje.reduce((acc, x) => acc + x.vekt, 0)).toFixed(2));
      return { portefolje, belop: medBelop ? penger(sum) : null, harAlternative: portefolje.some((x) => x.kategori === 'alternative') };
    })();

    let beregnPaaNytt = false;
    let nesteFane = null;
    let aapneForslag = false;
    let lagre = false;
    let pensumPortefoljeForslag = null;

    actions.forEach((action) => {
      const payload = action?.payload || {};
      if (action?.type === 'set_customer_fields') {
        if (typeof payload.kundeNavn === 'string') setKundeNavn(payload.kundeNavn.slice(0, 120));
        if (typeof payload.kundeSelskap === 'string') setKundeSelskap(payload.kundeSelskap.slice(0, 160));
        if (typeof payload.radgiver === 'string') setRadgiver(payload.radgiver.slice(0, 120));
        if (typeof payload.investeringsFormaal === 'string') setInvesteringsFormaal(payload.investeringsFormaal.slice(0, 240));
        if (likviditetsnivaaer.includes(payload.likviditetsbehov)) setLikviditetsbehov(payload.likviditetsbehov);
        if (typeof payload.dato === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.dato)) setDato(payload.dato);
        if (payload.fjernInvestertBelop === true) setInvestertBelop(null);
        else if (typeof payload.investertBelop === 'number') setInvestertBelop(payload.investertBelop > 0 ? penger(payload.investertBelop) : null);
        if (typeof payload.horisont === 'number') {
          const nesteHorisont = Math.min(50, Math.max(1, Math.round(payload.horisont)));
          setHorisont(nesteHorisont);
          setLocalHorisont(String(nesteHorisont));
        }
        if (profiler.includes(payload.risikoprofil)) {
          nesteProfil = payload.risikoprofil;
          setRisikoprofil(nesteProfil);
          beregnPaaNytt = true;
        }
      }

      if (action?.type === 'set_capital_fields') {
        Object.keys(nesteKapital).forEach((key) => {
          if (typeof payload[key] === 'number') nesteKapital[key] = penger(payload[key]);
        });
      }

      if (action?.type === 'reset_capital_fields') {
        nesteKapital = Object.fromEntries(Object.keys(nesteKapital).map((key) => [key, 0]));
      }

      if (action?.type === 'recalculate_allocation') beregnPaaNytt = true;
      if (action?.type === 'set_pensum_portfolio' && profiler.includes(payload.profile) && Array.isArray(payload.weights)) {
        pensumPortefoljeForslag = payload;
        nesteProfil = payload.profile;
        setRisikoprofil(nesteProfil);
        beregnPaaNytt = true;
        nesteFane = 'losninger';
      }
      if (action?.type === 'navigate' && faner.includes(payload.tab)) nesteFane = payload.tab;
      if (action?.type === 'open_investment_proposal') aapneForslag = true;
      if (action?.type === 'save_customer') lagre = true;
    });

    setAksjerKunde(nesteKapital.aksjerKunde);
    setAksjefondKunde(nesteKapital.aksjefondKunde);
    setRenterKunde(nesteKapital.renterKunde);
    setKontanterKunde(nesteKapital.kontanterKunde);
    setPeFondKunde(nesteKapital.peFondKunde);
    setUnoterteAksjerKunde(nesteKapital.unoterteAksjerKunde);
    setShippingKunde(nesteKapital.shippingKunde);
    setEgenEiendomKunde(nesteKapital.egenEiendomKunde);
    setEiendomSyndikatKunde(nesteKapital.eiendomSyndikatKunde);
    setEiendomFondKunde(nesteKapital.eiendomFondKunde);

    if (beregnPaaNytt) {
      const nesteLikvid = nesteKapital.aksjerKunde + nesteKapital.aksjefondKunde + nesteKapital.renterKunde + nesteKapital.kontanterKunde;
      const nestePE = nesteKapital.peFondKunde + nesteKapital.unoterteAksjerKunde + nesteKapital.shippingKunde;
      const nesteEiendom = nesteKapital.egenEiendomKunde + nesteKapital.eiendomSyndikatKunde + nesteKapital.eiendomFondKunde;
      const inkluderAlternative = visAlternativeAllokering !== null ? visAlternativeAllokering : (nestePE + nesteEiendom > 0);
      setAllokering(beregnAllokering(nesteLikvid, inkluderAlternative ? nestePE : 0, inkluderAlternative ? nesteEiendom : 0, nesteProfil, avkastningsrater));
      if (pensumStandardPortefoljer[nesteProfil]) {
        setValgtPensumProfil(nesteProfil);
        setPensumAllokering(pensumStandardPortefoljer[nesteProfil]);
      }
    }

    // Kundens øvrige investeringer: slå på funksjonen og legg til eller erstatt linjene.
    const ovrigHandlinger = actions.filter((action) => action?.type === 'set_other_investments' && Array.isArray(action?.payload?.items));
    if (ovrigHandlinger.length) {
      setTilleggAktiv(true);
      setTillegg((prev) => {
        let liste = prev;
        ovrigHandlinger.forEach((action, n) => {
          const nye = rensTillegg(action.payload.items).filter((x) => x.belop > 0).map((x, i) => ({ ...x, id: `t-luna-${Date.now()}-${n}-${i}` }));
          liste = action.payload.mode === 'replace' ? nye : [...liste, ...nye];
        });
        return liste.slice(0, TILLEGG_MAKS);
      });
      if (!nesteFane) nesteFane = 'losninger';
    }

    if (eksaktPlan) {
      setValgtStandardLosning(null);
      setPensumAllokering(eksaktPlan.portefolje);
      if (eksaktPlan.belop) setInvestertBelop(eksaktPlan.belop);
      if (eksaktPlan.harAlternative) setVisAlternative(true);
      if (!nesteFane) nesteFane = 'losninger';
    }

    if (pensumPortefoljeForslag) {
      const nyPortefolje = planlagtPortefolje;
      setValgtPensumProfil(pensumPortefoljeForslag.profile);
      setValgtStandardLosning(null);
      setPensumAllokering(nyPortefolje);
    }

    if (nesteFane === 'dagens') {
      // Dagens portefølje er en seksjon på kundeinformasjonssiden, ikke en egen fane.
      setActiveTab('input');
      setVisDagens(true);
      setTimeout(() => document.getElementById('dagens-portefolje')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } else if (nesteFane) {
      setActiveTab(nesteFane);
      if (VERKTOY_FANER.some((v) => v.id === nesteFane)) setSisteVerktoy(nesteFane);
    }
    if (aapneForslag) {
      setActiveTab('rapport');
    }
    // Lagring kjøres alene, slik at vi aldri lagrer en eldre React-state rett
    // etter en serie med nye feltendringer.
    if (lagre && actions.length === 1) await lagreKunde();
  }, [risikoprofil, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, visAlternativeAllokering, avkastningsrater, pensumStandardPortefoljer, pensumProdukter, lagreKunde]);

  // Luna utfører endringer med en gang. Tilstanden rett før tas vare på, og funksjonen
  // som returneres setter verktøyet tilbake dit uten å bytte fane.
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const utforLunaMedAngre = useCallback(async ({ actions = [], fields = null } = {}) => {
    const forrige = { ...getKundeData(), id: aktivKundeId };
    if (actions.length) await utforLunaHandlinger(actions);
    // Rådgiveren blir stående der hen er; fanebytte skjer bare når Luna ber om det.
    if (fields && Object.keys(fields).length) brukLunaFelter(fields, { byttFane: false });
    return () => {
      const fane = activeTabRef.current;
      lastKundeData(forrige);
      setActiveTab(fane);
    };
  }, [getKundeData, aktivKundeId, utforLunaHandlinger, brukLunaFelter, lastKundeData]);

  // Når brukeren toggler "Alternative investeringer" vil vi bevare eventuelle
  // beløp/vekt som er fylt inn på aksjer- og renter-radene. Vi modifiserer derfor
  // bare alternativ-delen av allokeringen istedenfor å regenerere alt.
  useEffect(() => {
    const altKats = ['privateMarkets', 'eiendom', 'shipping'];
    if (effektivVisAlternative) {
      setAllokering(prev => {
        if (prev.some(a => altKats.includes(a.kategori))) return prev;
        const standard = beregnAllokering(likvideTotal, peTotal, eiendomTotal, risikoprofil, avkastningsrater);
        const alternativeRader = standard.filter(a => altKats.includes(a.kategori));
        return [...prev, ...alternativeRader];
      });
    } else {
      setAllokering(prev => prev.filter(a => !altKats.includes(a.kategori)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effektivVisAlternative]);

  const kategorierData = useMemo(() => {
    const effektivBelop = formuesPlanleggerBelop !== null ? formuesPlanleggerBelop : (investertBelop !== null ? investertBelop : totalKapital);
    const cats = ['aksjer', 'renter', 'privateMarkets', 'eiendom'];
    const names = { aksjer: 'Aksjer', renter: 'Renter', privateMarkets: 'Private Equity', eiendom: 'Eiendom' };
    const result = cats.map(cat => {
      const items = allokering.filter(a => a.kategori === cat);
      const totalVekt = items.reduce((s, a) => s + a.vekt, 0);
      const vektetAvk = totalVekt > 0 ? items.reduce((s, a) => s + a.vekt * a.avkastning, 0) / totalVekt : 0;
      return { kategori: cat, navn: names[cat], vekt: totalVekt, avkastning: vektetAvk, items, belop: (totalVekt / 100) * effektivBelop };
    }).filter(c => c.items.length > 0);
    // Add combined "Alternative" category for display
    const altItems = allokering.filter(a => a.kategori === 'privateMarkets' || a.kategori === 'eiendom' || a.kategori === 'shipping');
    if (altItems.length > 0) {
      const altVekt = altItems.reduce((s, a) => s + a.vekt, 0);
      const altAvk = altVekt > 0 ? altItems.reduce((s, a) => s + a.vekt * a.avkastning, 0) / altVekt : 0;
      result.push({ kategori: 'alternative', navn: 'Alternative investeringer', vekt: altVekt, avkastning: altAvk, items: altItems, belop: (altVekt / 100) * effektivBelop });
    }
    return result;
  }, [allokering, totalKapital, investertBelop, formuesPlanleggerBelop]);

  const pieData = useMemo(() => {
    const data = [];
    kategorierData.filter(cat => cat.kategori !== 'alternative').forEach(cat => {
      if (cat.vekt > 0) {
        if (cat.items.length > 1) {
          cat.items.filter(i => i.vekt > 0).forEach(item => data.push({ name: item.navn, value: item.vekt }));
        } else {
          data.push({ name: cat.navn, value: cat.vekt });
        }
      }
    });
    return data;
  }, [kategorierData]);

  const sammenligningPieData = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0).map(a => ({ name: a.navn, value: a.vekt })), [sammenligningAllokering]);
  const vektetAvkastning = useMemo(() => allokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [allokering]);
  const sammenligningAvkastning = useMemo(() => sammenligningAllokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [sammenligningAllokering]);
  const totalVekt = useMemo(() => allokering.reduce((s, a) => s + a.vekt, 0), [allokering]);
  const aktiveAktiva = useMemo(() => allokering.filter(a => a.vekt > 0), [allokering]);
  const sammenligningAktiva = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0), [sammenligningAllokering]);

  // Effektivt investert beløp (bruker manuelt beløp hvis satt, ellers totalKapital)
  // Effektivt investert beløp (Formuesplanlegger): prioriter eget budsjett her,
  // ellers fall tilbake til delt investertBelop, og til slutt totalKapital.
  const portefoljeBelop = formuesPlanleggerBelop !== null ? formuesPlanleggerBelop : (investertBelop !== null ? investertBelop : totalKapital);
  const totalLaan = laanAktiv ? prognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0), 0) : 0;
  const aarligRentekostnad = laanAktiv ? prognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0) * (Number(l.rente) || 0) / 100, 0) : 0;
  // Eksisterende-modus: porteføljen er allerede finansiert med lån, så netto EK = portefølje − lån.
  // Nytt-modus: brukeren tilfører ny gjeld, så netto EK = porteføljen som er fylt inn.
  const eksisterendeLaanModus = laanAktiv && laanModus === 'eksisterende';
  const egenkapitalBelop = eksisterendeLaanModus ? Math.max(0, portefoljeBelop - totalLaan) : portefoljeBelop;
  // Total eksponering / investert beløp. Når lånet er eksisterende, er eksponeringen lik porteføljen
  // som allerede er fylt inn; ellers legges nytt lån oppå egenkapitalen.
  const effektivtInvestertBelop = eksisterendeLaanModus ? portefoljeBelop : egenkapitalBelop + totalLaan;

  // Likvid vs Illikvid beregning (PE og Eiendom er illikvide)
  const likviditetData = useMemo(() => {
    const illikvideKategorier = ['privateMarkets', 'eiendom', 'shipping'];
    const illikvidVekt = allokering.filter(a => illikvideKategorier.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
    const likvidVekt = totalVekt - illikvidVekt;
    return [
      { name: 'Likvid', value: likvidVekt, belop: (likvidVekt / 100) * effektivtInvestertBelop },
      { name: 'Illikvid', value: illikvidVekt, belop: (illikvidVekt / 100) * effektivtInvestertBelop }
    ];
  }, [allokering, totalVekt, effektivtInvestertBelop]);

  // Aktiva-fordeling (aksjer, renter, PE, eiendom, shipping)
  const renterAksjerData = useMemo(() => {
    const aksjerVekt = allokering.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0);
    const renterVekt = allokering.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0);
    const peVekt = allokering.filter(a => a.kategori === 'privateMarkets').reduce((s, a) => s + a.vekt, 0);
    const eiendomVekt = allokering.filter(a => a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0);
    const shippingVekt = allokering.filter(a => a.kategori === 'shipping').reduce((s, a) => s + a.vekt, 0);
    return [
      { name: 'Aksjer', value: aksjerVekt, color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: renterVekt, color: PENSUM_COLORS.salmon },
      { name: 'Private Equity', value: peVekt, color: PENSUM_COLORS.teal },
      { name: 'Eiendom', value: eiendomVekt, color: PENSUM_COLORS.gold },
      { name: 'Shipping', value: shippingVekt, color: CATEGORY_COLORS.shipping }
    ].filter(d => d.value > 0);
  }, [allokering]);

  useEffect(() => {
    setScenarioParams(prev => ({
      pessimistisk: Math.min(prev.pessimistisk, vektetAvkastning - 1),
      optimistisk: Math.max(prev.optimistisk, vektetAvkastning + 2)
    }));
  }, [vektetAvkastning]);

  const verdiutvikling = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    // Hvis akkumulerRenter: rentekostnaden trekkes IKKE fra kontantstrøm — i stedet vokser lånet hvert år
    const effektivRentekostnad = akkumulerRenter ? 0 : aarligRentekostnad;
    // Gjennomsnittlig låne-rente brukes når renter akkumuleres
    const veietLaaneRente = totalLaan > 0
      ? prognoseFinansiering.reduce((s, l) => s + (Number(l.belop) || 0) * (Number(l.rente) || 0) / 100, 0) / totalLaan
      : 0;
    let aktueltLaan = totalLaan;
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i, kontantstrom: i === 0 ? 0 : nettoKontantstrom };
      if (i > 0 && akkumulerRenter) {
        aktueltLaan = aktueltLaan * (1 + veietLaaneRente);
      }
      row.laanBalanse = aktueltLaan;

      // Beregn gjeldende allokering med rebalansering(er)
      let gjeldendAllokering = aktiveAktiva.map(a => ({ ...a }));
      if (rebalanseringAktiv && i > 0) {
        rebalanseringer.forEach(reb => {
          const fraIdx = gjeldendAllokering.findIndex(a => a.navn === reb.fraAktiva);
          const tilIdx = gjeldendAllokering.findIndex(a => a.navn === reb.tilAktiva);
          if (fraIdx >= 0 && tilIdx >= 0) {
            const totalEndring = Math.min(reb.prosentPerAar * i, gjeldendAllokering[fraIdx].vekt);
            gjeldendAllokering[fraIdx] = { ...gjeldendAllokering[fraIdx], vekt: Math.max(0, gjeldendAllokering[fraIdx].vekt - totalEndring) };
            gjeldendAllokering[tilIdx] = { ...gjeldendAllokering[tilIdx], vekt: gjeldendAllokering[tilIdx].vekt + totalEndring };
          }
        });
      }

      gjeldendAllokering.forEach(asset => {
        if (i === 0) {
          row[asset.navn] = (asset.vekt / 100) * effektivtInvestertBelop;
        } else {
          const prevRow = data[i - 1];

          if (rebalanseringAktiv) {
            const prevValue = prevRow[asset.navn] || 0;
            let salgTotal = 0, kjopTotal = 0;
            rebalanseringer.forEach(reb => {
              const endringProsent = reb.prosentPerAar / 100;
              if (asset.navn === reb.fraAktiva && prevRow[reb.fraAktiva] > 0) {
                salgTotal += prevRow[reb.fraAktiva] * endringProsent;
              }
              if (asset.navn === reb.tilAktiva) {
                kjopTotal += (prevRow[reb.fraAktiva] || 0) * endringProsent;
              }
            });
            const originalAsset = aktiveAktiva.find(a => a.navn === asset.navn);
            const kontantTilAsset = (originalAsset.vekt / 100) * (nettoKontantstrom - effektivRentekostnad);
            const nyVerdi = (prevValue - salgTotal + kjopTotal + kontantTilAsset) * (1 + asset.avkastning / 100);
            row[asset.navn] = Math.max(0, nyVerdi);
          } else {
            const prev = prevRow[asset.navn] || 0;
            const kontantTilAsset = (asset.vekt / 100) * (nettoKontantstrom - effektivRentekostnad);
            // Uttak kan ikke gjøre verdien negativ – da er porteføljen tømt.
            row[asset.navn] = Math.max(0, (prev + kontantTilAsset) * (1 + asset.avkastning / 100));
          }
        }
      });
      row.total = aktiveAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      row.nettoEtterLaan = row.total - aktueltLaan;
      row.allokeringSnapshot = gjeldendAllokering.map(a => ({ navn: a.navn, vekt: row.total > 0 ? (row[a.navn] / row.total) * 100 : 0 }));

      data.push(row);
    }
    return data;
  }, [aktiveAktiva, effektivtInvestertBelop, nettoKontantstrom, horisont, rebalanseringAktiv, rebalanseringer, aarligRentekostnad, totalLaan, akkumulerRenter, prognoseFinansiering]);

  const sammenligningVerdiutvikling = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      sammenligningAktiva.forEach(asset => {
        if (i === 0) row[asset.navn] = (asset.vekt / 100) * effektivtInvestertBelop;
        else {
          const prev = data[i - 1][asset.navn] || 0;
          row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
        }
      });
      row.total = sammenligningAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      data.push(row);
    }
    return data;
  }, [sammenligningAktiva, effektivtInvestertBelop, nettoKontantstrom, horisont]);

  const scenarioData = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    // For "forventet" bruker vi verdiutviklingen direkte for konsistens
    // For optimistisk/pessimistisk bruker vi vektet avkastning +/- justering
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      // Forventet = samme som verdiutvikling (sum av individuelle aktivaklasser)
      row.forventet = verdiutvikling[i]?.total || effektivtInvestertBelop;
      row.forventetNetto = (verdiutvikling[i]?.nettoEtterLaan ?? verdiutvikling[i]?.total) || egenkapitalBelop;
      if (i === 0) {
        row.pessimistisk = effektivtInvestertBelop;
        row.optimistisk = effektivtInvestertBelop;
      } else {
        // Samme rentebehandling som forventet bane: når renter akkumuleres på lånet,
        // trekkes de ikke fra kontantstrømmen.
        const nettoKS = nettoKontantstrom - (akkumulerRenter ? 0 : aarligRentekostnad);
        row.pessimistisk = Math.max(0, (data[i-1].pessimistisk + nettoKS) * (1 + scenarioParams.pessimistisk / 100));
        row.optimistisk = Math.max(0, (data[i-1].optimistisk + nettoKS) * (1 + scenarioParams.optimistisk / 100));
      }
      // Sammenligning (alternativ profil)
      if (showComparison && sammenligningVerdiutvikling[i]) {
        row.sammenligning = sammenligningVerdiutvikling[i].total;
      }
      data.push(row);
    }
    return data;
  }, [effektivtInvestertBelop, egenkapitalBelop, nettoKontantstrom, verdiutvikling, scenarioParams, horisont, showComparison, sammenligningVerdiutvikling, aarligRentekostnad, totalLaan, akkumulerRenter]);

  const kombinertVerdiutvikling = useMemo(() => {
    if (!showComparison) return verdiutvikling;
    return verdiutvikling.map((row, idx) => ({ ...row, total_alt: sammenligningVerdiutvikling[idx]?.total || 0 }));
  }, [verdiutvikling, sammenligningVerdiutvikling, showComparison]);

  // Klamp slutt-år til [1, horisont] når horisont endres
  useEffect(() => {
    setSluttSammensetningAar(prev => Math.max(1, Math.min(horisont, prev)));
  }, [horisont]);

  // Sammensetning ved valgt slutt-år (etter avkastning + rebalansering + lån-effekt)
  const sluttSammensetning = useMemo(() => {
    const aar = Math.max(1, Math.min(horisont, sluttSammensetningAar));
    const row = verdiutvikling[aar];
    if (!row || !Array.isArray(row.allokeringSnapshot)) return null;
    const pie = row.allokeringSnapshot
      .filter(a => a.vekt > 0.05)
      .map(a => ({ name: a.navn, value: a.vekt }));
    const illikvKat = ['privateMarkets', 'eiendom', 'shipping'];
    let illikvidVekt = 0;
    row.allokeringSnapshot.forEach(a => {
      const meta = aktiveAktiva.find(b => b.navn === a.navn);
      if (meta && illikvKat.includes(meta.kategori)) illikvidVekt += a.vekt;
    });
    const likvidVekt = row.allokeringSnapshot.reduce((s, a) => s + a.vekt, 0) - illikvidVekt;
    return { aar: row.year, pie, likvid: likvidVekt, illikvid: illikvidVekt, total: row.total, laanBalanse: row.laanBalanse || 0 };
  }, [verdiutvikling, sluttSammensetningAar, horisont, aktiveAktiva]);


  // Lånefinansiering- og finansielt mål-seksjonene, gjenbrukt i både
  // Formuesplanleggeren og Porteføljebyggerens "Forutsetninger og mål"-paneler.
  // cfg gir uavhengig state/setters + utledede verdier per panel.
  // Disclaimer under historikk-tabeller og i snapshot-sider — viser hvilke
  // posisjoner som har proxiet/estimert historikk før oppstart, fra
  // Morningstar Direct-presentasjonen.
  const renderHistorikkDisclaimer = () => (
    <div className="rounded-lg p-4 border border-gray-200 bg-gray-50/60 text-xs leading-relaxed space-y-2">
      <p className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Viktig informasjon om avkastningsestimatet</p>
      <p className="text-gray-600">De ulike posisjonene har oppstart på ulike tidspunkt, og avkastningen før oppstart er estimert som følger:</p>
      <ul className="space-y-1 text-gray-600 ml-3">
        <li>· <strong>Pensum Basis</strong> — estimert med Pensum Global Dynamisk, forvaltet av samme forvalter (oppstart sept. 2023).</li>
        <li>· <strong>Pensum Global Core Active</strong> &amp; <strong>Pensum Global Edge</strong> — historikk er estimert med underliggende fonds utvikling før oppstart 01.01.2026. Grafen viser utviklingen man hadde hatt om man eide de samme fondene med samme vekting tilbake i tid.</li>
        <li>· <strong>Pensum Norge</strong> — estimert med 2/3 Pensum Norske Aksjer Utbytte og 1/3 Pensum Norske Aksjer Vekst (oppstart nov. 2023).</li>
        <li>· <strong>Pensum Global Energy</strong> — estimert med et lignende diskresjonært mandat, Pensum Energi, forvaltet av samme forvalter (oppstart des. 2022).</li>
        <li>· <strong>Pensum Nordic Banking Sector</strong> — estimert med et lignende diskresjonært mandat, Pensum Sparebank +, forvaltet av samme forvalter (oppstart 29. januar 2025).</li>
        <li>· <strong>Pensum Nordisk Høyrente</strong> — estimert med underliggende fonds utvikling før oppstart i feb. 2024.</li>
        <li>· <strong>Pensum Financial Opportunity</strong> — estimert med indeksen Bloomberg Global High Yield, valutasikret til NOK (oppstart april 2025).</li>
        <li>· <strong>Pensum Kairos</strong> — estimert med fondets indeks, MSCI ACWI NR, før oppstart av fondet 15. april 2026.</li>
      </ul>
      <p className="text-gray-500 italic">Avkastningstall for diskresjonært forvaltede porteføljer er netto et kostnadsestimat på 1,2 %; avkastningstall for fond er netto kostnader. Historisk avkastning er ingen garanti for fremtidig avkastning.</p>
    </div>
  );

  const renderLaanOgMaal = (cfg) => {
    const {
      laanAktiv, setLaanAktiv, prognoseFinansiering, setPrognoseFinansiering,
      laanModus, setLaanModus, akkumulerRenter, setAkkumulerRenter,
      malAktiv, setMalAktiv, hovedmal, setHovedmal,
      visDelmal, setVisDelmal, delmal, setDelmal,
      visSluttSammensetning, setVisSluttSammensetning,
      sluttSammensetningAar, setSluttSammensetningAar,
      totalLaan, aarligRentekostnad, eksisterendeLaanModus,
      egenkapitalBelop, effektivtInvestertBelop, portefoljeBelop,
      verdiutvikling, vektetAvkastning, nettoKontantstrom, horisont,
    } = cfg;
    return (
    <>
      {/* ── Lånefinansiering ── */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setLaanAktiv(!laanAktiv)}>
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Lånefinansiering</h4>
            {laanAktiv && prognoseFinansiering.length > 0 && (
              <span className="text-xs text-gray-500">{formatCurrency(totalLaan)} lån · LTV {formatPercent(effektivtInvestertBelop > 0 ? (totalLaan / effektivtInvestertBelop) * 100 : 0)}</span>
            )}
            {!laanAktiv && <span className="text-xs text-gray-400">(klikk for å aktivere)</span>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-gray-500">{laanAktiv ? 'Aktiv' : 'Inaktiv'}</span>
            <div className="relative">
              <input type="checkbox" checked={laanAktiv} onChange={(e) => setLaanAktiv(e.target.checked)} className="sr-only" />
              <div className={"w-11 h-6 rounded-full transition-colors " + (laanAktiv ? "bg-green-500" : "bg-gray-300")}></div>
              <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (laanAktiv ? "translate-x-5" : "")}></div>
            </div>
          </label>
        </div>
        {laanAktiv && (
          <div className="mt-4 space-y-4">
            {/* Modus-velger: nytt lån vs. eksisterende lån */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: 'nytt', tittel: 'Nytt lån oppå porteføljen', beskrivelse: 'Lånet tilføres som ny gjeld og øker total eksponering.' },
                { id: 'eksisterende', tittel: 'Eksisterende lån finansierer porteføljen', beskrivelse: 'Porteføljen inneholder allerede lånebeløpet — netto EK = portefølje − lån.' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLaanModus(m.id)}
                  className={"text-left rounded-lg px-3 py-2 border transition-colors " + (laanModus === m.id ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="text-sm font-semibold" style={{ color: laanModus === m.id ? PENSUM_COLORS.darkBlue : '#374151' }}>{m.tittel}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.beskrivelse}</div>
                </button>
              ))}
            </div>

            {/* Advarsel hvis eksisterende lån > portefølje */}
            {eksisterendeLaanModus && totalLaan > portefoljeBelop && portefoljeBelop > 0 && (
              <div className="rounded-lg px-3 py-2 bg-red-50 border border-red-200 text-xs text-red-700">
                Lånet ({formatCurrency(totalLaan)}) er større enn porteføljen ({formatCurrency(portefoljeBelop)}). Netto egenkapital blir negativ — sjekk om porteføljeverdien er korrekt.
              </div>
            )}

            {prognoseFinansiering.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">{eksisterendeLaanModus ? 'Netto egenkapital' : 'Egenkapital'}</div>
                  <div className="text-lg font-bold text-blue-900">{formatCurrency(egenkapitalBelop)}</div>
                  {eksisterendeLaanModus && (
                    <div className="text-xs text-gray-400 mt-0.5">Portefølje − lån</div>
                  )}
                </div>
                <div className="bg-amber-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-amber-600 font-medium mb-1">Total lån</div>
                  <div className="text-lg font-bold text-amber-900">{formatCurrency(totalLaan)}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-emerald-600 font-medium mb-1">{eksisterendeLaanModus ? 'Portefølje (eksponering)' : 'Investert totalt'}</div>
                  <div className="text-lg font-bold text-emerald-900">{formatCurrency(effektivtInvestertBelop)}</div>
                </div>
                <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#FDF6F2' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: PENSUM_COLORS.salmon }}>LTV (belåningsgrad)</div>
                  <div className="text-lg font-bold" style={{ color: '#8B6650' }}>{effektivtInvestertBelop > 0 ? formatPercent((totalLaan / effektivtInvestertBelop) * 100) : '0 %'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Lån / {eksisterendeLaanModus ? 'portefølje' : 'total eksponering'}</div>
                </div>
                <div className="bg-red-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-red-600 font-medium mb-1">Årlig rentekostnad</div>
                  <div className="text-lg font-bold text-red-900">{formatCurrency(aarligRentekostnad)}</div>
                </div>
              </div>
            )}
            {prognoseFinansiering.map((laan, idx) => (
              <div key={laan.id || idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                  <select
                    value={laan.type}
                    onChange={(e) => setPrognoseFinansiering(prev => prev.map((l, i) => i === idx ? { ...l, type: e.target.value } : l))}
                    className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm bg-white"
                  >
                    <option value="Banklån">Banklån</option>
                    <option value="Verdipapirfinansiering">Verdipapirfinansiering</option>
                    <option value="Andre lån">Andre lån</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Beløp (NOK)</label>
                  <input
                    type="text"
                    value={formatNumber(laan.belop || 0)}
                    onChange={(e) => {
                      const v = parseBelop(e.target.value) || 0;
                      setPrognoseFinansiering(prev => prev.map((l, i) => i === idx ? { ...l, belop: v } : l));
                    }}
                    className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Rente (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={laan.rente ?? 5}
                    onChange={(e) => setPrognoseFinansiering(prev => prev.map((l, i) => i === idx ? { ...l, rente: parseFloat(e.target.value) || 0 } : l))}
                    className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Årlig kostnad</label>
                  <div className="py-2 px-3 text-sm font-semibold text-red-700 bg-red-50 rounded-lg border border-red-200 text-right">
                    {formatCurrency((Number(laan.belop) || 0) * (Number(laan.rente) || 0) / 100)}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setPrognoseFinansiering(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 p-2 transition-colors"
                    title="Fjern lån"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Banklån', 'Verdipapirfinansiering', 'Andre lån'].map(type => (
                <button
                  key={type}
                  onClick={() => setPrognoseFinansiering(prev => [...prev, { id: Date.now() + '-' + Math.random().toString(36).slice(2,8), type, belop: 0, rente: type === 'Verdipapirfinansiering' ? 5.5 : type === 'Banklån' ? 4.5 : 6, }])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-dashed transition-colors hover:bg-gray-50"
                  style={{ borderColor: PENSUM_COLORS.salmon, color: PENSUM_COLORS.salmon }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {type}
                </button>
              ))}
            </div>
            {prognoseFinansiering.length > 0 && (
              <>
                <div className="flex items-center gap-3 mt-3 p-3 rounded-lg" style={{ backgroundColor: '#FDF6F2', border: '1px solid #F0DCD0' }}>
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input type="checkbox" checked={akkumulerRenter} onChange={(e) => setAkkumulerRenter(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Akkumuler lånerenter (compound)</span>
                  </label>
                  <span className="text-xs text-gray-500">{akkumulerRenter ? 'Rentene legges til lånet hvert år — kontantstrøm uberørt' : 'Rentene trekkes fra årlig kontantstrøm'}</span>
                </div>
                <p className="text-xs text-gray-500 italic mt-2">
                  {eksisterendeLaanModus
                    ? `Lånet er allerede en del av porteføljen — netto egenkapital er ${formatCurrency(egenkapitalBelop)}. Belåningsgrad (LTV): ${pst(effektivtInvestertBelop > 0 ? ((totalLaan / effektivtInvestertBelop) * 100).toFixed(0) : 0)} % av porteføljen.`
                    : `Lånebeløpet legges til investert kapital. Belåningsgrad (LTV): ${pst(effektivtInvestertBelop > 0 ? ((totalLaan / effektivtInvestertBelop) * 100).toFixed(0) : 0)} % av total eksponering.`}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Finansielt mål og beløp ── */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setMalAktiv(!malAktiv)}>
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Finansielt mål og beløp</h4>
            {!malAktiv && <span className="text-xs text-gray-400">(klikk for å aktivere)</span>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-gray-500">{malAktiv ? 'Aktiv' : 'Inaktiv'}</span>
            <div className="relative">
              <input type="checkbox" checked={malAktiv} onChange={(e) => setMalAktiv(e.target.checked)} className="sr-only" />
              <div className={"w-11 h-6 rounded-full transition-colors " + (malAktiv ? "bg-green-500" : "bg-gray-300")}></div>
              <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (malAktiv ? "translate-x-5" : "")}></div>
            </div>
          </label>
        </div>
        {malAktiv && (() => {
          const naarAarRow = hovedmal.belop > 0 ? verdiutvikling.find(r => r.total >= hovedmal.belop) : null;
          const sluttverdi = verdiutvikling[verdiutvikling.length - 1]?.total || 0;
          const fremgang = hovedmal.belop > 0 ? Math.min(100, (sluttverdi / hovedmal.belop) * 100) : 0;
          const aarTilMaal = hovedmal.malAar > 0 ? hovedmal.malAar - new Date().getFullYear() : 0;
          const beregnNoedvendigAvkastning = (FV, PV, PMT, n) => {
            if (n <= 0 || FV <= 0 || PV < 0) return null;
            if (PV === 0 && PMT === 0) return null;
            let low = -0.5, high = 1.5;
            for (let iter = 0; iter < 80; iter++) {
              const mid = (low + high) / 2;
              const fv = mid === 0
                ? PV + PMT * n
                : PV * Math.pow(1 + mid, n) + PMT * (Math.pow(1 + mid, n) - 1) / mid;
              if (fv < FV) low = mid; else high = mid;
              if (Math.abs(high - low) < 1e-7) break;
            }
            return (low + high) / 2 * 100;
          };
          const nettoKontantPMT = nettoKontantstrom - (akkumulerRenter ? 0 : aarligRentekostnad);
          const noedvendigAvk = hovedmal.belop > 0 && aarTilMaal > 0
            ? beregnNoedvendigAvkastning(hovedmal.belop, effektivtInvestertBelop, nettoKontantPMT, aarTilMaal)
            : null;
          const avkastningsDiff = noedvendigAvk != null ? noedvendigAvk - vektetAvkastning : null;
          return (
            <div className="mt-4 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hovedmal.visIGraf} onChange={(e) => setHovedmal(prev => ({ ...prev, visIGraf: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-xs text-gray-600">Vis hovedmål i graf</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={visDelmal} onChange={(e) => setVisDelmal(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-xs text-gray-600">Bruk delmål</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={visSluttSammensetning} onChange={(e) => setVisSluttSammensetning(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-xs text-gray-600">Vis sammensetning ved slutt av horisonten</span>
                  </label>
                  {visSluttSammensetning && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-gray-600">År</span>
                      <input
                        type="range"
                        min={1}
                        max={horisont}
                        step={1}
                        value={sluttSammensetningAar}
                        onChange={(e) => setSluttSammensetningAar(parseInt(e.target.value) || 1)}
                        className="w-32 accent-blue-700"
                      />
                      <span className="text-xs font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>
                        {sluttSammensetningAar} år ({new Date().getFullYear() + sluttSammensetningAar})
                      </span>
                    </div>
                  )}
                </div>
                {hovedmal.belop > 0 && (naarAarRow
                  ? <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Nås i {naarAarRow.year} ({naarAarRow.year - new Date().getFullYear()} år)</span>
                  : <span className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Nås ikke innen {horisont} år</span>)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Hva er målet?</label>
                  <input type="text" placeholder="F.eks. Finansiell frihet" value={hovedmal.navn} onChange={e => setHovedmal(prev => ({ ...prev, navn: e.target.value }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Målbeløp (kr)</label>
                  <input type="text" placeholder="100 000 000" value={hovedmal.belop ? formatNumber(hovedmal.belop) : ''} onChange={e => { const v = parseBelop(e.target.value) || 0; setHovedmal(prev => ({ ...prev, belop: v })); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Nå målet innen (år)</label>
                  <input type="number" min={new Date().getFullYear() + 1} placeholder={new Date().getFullYear() + 10} value={hovedmal.malAar || ''} onChange={e => setHovedmal(prev => ({ ...prev, malAar: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                </div>
              </div>

              {hovedmal.belop > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F8' }}>
                    <div className="text-xs font-medium mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Med dagens portefølje</div>
                    <div className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>
                      {naarAarRow ? `Nås i ${naarAarRow.year}` : `Nås ikke innen ${horisont} år`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatPercent(vektetAvkastning)} avkastning gir {formatCurrency(sluttverdi)} etter {horisont} år</div>
                  </div>
                  {aarTilMaal > 0 && noedvendigAvk != null && (
                    <div className={`rounded-lg p-4 ${avkastningsDiff > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                      <div className={`text-xs font-medium mb-1 ${avkastningsDiff > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>For å nå målet i {hovedmal.malAar}</div>
                      <div className={`text-lg font-bold ${avkastningsDiff > 0 ? 'text-amber-900' : 'text-emerald-900'}`}>
                        {noedvendigAvk > 50 || noedvendigAvk < -20 ? 'Urealistisk' : `${formatPercent(noedvendigAvk)} avkastning`}
                      </div>
                      {noedvendigAvk <= 50 && noedvendigAvk >= -20 && (
                        <div className={`text-xs mt-0.5 ${avkastningsDiff > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {avkastningsDiff > 0
                            ? `Krever ${formatPercent(avkastningsDiff)} høyere enn dagens ${formatPercent(vektetAvkastning)}`
                            : `Klarer det allerede — ${formatPercent(Math.abs(avkastningsDiff))} ekstra margin`}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Fremgang ({horisont} år)</div>
                    <div className="w-full bg-white rounded-full h-3 overflow-hidden mt-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${fremgang}%`, backgroundColor: fremgang >= 100 ? '#059669' : PENSUM_COLORS.darkBlue }} />
                    </div>
                    <div className="text-xs mt-2 text-gray-500">
                      {formatPercent(fremgang)} av målet
                      {!naarAarRow && hovedmal.belop > sluttverdi && ` — mangler ${formatCurrency(hovedmal.belop - sluttverdi)}`}
                    </div>
                  </div>
                </div>
              )}

              {visDelmal && (
                <div className="pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Delmål & milepæler</h4>
                      <p className="text-xs text-gray-500">Vises som grønne referanselinjer i grafen.</p>
                    </div>
                    <button onClick={() => setDelmal(prev => [...prev, { navn: '', belop: 0 }])} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">+ Legg til delmål</button>
                  </div>
                  {delmal.length === 0 && <p className="text-xs text-gray-400 italic">Ingen delmål lagt til ennå.</p>}
                  {delmal.map((m, i) => {
                    const naarAar = verdiutvikling.find(r => r.total >= m.belop);
                    return (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        <input type="text" placeholder="Navn på delmål" value={m.navn} onChange={e => setDelmal(prev => prev.map((d, j) => j === i ? { ...d, navn: e.target.value } : d))} className="border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1" />
                        <input type="text" placeholder="Beløp" value={m.belop ? formatNumber(m.belop) : ''} onChange={e => { const v = parseBelop(e.target.value) || 0; setDelmal(prev => prev.map((d, j) => j === i ? { ...d, belop: v } : d)); }} className="border border-gray-200 rounded-lg py-2 px-3 text-sm w-40 text-right" />
                        <span className="text-sm text-gray-400">kr</span>
                        {naarAar && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Nås {naarAar.year}</span>}
                        {!naarAar && m.belop > 0 && <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">Nås ikke i perioden</span>}
                        <button onClick={() => setDelmal(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-lg">×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </>
    );
  };

  const updateAllokeringVekt = useCallback((index, newVekt) => {
    setAllokering(prev => {
      const clamped = Math.max(0, Math.min(100, Number(newVekt) || 0));
      const items = !autoRebalanserAllokering
        ? prev.map((it, i) => i === index ? { ...it, vekt: clamped } : it)
        : fordelRestVektListe(prev, index, clamped);
      // Synk lagret belop mot ny vekt så beløpsfeltet er konsistent.
      return items.map(it => ({
        ...it,
        belop: effektivtInvestertBelop > 0 ? Math.round((it.vekt / 100) * effektivtInvestertBelop) : 0,
      }));
    });
  }, [autoRebalanserAllokering, effektivtInvestertBelop]);

  const updateAllokeringBelop = useCallback((index, newBelop) => {
    const cleanBelop = Math.max(0, Math.round(Number(newBelop) || 0));
    const currentTotal = effektivtInvestertBelop;
    // Hent gjeldende beløp per rad: typed verdi der den finnes, ellers vekt × forrige total.
    const nyeBelop = allokering.map((it, i) => {
      if (i === index) return cleanBelop;
      if (typeof it.belop === 'number') return it.belop;
      return currentTotal > 0 ? Math.round(((it.vekt || 0) / 100) * currentTotal) : 0;
    });
    const nyTotal = nyeBelop.reduce((s, b) => s + b, 0);

    setAllokering(prev => prev.map((it, i) => ({
      ...it,
      belop: nyeBelop[i],
      vekt: nyTotal > 0 ? parseFloat(((nyeBelop[i] / nyTotal) * 100).toFixed(2)) : 0,
    })));

    // Hold Formuesplanleggerens eget budsjett synkronisert med summen så
    // simulering, grafer og snittavkastning reflekterer faktisk innskrevne
    // beløp. Endrer IKKE investertBelop, slik at Porteføljebygging og
    // Investeringsforslag beholder sitt eget beløp.
    if (nyTotal > 0) setFormuesPlanleggerBelop(nyTotal);
  }, [allokering, effektivtInvestertBelop]);

  const updateAllokeringAvkastning = useCallback((index, avk) => {
    setAllokering(prev => { const u = [...prev]; u[index] = { ...u[index], avkastning: parseFloat(avk) || 0, manueltJustert: true }; return u; });
  }, []);

  // Synkroniser avkastning på allokerings-radene når CMA-rater endres (f.eks. admin
  // oppdaterer et produkt i CMA-arket). Rader med manueltJustert beholder verdien sin.
  const ALLOKERING_NAVN_TIL_RATER = useMemo(() => ({
    'Globale Aksjer': 'globaleAksjer', 'Norske Aksjer': 'norskeAksjer',
    'Høyrente': 'hoyrente', 'Investment Grade': 'investmentGrade',
    'Private Equity': 'privateEquity', 'Eiendom': 'eiendom'
  }), []);
  useEffect(() => {
    setAllokering(prev => {
      let endret = false;
      const neste = prev.map(rad => {
        if (rad.manueltJustert) return rad;
        const key = ALLOKERING_NAVN_TIL_RATER[rad.navn];
        if (!key) return rad;
        const ny = avkastningsrater[key];
        if (!erGyldigTall(ny) || ny === rad.avkastning) return rad;
        endret = true;
        return { ...rad, avkastning: ny };
      });
      return endret ? neste : prev;
    });
    setSammenligningAllokering(prev => {
      let endret = false;
      const neste = prev.map(rad => {
        if (rad.manueltJustert) return rad;
        const key = ALLOKERING_NAVN_TIL_RATER[rad.navn];
        if (!key) return rad;
        const ny = avkastningsrater[key];
        if (!erGyldigTall(ny) || ny === rad.avkastning) return rad;
        endret = true;
        return { ...rad, avkastning: ny };
      });
      return endret ? neste : prev;
    });
  }, [avkastningsrater, ALLOKERING_NAVN_TIL_RATER]);

  const normaliserAllokeringTil100 = useCallback(() => {
    setAllokering((prev) => skalerVekterTilHundreListe(prev));
  }, []);

  const toggleCategory = (cat) => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }));
  const toggleKundeKategori = (cat) => setExpandedKundeKategorier(p => ({ ...p, [cat]: !p[cat] }));

  // Investeringsforslaget som ekte, redigerbare PowerPoint-lysbilder (lib/forslagPptx.js).
  // Forhåndsvisningen i fanen og den nedlastede filen bygges fra samme modell og samme tegnekode.
  const FORSLAG_ASSETS = { forside: '/forslag/forside.jpg', logoLys: '/forslag/logo-lys-bakgrunn.png', logoMork: '/forslag/logo-mork-bakgrunn.png', kontakt: '/forslag/kontakt.jpg' };
  const byggForslag = () => byggForslagModell({
    kundeNavn, kundeSelskap,
    radgiver: { navn: bruker?.navn || radgiver, tittel: bruker?.tittel, telefon: bruker?.telefon, epost: bruker?.epost },
    radgiver2: visRadgiver2 ? radgiver2 : null,
    dato: new Date(),
    belop: investertBelop !== null ? investertBelop : totalKapital,
    horisont, risikoprofil, formaal: investeringsFormaal, likviditetsbehov, nettoKontantstrom,
    allokering: pensumAllokering,
    produkter: [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative],
    produktRapportMeta, produktEksponering, produktHistorikk,
    indeksHistorikk: DATAFEED_INDEKS_HISTORIKK, referanseEksponering,
    historiskAarsavkastning: beregnPensumHistorikk,
    forventetAvkastning: pensumForventetAvkastning,
    ovrigeInvesteringer: tilleggLinjer,
    dagens: dagensAnalyse ? { posisjoner: dagensPosisjoner, plattformAvkastning: dagensPlattformAvk } : null,
    selskap: PENSUM_SELSKAPSNOEKKELTALL
  });
  // Ting rådgiveren bør se før forslaget sendes ut. Stopper ikke eksporten, men vises
  // ved forhåndsvisningen og må bekreftes ved nedlasting.
  const forslagVarsler = useMemo(() => {
    const varsler = [];
    const sum = pensumAllokering.reduce((s, a) => s + (a.vekt > 0 ? a.vekt : 0), 0);
    if (sum > 0 && Math.abs(sum - 100) > 0.05) varsler.push(`Porteføljen summerer til ${sum.toFixed(1).replace('.', ',')}\u00a0%, ikke 100. Presentasjonen skalerer vektene til 100\u00a0%.`);
    if (!kundeNavn && !kundeSelskap) varsler.push('Kundenavn mangler. Forsiden viser «Kunde».');
    if (!(bruker?.navn || radgiver)) varsler.push('Rådgiver mangler. Presentasjonen viser ingen kontaktperson.');
    if (!((investertBelop !== null ? investertBelop : totalKapital) > 0)) varsler.push('Beløp mangler. Det vises som «Avklares», og fremskrivningene regnes per 1 mill. kr.');
    return varsler;
  }, [pensumAllokering, kundeNavn, kundeSelskap, bruker, radgiver, investertBelop, totalKapital]);
  const forslagTekster = forslagVurdering.trim() ? { vurdering: forslagVurdering.trim() } : {};

  const forslagForhandsvisning = useMemo(() => {
    if (activeTab !== 'rapport') return null;
    try {
      const modell = byggForslag();
      if (!modell.produkter.length) return { slides: [], tom: true };
      return { slides: lagForslagPptx(ForslagOpptak, modell, { sider: forslagSider, assets: FORSLAG_ASSETS, tekster: forslagTekster }).slides };
    } catch (e) {
      return { slides: [], feil: e?.message || String(e) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dagensPosisjoner, dagensPlattformAvk, tilleggLinjer, activeTab, forslagSider, forslagVurdering, radgiver2, visRadgiver2, kundeNavn, kundeSelskap, bruker, radgiver, investertBelop, totalKapital, horisont, risikoprofil, investeringsFormaal, likviditetsbehov, nettoKontantstrom, pensumAllokering, pensumProdukter, produktRapportMeta, produktEksponering, produktHistorikk, beregnPensumHistorikk, pensumForventetAvkastning]);
  const handleLastNedForslag = async () => {
    if (forslagVarsler.length && !confirm(`Før du laster ned:\n\n• ${forslagVarsler.join('\n• ')}\n\nLast ned likevel?`)) return;
    setForslagLaster(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const modell = byggForslag();
      if (!modell.produkter.length) throw new Error('Porteføljen er tom. Velg produkter i porteføljebyggeren først.');
      const pptx = lagForslagPptx(PptxGenJS, modell, {
        sider: forslagSider,
        assets: FORSLAG_ASSETS, tekster: forslagTekster
      });
      const filnavn = `Investeringsforslag ${(modell.kunde || 'kunde').replace(/[\\/:*?"<>|]/g, '')} ${new Date().toISOString().slice(0, 10)}.pptx`;
      await pptx.writeFile({ fileName: filnavn });
    } catch (e) {
      alert('Kunne ikke lage presentasjonen: ' + (e?.message || e));
    } finally {
      setForslagLaster(false);
    }
  };

  // Kostnadsanalyse - beregn "break-even" avkastning og formuesutvikling uten investering
  const kostnadsanalyseData = useMemo(() => {
    if (!kostnadsanalyseAktiv) return null;
    const startYear = new Date().getFullYear();
    const kapital = effektivtInvestertBelop;

    // Formuesskatt-beregning (2025-satser)
    const beregnFormuesskatt = (formue) => {
      // Fribeløp 1,7 mill (enslig), vi bruker skattepliktigFormue direkte
      const grense = 20000000;
      const satsUnder = 0.01; // 1,0% under 20M
      const satsOver = 0.011; // 1,1% over 20M
      if (formue <= 0) return 0;
      if (formue <= grense) return formue * satsUnder;
      return grense * satsUnder + (formue - grense) * satsOver;
    };

    const skattSats22 = 0.22;    // kapitalinntektsskatt
    const skattSatsAksje = 0.378; // aksjegevinstskatt (inkl. oppjusteringsfaktor 2025: 1.72 * 0.22)

    // Årlig formuesskatt basert på oppgitt skattepliktig formue
    const aarligFormuesskatt = beregnFormuesskatt(skattepliktigFormue);

    // Scenario 1: "Kontoinnskudd" - kun renteavkastning, ingen aksjeinvestering
    // Netto rente etter skatt
    const nettoRente = renteAvkastning * (1 - skattSats22);

    // Break-even: hvilken brutto aksje-avkastning trengs for å opprettholde realformue?
    // Realformue opprettholdes når: avkastning dekker forbruk + formuesskatt + inflasjon
    const aarligKostnad = aarligForbruk + aarligFormuesskatt;
    const inflasjonsFaktor = inflasjon / 100;

    // Brutto aksje-avkastning som trengs (etter skatt) for å dekke kostnader + inflasjon
    const nettoAvkastningPaakrevet = kapital > 0 ? (aarligKostnad / kapital) + inflasjonsFaktor : 0;
    const bruttoAksjePaakrevet = kapital > 0 ? nettoAvkastningPaakrevet / (1 - skattSatsAksje) : 0;

    // Bygg serie: formuesutvikling UTEN investering (kun bankkonto med rente)
    const bankSerie = [];
    let bankFormue = kapital;
    for (let i = 0; i <= horisont; i++) {
      bankSerie.push({ year: startYear + i, bankFormue: Math.max(0, bankFormue) });
      if (i < horisont) {
        // Renteinntekt etter skatt
        const renteinntekt = bankFormue * (nettoRente / 100);
        // Trekk fra forbruk og formuesskatt, legg til rente
        bankFormue = bankFormue + renteinntekt - aarligForbruk - beregnFormuesskatt(skattepliktigFormue);
        // Juster for inflasjon (realverdi)
        bankFormue = bankFormue / (1 + inflasjonsFaktor);
      }
    }

    return {
      aarligFormuesskatt,
      nettoRente,
      bruttoAksjePaakrevet,
      nettoAvkastningPaakrevet,
      bankSerie,
      aarligKostnad,
    };
  }, [kostnadsanalyseAktiv, effektivtInvestertBelop, skattepliktigFormue, aarligForbruk, inflasjon, renteAvkastning, horisont]);


  return (
    <div className="min-h-screen print:min-h-0 print:bg-white" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, footer, .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>
      
      {/* Login Modal */}
      {visLoginModal && (
        <LoginModal
          authFeilmelding={authFeilmelding}
          onLogin={loggInnBruker}
          onClose={() => { setVisLoginModal(false); setVentPaaRegistrering(false); setAuthFeilmelding(''); }}
          onSwitchToRegister={() => { setVisLoginModal(false); setVisRegistrerModal(true); setAuthFeilmelding(''); }}
        />
      )}

      {/* Registrer Modal */}
      {visRegistrerModal && (
        <RegisterModal
          authFeilmelding={authFeilmelding}
          onRegister={registrerBruker}
          onClose={() => { setVisRegistrerModal(false); setAuthFeilmelding(''); }}
          onSwitchToLogin={() => { setVisRegistrerModal(false); setVisLoginModal(true); setAuthFeilmelding(''); }}
        />
      )}
      
      {/* Produktdetalj Modal */}
      {valgtProduktDetalj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <h3 className="text-lg font-semibold text-white">{valgtProduktDetalj.navn}</h3>
              <button onClick={() => setValgtProduktDetalj(null)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(() => {
                const eksponering = produktEksponering[valgtProduktDetalj.id];
                if (!eksponering) {
                  return <p className="text-gray-500 italic">Ingen eksponeringsdata tilgjengelig for dette produktet.</p>;
                }
                return (
                  <div className="space-y-6">
                    {/* Disclaimer */}
                    {eksponering.disclaimer && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-sm text-amber-800">{eksponering.disclaimer}</p>
                        </div>
                      </div>
                    )}
                    
                    {produktRapportMeta?.[valgtProduktDetalj.id] && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Rapportgrunnlag</p>
                            <h4 className="text-lg font-semibold mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{produktRapportMeta[valgtProduktDetalj.id].slideTitle || valgtProduktDetalj.navn}</h4>
                            <p className="text-sm text-slate-600 mt-1">{produktRapportMeta[valgtProduktDetalj.id].slideSubtitle || ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Forventet avkastning</p>
                            <p className="text-lg font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{erGyldigTall(produktRapportMeta[valgtProduktDetalj.id].expectedReturn) ? `${pst(produktRapportMeta[valgtProduktDetalj.id].expectedReturn)} %` : '—'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                          <div><span className="text-slate-500">Rolle:</span> <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{produktRapportMeta[valgtProduktDetalj.id].role || '—'}</span></div>
                          <div><span className="text-slate-500">Benchmark:</span> <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{produktRapportMeta[valgtProduktDetalj.id].benchmark || '—'}</span></div>
                          <div><span className="text-slate-500">Pitch:</span> <span>{produktRapportMeta[valgtProduktDetalj.id].pitch || '—'}</span></div>
                          <div><span className="text-slate-500">Nøkkelrisiko:</span> <span>{produktRapportMeta[valgtProduktDetalj.id].riskText || '—'}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Underliggende investeringer */}
                    {eksponering.underliggende && eksponering.underliggende.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Underliggende investeringer</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {eksponering.underliggende.map((inv, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <span className="text-sm truncate mr-2">{inv.navn}</span>
                              <span className="text-sm font-medium whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(inv.vekt)} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Regioner og Sektorer side om side */}
                    {(eksponering.regioner || eksponering.sektorer) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Regioner */}
                        {eksponering.regioner && eksponering.regioner.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Regioner</h4>
                            <div className="space-y-1">
                              {eksponering.regioner.map((region, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="flex-grow bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${region.vekt}%`, backgroundColor: PENSUM_COLORS.lightBlue }}></div>
                                  </div>
                                  <span className="text-xs w-24 truncate">{oversettEksponering(region.navn)}</span>
                                  <span className="text-xs font-medium w-10 text-right">{pst(region.vekt)} %</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Sektorer */}
                        {eksponering.sektorer && eksponering.sektorer.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Sektorer</h4>
                            <div className="space-y-1">
                              {eksponering.sektorer.map((sektor, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="flex-grow bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${sektor.vekt}%`, backgroundColor: PENSUM_COLORS.salmon }}></div>
                                  </div>
                                  <span className="text-xs w-32 truncate">{oversettEksponering(sektor.navn)}</span>
                                  <span className="text-xs font-medium w-10 text-right">{pst(sektor.vekt)} %</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Stil */}
                    {eksponering.stil && eksponering.stil.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsstil</h4>
                        <div className="flex flex-wrap gap-2">
                          {eksponering.stil.map((stil, idx) => (
                            <div key={idx} className="px-3 py-2 bg-gray-100 rounded-lg">
                              <span className="text-xs text-gray-600">{oversettEksponering(stil.navn)}</span>
                              <span className="ml-2 text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(stil.vekt)} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Avkastningshistorikk */}
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Historisk avkastning</h4>
                      <div className="flex flex-wrap gap-4">
                        {erGyldigTall(valgtProduktDetalj.aar2024) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2024</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2024 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2024 > 0 ? '+' : ''}{pst(valgtProduktDetalj.aar2024)} %</span></div>}
                        {erGyldigTall(valgtProduktDetalj.aar2023) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2023</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2023 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2023 > 0 ? '+' : ''}{pst(valgtProduktDetalj.aar2023)} %</span></div>}
                        {erGyldigTall(valgtProduktDetalj.aar2022) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2022</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2022 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2022 > 0 ? '+' : ''}{pst(valgtProduktDetalj.aar2022)} %</span></div>}
                        {(() => { const nokkeltall = beregnProduktNokkeltall(valgtProduktDetalj, produktHistorikk?.[valgtProduktDetalj?.id]); return nokkeltall.aarlig3ar !== null && <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200"><span className="text-xs text-blue-600 block">Årlig 3 år (beregnet)</span><span className={"text-lg font-bold " + (nokkeltall.aarlig3ar >= 0 ? "text-green-600" : "text-red-600")}>{nokkeltall.aarlig3ar > 0 ? '+' : ''}{pst(nokkeltall.aarlig3ar)} %</span></div>; })()}
                        {(() => { const nokkeltall = beregnProduktNokkeltall(valgtProduktDetalj, produktHistorikk?.[valgtProduktDetalj?.id]); return nokkeltall.risiko3ar !== null && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">Risiko 3 år (beregnet)</span><span className="text-lg font-bold text-gray-700">{pst(nokkeltall.risiko3ar)} %</span></div>; })()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setValgtProduktDetalj(null)} className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
      

      <header className="bg-white shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={PENSUM_LOGO} alt="Pensum Asset Management" className="h-20 md:h-24" />
          <div className="flex items-center gap-2">
            {/* Bruker-info */}
            {bruker ? (
              <div className="relative flex items-center gap-2 text-sm">
                <button onClick={() => setVisProfilPanel(!visProfilPanel)} className="flex items-center gap-2 px-4 py-2 font-medium bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  {bruker.bilde ? (
                    <img src={bruker.bilde} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                  <span className="text-green-700 font-medium">{bruker.navn}</span>
                  <svg className={"w-3 h-3 text-green-600 transition-transform " + (visProfilPanel ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button onClick={loggUtBruker} className="text-gray-400 hover:text-gray-600" title="Logg ut">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
                {visProfilPanel && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#F8FAFB' }}>
                      <p className="text-xs font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Min profil</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Profilbilde */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {bruker.bilde ? (
                            <img src={bruker.bilde} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-500 block mb-1">Profilbilde (maks 500KB)</label>
                          <input type="file" accept="image/*" onChange={handleBildeUpload} className="text-xs w-full" />
                        </div>
                      </div>
                      {/* Telefon */}
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-0.5">Telefon</label>
                        <input
                          type="tel"
                          value={bruker.telefon || ''}
                          onChange={(e) => oppdaterBrukerProfil('telefon', e.target.value)}
                          placeholder="+47 XXX XX XXX"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                        />
                      </div>
                      {/* Tittel */}
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-0.5">Tittel</label>
                        <select
                          value={bruker.tittel || 'Investeringsrådgiver'}
                          onChange={(e) => oppdaterBrukerProfil('tittel', e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                        >
                          <option value="Investeringsrådgiver">Investeringsrådgiver</option>
                          <option value="Senior investeringsrådgiver">Senior investeringsrådgiver</option>
                          <option value="Partner">Partner</option>
                          <option value="Porteføljeforvalter">Porteføljeforvalter</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-gray-400">E-post: {bruker.epost}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setVisLoginModal(true)} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                style={{ color: PENSUM_COLORS.darkBlue }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Logg inn
              </button>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setVisKundeliste(!visKundeliste)} title="Åpne eller bytt aktivt kundekort" className={"px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border max-w-xs " + (aktivKundeId ? "bg-blue-50 border-blue-300" : visKundeliste ? "bg-blue-100 border-blue-300 text-blue-700" : "border-gray-300 hover:bg-gray-50")} style={{ color: visKundeliste ? undefined : PENSUM_COLORS.darkBlue }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="truncate">{(kundeNavn || kundeSelskap) ? `Kundekort: ${kundeNavn || kundeSelskap}` : 'Velg kundekort'}</span>
              </button>
              <div className="relative">
                <button onClick={lagreKunde} title={(kundeNavn || kundeSelskap) ? `Lagre endringene på kundekortet til ${kundeNavn || kundeSelskap}` : 'Oppgi kundenavn før du lagrer'} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: lagringsStatus ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                  {lagringsStatus ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  )}
                  {lagringsStatus || 'Lagre kundekort'}
                </button>
                {(kundeNavn || kundeSelskap) && !lagringsStatus && <span className="absolute left-0 right-0 top-full mt-0.5 truncate text-center text-[10px] font-medium text-gray-500">Lagrer på: {kundeNavn || kundeSelskap}</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-1 overflow-x-auto -mb-px">
              {/* Formuesplanlegger, fondssammenligning og belåning ligger samlet under Verktøy */}
              {['input', 'losninger', 'rapport', 'verktoy'].map(tab => {
                const aktiv = tab === 'verktoy' ? VERKTOY_FANER.some(v => v.id === activeTab) || activeTab === 'allokering' : activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab === 'verktoy' ? sisteVerktoy : tab)} className={"px-5 py-3 font-medium whitespace-nowrap text-sm " + (aktiv ? "text-white border-b-2 border-white" : "text-blue-200 hover:text-white")}>
                    {tab === 'input' ? 'Kundeinformasjon' : tab === 'losninger' ? 'Porteføljebygging' : tab === 'rapport' ? 'Investeringsforslag' : 'Verktøy'}
                  </button>
                );
              })}
              {/* Admin-fane - vises alltid men krever passord */}
              <button onClick={() => setActiveTab('admin')} className={"px-5 py-3 font-medium whitespace-nowrap text-sm ml-auto " + (activeTab === 'admin' ? "text-white border-b-2 border-white" : "text-blue-300 hover:text-white")}>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Admin
                </span>
              </button>
            </nav>
          </div>
        </div>
        {(VERKTOY_FANER.some(v => v.id === activeTab) || activeTab === 'allokering') && (
          <div className="bg-white border-b border-gray-200 no-print" data-verktoymeny>
            <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center gap-2">
              {VERKTOY_FANER.map(v => {
                const aktiv = activeTab === v.id || (v.id === 'formuesplanlegger' && activeTab === 'allokering');
                return (
                  <button key={v.id} onClick={() => { setActiveTab(v.id); setSisteVerktoy(v.id); }} title={v.hjelp}
                    className={"px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors " + (aktiv ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                    style={aktiv ? { backgroundColor: PENSUM_COLORS.darkBlue } : {}}>{v.navn}</button>
                );
              })}
              <span className="text-xs text-gray-400 ml-2 hidden md:inline">{VERKTOY_FANER.find(v => v.id === activeTab || (v.id === 'formuesplanlegger' && activeTab === 'allokering'))?.hjelp}</span>
            </div>
          </div>
        )}
      </header>

      {/* Kundeliste panel */}
      {visKundeliste && (() => {
        // Hvert kundekort får initialer og en fast farge, slik at kundene er lette å skille.
        const KORTFARGER = ['#0D2841', '#2D6A6A', '#A67B3D', '#5B4FA0', '#1E5F74', '#8B5E3C', '#BE6A8A', '#2D6A4F'];
        const PROFILFARGER = { Defensiv: ['#E8F0F4', '#1E5F74'], Moderat: ['#E8F0F0', '#2D6A6A'], Dynamisk: ['#FBF3E4', '#8A6420'], Offensiv: ['#FDF0EB', '#A6553A'] };
        const navnFor = (k) => k.kundeNavn || k.kundeSelskap || 'Uten navn';
        const initialer = (navn) => navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]).join('').toUpperCase() || '?';
        const fargeFor = (navn) => KORTFARGER[[...navn].reduce((sum, c) => sum + c.charCodeAt(0), 0) % KORTFARGER.length];
        const formueFor = (k) => ['aksjerKunde', 'aksjefondKunde', 'renterKunde', 'kontanterKunde', 'peFondKunde', 'unoterteAksjerKunde', 'shippingKunde', 'egenEiendomKunde', 'eiendomSyndikatKunde', 'eiendomFondKunde'].reduce((sum, f) => sum + (Number(k[f]) || 0), 0);
        const belopFor = (k) => (Number(k.investertBelop) > 0 ? Number(k.investertBelop) : formueFor(k));
        const kortBelop = (v) => (v >= 1e6 ? (v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1).replace('.', ',') + ' mill. kr' : formatCurrency(v));
        const datoTekst = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' }); };
        const sok = kundeSok.trim().toLowerCase();
        const sortert = lagredeKunder.slice().sort((a, b) => (a.id === aktivKundeId ? -1 : b.id === aktivKundeId ? 1 : new Date(b.sistEndret || 0) - new Date(a.sistEndret || 0)));
        const synlige = sok ? sortert.filter((k) => `${k.kundeNavn || ''} ${k.kundeSelskap || ''}`.toLowerCase().includes(sok)) : sortert;
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16" onClick={() => setVisKundeliste(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} data-kundeliste>
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <div>
                <h2 className="text-lg font-semibold text-white">Mine kunder</h2>
                {radgiver && <p className="text-xs text-blue-200 mt-0.5">{lagredeKunder.length} kundekort lagret for {arkivEier}</p>}
              </div>
              <button onClick={() => setVisKundeliste(false)} aria-label="Lukk" className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!radgiver ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <p className="text-gray-500 mb-2">Fyll inn rådgivernavn først</p>
                  <p className="text-sm text-gray-400">Gå til Kundeinformasjon og skriv inn ditt navn</p>
                </div>
              ) : lagredeKunder.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-gray-500">{arkivFeil ? 'Kundearkivet kunne ikke leses' : `Ingen lagrede kunder for ${arkivEier}`}</p>
                  <p className="text-sm text-gray-400 mt-1">Fyll inn kundedata og trykk «Lagre kundekort»</p>
                </div>
              ) : (
                <>
                  {lagredeKunder.length > 4 && (
                    <div className="relative mb-4">
                      <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                      <input type="text" value={kundeSok} onChange={(e) => setKundeSok(e.target.value)} placeholder="Søk på kunde eller selskap" aria-label="Søk i kundekort"
                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
                    </div>
                  )}
                  {synlige.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">Ingen kundekort passer med «{kundeSok}».</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {synlige.map((kunde) => {
                      const navn = navnFor(kunde);
                      const aktiv = aktivKundeId === kunde.id;
                      const belop = belopFor(kunde);
                      const produkter = (Array.isArray(kunde.pensumAllokering) ? kunde.pensumAllokering : []).filter((a) => a?.vekt > 0);
                      const sumVekt = produkter.reduce((sum, a) => sum + a.vekt, 0) || 1;
                      const [profilBg, profilFg] = PROFILFARGER[kunde.risikoprofil] || ['#F1F5F9', '#475569'];
                      return (
                        <div key={kunde.id} role="button" tabIndex={0} onClick={() => lastKundeData(kunde)} onKeyDown={(e) => { if (e.key === 'Enter') lastKundeData(kunde); }}
                          className={"group relative rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-md " + (aktiv ? "border-transparent ring-2" : "border-gray-200 bg-white")}
                          style={aktiv ? { '--tw-ring-color': PENSUM_COLORS.salmon, backgroundColor: '#FDF8F5' } : {}} data-kundekort>
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: fargeFor(navn) }}>{initialer(navn)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold truncate" style={{ color: PENSUM_COLORS.darkBlue }} title={navn}>{navn}</div>
                              <div className="text-xs text-gray-500 truncate">{kunde.kundeNavn && kunde.kundeSelskap ? kunde.kundeSelskap : (datoTekst(kunde.sistEndret) ? `Sist endret ${datoTekst(kunde.sistEndret)}` : '')}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); slettKunde(kunde.id); }} aria-label={`Slett kundekortet for ${navn}`} title="Slett kundekort"
                              className="p-1.5 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            {aktiv && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: PENSUM_COLORS.salmon }}>Åpent nå</span>}
                            {kunde.risikoprofil && <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: profilBg, color: profilFg }}>{kunde.risikoprofil}</span>}
                            {belop > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 tabular-nums">{kortBelop(belop)}</span>}
                            {Number(kunde.horisont) > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{kunde.horisont} år</span>}
                          </div>
                          {produkter.length > 0 && (
                            <div className="mt-3">
                              <div className="h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: '#E2E8F0' }} title={produkter.map((a) => `${a.navn} ${pst(Number(((a.vekt / sumVekt) * 100).toFixed(1)))} %`).join(' · ')}>
                                {produkter.map((a, idx) => <div key={a.id} style={{ width: (a.vekt / sumVekt) * 100 + '%', backgroundColor: PORTEFOLJE_FARGER[idx % PORTEFOLJE_FARGER.length] }}></div>)}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1.5 truncate">{produkter.length} {produkter.length === 1 ? 'produkt' : 'produkter'} · {produkter.slice().sort((a, b) => b.vekt - a.vekt).slice(0, 2).map((a) => String(a.navn || '').replace('Pensum ', '')).join(', ')}{produkter.length > 2 ? ' m.fl.' : ''}</div>
                            </div>
                          )}
                          {kunde.kundeNavn && kunde.kundeSelskap && datoTekst(kunde.sistEndret) && <div className="text-[11px] text-gray-400 mt-2">Sist endret {datoTekst(kunde.sistEndret)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button onClick={nyKunde} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center gap-2" style={{ color: PENSUM_COLORS.darkBlue }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Ny kunde
                  </button>
                </div>
                <div className="flex gap-2">
                  <label className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center gap-2 cursor-pointer" style={{ color: PENSUM_COLORS.darkBlue }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Importer
                    <input type="file" accept=".json" onChange={importerKunde} className="hidden" />
                  </label>
                  <button onClick={eksporterKunde} disabled={!kundeNavn} className={"px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 " + (kundeNavn ? "border-gray-200 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed")} style={{ color: kundeNavn ? PENSUM_COLORS.darkBlue : undefined }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Eksporter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'input' && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-5 gap-6 no-print" data-startside>
            <div className="lg:col-span-3 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <div className="px-8 py-7">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: PENSUM_COLORS.salmon }}>Nytt forslag</div>
                <h2 className="text-2xl font-semibold text-white mt-1">Fra tre svar til ferdig presentasjon</h2>
                <p className="text-sm text-blue-200 mt-1">Svar på tre spørsmål. Du får en standardportefølje du kan justere, og laster ned forslaget som PowerPoint.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <label className="block">
                    <span className="text-xs text-blue-200">Beløp som skal investeres</span>
                    <div className="mt-1 flex items-center bg-white rounded-lg px-3">
                      <input type="text" inputMode="numeric" placeholder="10 000 000" value={start.belop} aria-label="Beløp som skal investeres"
                        onChange={(e) => { const v = parseBelop(e.target.value); setStart((p) => ({ ...p, belop: v > 0 ? formatNumber(v) : '' })); }}
                        className="w-full py-2.5 text-base font-semibold outline-none" style={{ color: PENSUM_COLORS.darkBlue }} />
                      <span className="text-sm text-gray-400">kr</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs text-blue-200">Tidshorisont</span>
                    <div className="mt-1 flex items-center bg-white rounded-lg px-3">
                      <input type="number" min="1" max="40" value={start.horisont} aria-label="Tidshorisont i år" onChange={(e) => setStart((p) => ({ ...p, horisont: e.target.value }))}
                        className="w-full py-2.5 text-base font-semibold outline-none" style={{ color: PENSUM_COLORS.darkBlue }} />
                      <span className="text-sm text-gray-400">år</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs text-blue-200">Kundens navn (valgfritt)</span>
                    <input type="text" value={start.navn} aria-label="Kundens navn" onChange={(e) => setStart((p) => ({ ...p, navn: e.target.value }))}
                      className="mt-1 w-full bg-white rounded-lg px-3 py-2.5 text-base outline-none" style={{ color: PENSUM_COLORS.darkBlue }} />
                  </label>
                </div>
                <div className="mt-4">
                  <span className="text-xs text-blue-200">Risikoprofil</span>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].map((profil) => (
                      <button key={profil} type="button" onClick={() => setStart((p) => ({ ...p, profil }))} aria-pressed={start.profil === profil}
                        className={"py-2.5 rounded-lg text-sm font-semibold border transition-colors " + (start.profil === profil ? "bg-white border-white" : "border-white/30 text-white hover:bg-white/10")}
                        style={start.profil === profil ? { color: PENSUM_COLORS.darkBlue } : undefined}>
                        {profil}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={startNyKunde} className="mt-6 px-6 py-3 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: PENSUM_COLORS.salmon }}>
                  Bygg portefølje →
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Fortsett med en kunde</div>
              {lagredeKunder.length === 0 ? (
                <p className="text-sm text-gray-500 mt-3">{radgiver ? 'Du har ingen lagrede kundekort ennå. Kundekort du lagrer, vises her.' : 'Logg inn eller fyll inn rådgivernavn for å se lagrede kundekort.'}</p>
              ) : (
                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {lagredeKunder.slice().sort((a, b) => new Date(b.sistEndret || 0) - new Date(a.sistEndret || 0)).slice(0, 8).map((kunde) => (
                    <button key={kunde.id} type="button" onClick={() => { lastKundeData(kunde); setActiveTab('losninger'); }}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gray-50 flex items-center justify-between">
                      <span>
                        <span className="block text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{kunde.kundeNavn || kunde.kundeSelskap || 'Uten navn'}</span>
                        <span className="block text-xs text-gray-400">{kunde.risikoprofil || ''}{kunde.sistEndret ? ` · sist endret ${new Date(kunde.sistEndret).toLocaleDateString('nb-NO')}` : ''}</span>
                      </span>
                      <span className="text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">Trenger du hele formuesbildet? Fyll inn kundeinformasjonen under.</p>
            </div>
          </div>
        )}
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Kundeinformasjon</h3>
                {bruker && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-blue-200">{bruker.tittel || 'Rådgiver'}: {bruker.navn}</span>}
              </div>
              <div className="p-6 space-y-5">
                {/* Kunde-identifikasjon */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Investor</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input type="text" value={kundeNavn} onChange={(e) => setKundeNavn(e.target.value)} placeholder="Navn på investor" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Personnavn eller kontaktperson</span>
                    </div>
                    <div>
                      <input type="text" value={kundeSelskap} onChange={(e) => setKundeSelskap(e.target.value)} placeholder="Selskap / organisasjon (valgfritt)" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Investeringsselskap, AS, stiftelse e.l.</span>
                    </div>
                  </div>
                </div>

                {/* Risikoprofil - som visuelle knapper */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Risikoprofil</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].map(profil => (
                      <button
                        key={profil}
                        onClick={() => resetTilAutomatisk(profil)}
                        className={"rounded-lg py-3 px-2 text-center transition-all border-2 " + (risikoprofil === profil ? 'shadow-md' : 'border-gray-100 hover:border-gray-200')}
                        style={risikoprofil === profil ? { borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' } : {}}
                      >
                        <span className={"block text-sm font-semibold " + (risikoprofil === profil ? '' : 'text-gray-500')} style={risikoprofil === profil ? { color: PENSUM_COLORS.darkBlue } : {}}>{profil}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">{RISK_PROFILES[profil].aksjer}/{RISK_PROFILES[profil].renter}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">{pst((RISK_PROFILES[risikoprofil] || RISK_PROFILES.Moderat).aksjer)} % aksjer · {pst((RISK_PROFILES[risikoprofil] || RISK_PROFILES.Moderat).renter)} % renter</p>
                </div>

                {/* Horisont - som slider + tall */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringshorisont</label>
                  <div className="relative">
                    <input type="text" value={localHorisont} onChange={(e) => setLocalHorisont(e.target.value)} onBlur={() => { const v = Math.max(1, Math.min(50, parseInt(localHorisont,10)||10)); setHorisont(v); setLocalHorisont(v.toString()); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">år</span>
                  </div>
                </div>

                {/* Rådgiver og dato */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Rådgiver</label>
                    <input type="text" defaultValue={radgiver} onBlur={(e) => setRadgiver(e.target.value)} placeholder="Navn på rådgiver" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Dato</label>
                    <input type="date" value={dato} onChange={(e) => setDato(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                  </div>
                </div>

                {/* Investert beløp (valgfritt override) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>
                    Investert beløp
                  </label>
                  <div className="relative">
                    <input type="text" value={investertBelop !== null ? formatNumber(investertBelop) : ''} onChange={(e) => { const v = parseBelop(e.target.value); setInvestertBelop(isNaN(v) ? null : v); }} onFocus={(e) => { if (investertBelop !== null) e.target.value = investertBelop.toString(); }} onBlur={(e) => { const v = parseBelop(e.target.value); setInvestertBelop(isNaN(v) || v === 0 ? null : v); }} placeholder={formatCurrency(totalKapital) + ' (fra kapitaloversikt)'} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
                  </div>
                </div>

                {/* Formål med investeringene */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Formål med investeringene</label>
                  <input type="text" value={investeringsFormaal} onChange={(e) => setInvesteringsFormaal(e.target.value)} placeholder="F.eks. Utvikle finansiell formue" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                </div>

                {/* Likviditetsbehov */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditetsbehov</label>
                  <select value={likviditetsbehov} onChange={(e) => setLikviditetsbehov(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                    <option value="Begrenset">Begrenset</option>
                    <option value="Moderat">Moderat</option>
                    <option value="Høyt">Høyt</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Dagens økonomiske situasjon</h3></div>
                <div className="p-6">
                  <CollapsibleSection title="Likvide midler" isOpen={expandedKundeKategorier.likvide} onToggle={() => toggleKundeKategori('likvide')} sum={likvideTotal}>
                    <CurrencyInput label="Aksjer" value={aksjerKunde} onChange={setAksjerKunde} />
                    <CurrencyInput label="Aksjefond" value={aksjefondKunde} onChange={setAksjefondKunde} />
                    <CurrencyInput label="Renter" value={renterKunde} onChange={setRenterKunde} />
                    <CurrencyInput label="Kontanter (bank)" value={kontanterKunde} onChange={setKontanterKunde} />
                  </CollapsibleSection>
                  <CollapsibleSection title="Alternative investeringer" isOpen={expandedKundeKategorier.illikvide} onToggle={() => toggleKundeKategori('illikvide')} sum={illikvideTotal}>
                    <div className="mb-3">
                      <div className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100" onClick={() => toggleKundeKategori('pe')}>
                        <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.teal }}>Private Equity</span>
                        <span className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(peTotal)}</span>
                      </div>
                      {expandedKundeKategorier.pe && (
                        <div className="mt-2">
                          <CurrencyInput label="PE-fond" value={peFondKunde} onChange={setPeFondKunde} indent />
                          <CurrencyInput label="Unoterte aksjer" value={unoterteAksjerKunde} onChange={setUnoterteAksjerKunde} indent />
                          <CurrencyInput label="Shipping" value={shippingKunde} onChange={setShippingKunde} indent />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100" onClick={() => toggleKundeKategori('eiendom')}>
                        <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.gold }}>Eiendom</span>
                        <span className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(eiendomTotal)}</span>
                      </div>
                      {expandedKundeKategorier.eiendom && (
                        <div className="mt-2">
                          <CurrencyInput label="Egen eiendom" value={egenEiendomKunde} onChange={setEgenEiendomKunde} indent />
                          <CurrencyInput label="Eiendomssyndikat" value={eiendomSyndikatKunde} onChange={setEiendomSyndikatKunde} indent />
                          <CurrencyInput label="Eiendomsfond" value={eiendomFondKunde} onChange={setEiendomFondKunde} indent />
                        </div>
                      )}
                    </div>
                  </CollapsibleSection>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total kapital</span>
                      <span className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalKapital)}</span>
                    </div>
                  </div>
                  <button onClick={() => resetTilAutomatisk(risikoprofil)} className="w-full mt-4 py-2.5 px-4 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    Oppdater allokering basert på risikoprofil
                  </button>
                  <button
                    onClick={() => {
                      setAksjerKunde(0); setAksjefondKunde(0); setRenterKunde(0); setKontanterKunde(0);
                      setPeFondKunde(0); setUnoterteAksjerKunde(0); setShippingKunde(0);
                      setEgenEiendomKunde(0); setEiendomSyndikatKunde(0); setEiendomFondKunde(0);
                      // Manuelt innskrevne beløp i Pensum-forslaget og Formuesplanleggeren følger
                      // ellers ikke med, og ville blitt stående igjen etter nullstilling.
                      setInvestertBelop(null); setFormuesPlanleggerBelop(null);
                    }}
                    className="w-full mt-2 py-2 px-4 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Nullstill beløp
                  </button>
                </div>
              </div>
              {/* Kundens nåværende portefølje hos andre banker. Lukket til rådgiver åpner den eller det ligger posisjoner der. */}
              <div className="lg:col-span-2" id="dagens-portefolje" data-dagens-seksjon>
                {(visDagens || dagensPosisjoner.length > 0) ? (
                  <DagensPortefolje posisjoner={dagensPosisjoner} setPosisjoner={setDagensPosisjoner}
                    plattformAvkastning={dagensPlattformAvk} setPlattformAvkastning={setDagensPlattformAvk}
                    analyse={dagensAnalyse} sammenligning={dagensMotNy}
                    onBrukIForslaget={brukDagensIForslaget} bruktIForslaget={dagensBruktIForslaget} />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Kundens portefølje i dag</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Legg inn det kunden har i dag, for eksempel hos andre banker, og få en analyse og egne sider i forslaget.</p>
                    </div>
                    <button onClick={() => setVisDagens(true)} data-dagens-aapne className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Legg inn dagens portefølje</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {(activeTab === 'allokering' || activeTab === 'formuesplanlegger') && (
          <>

          <div className="space-y-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Pensum Prognosemodell</h3>
                  <div className="flex items-center gap-4">
                    {/* Investert beløp */}
                    <div className="flex items-center gap-2 pr-4 border-r border-blue-400">
                      <span className="text-sm text-blue-200">Beløp:</span>
                      <input
                        type="text"
                        value={formuesPlanleggerBelop !== null ? formatNumber(formuesPlanleggerBelop) : (investertBelop !== null ? formatNumber(investertBelop) : formatNumber(totalKapital))}
                        onChange={(e) => {
                          const value = parseBelop(e.target.value) || 0;
                          setFormuesPlanleggerBelop(value);
                        }}
                        className="border border-blue-400 bg-blue-800/50 text-white rounded py-1 px-2 w-28 text-right text-sm"
                      />
                      <span className="text-blue-300 text-sm">kr</span>
                      {formuesPlanleggerBelop !== null && (
                        <button onClick={() => setFormuesPlanleggerBelop(null)} className="text-blue-300 hover:text-white" title="Tilbakestill til kundeinformasjon-beløp">↺</button>
                      )}
                    </div>
                    {/* Horisont */}
                    <div className="flex items-center gap-2 pr-4 border-r border-blue-400">
                      <span className="text-sm text-blue-200">Horisont:</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={horisont}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                          setHorisont(v);
                          setLocalHorisont(v.toString());
                        }}
                        className="border border-blue-400 bg-blue-800/50 text-white rounded py-1 px-2 w-16 text-right text-sm"
                      />
                      <span className="text-blue-300 text-sm">år</span>
                      {horisont !== 10 && (
                        <button onClick={() => { setHorisont(10); setLocalHorisont('10'); }} className="text-blue-300 hover:text-white" title="Tilbakestill til 10 år">↺</button>
                      )}
                    </div>
                    {/* Alternative investeringer */}
                    <div className="flex items-center gap-4 pr-4 border-r border-blue-400">
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={effektivVisAlternative} onChange={(e) => setVisAlternativeAllokering(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Alternative investeringer</span>
                      </label>
                    </div>
                    {/* Risikoprofil buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-200">Risikoprofil:</span>
                      {['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].map(profil => (
                        <button key={profil} onClick={() => resetTilAutomatisk(profil)} className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (risikoprofil === profil ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}>
                          {profil}
                        </button>
                      ))}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pl-3 border-l border-blue-400">
                      <button onClick={() => setShowComparison(!showComparison)} className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (showComparison ? "bg-purple-400 text-white" : "bg-blue-800 text-white hover:bg-blue-700")}>
                        {showComparison ? 'Skjul sammenligning' : 'Sammenlign'}
                      </button>
                      <button onClick={() => { setVisAlternativeAllokering(null); resetTilAutomatisk(); setFormuesPlanleggerBelop(null); }} className="px-3 py-1.5 rounded text-xs font-medium bg-blue-800 text-white hover:bg-blue-700 transition-colors">Tilbakestill alt</button>
                    </div>
                  </div>
                </div>
              </div>
              {showComparison && (
                <div className="p-5 border-b border-gray-200 bg-teal-50/50">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.teal }}>Utgangspunkt:</span>
                    <select value={sammenligningProfil} onChange={(e) => oppdaterSammenligningProfil(e.target.value)} className="border border-teal-200 rounded-lg py-2 px-4 bg-teal-50">
                      <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                    </select>
                    <button onClick={() => oppdaterSammenligningProfil(sammenligningProfil)} className="text-xs text-purple-600 hover:text-purple-800 underline">Tilbakestill</button>
                    <span className="text-xs text-purple-600 ml-auto">Forv. avk: {formatPercent(sammenligningAvkastning)}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <table className="w-full text-sm">
                      <thead><tr className="text-purple-700"><th className="text-left py-1 px-2 font-medium">Aktivaklasse</th><th className="text-center py-1 px-1 font-medium">Vekt</th><th className="text-center py-1 px-1 font-medium">Avk.</th></tr></thead>
                      <tbody>{sammenligningAllokering.map((item, idx) => <SammenligningRow key={item.navn} item={item} index={idx} updateSammenligningVekt={updateSammenligningVekt} updateSammenligningAvkastning={updateSammenligningAvkastning} />)}</tbody>
                      <tfoot><tr className="border-t border-purple-300"><td className="py-2 px-2 font-semibold text-purple-700">Sum</td><td className={"py-2 px-1 text-center font-semibold " + (Math.abs(sammenligningAllokering.reduce((s,a)=>s+a.vekt,0) - 100) < 0.5 ? "text-green-600" : "text-red-600")}>{formatPercent(sammenligningAllokering.reduce((s,a)=>s+a.vekt,0))}</td><td className="py-2 px-1 text-center font-semibold text-purple-700">{formatPercent(sammenligningAvkastning)}</td></tr></tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Porteføljeallokering</h3></div>
                  {Math.abs(totalVekt - 100) >= 0.5 && (
                    <div className={"px-6 py-3 flex items-center gap-2 " + (totalVekt < 100 ? "bg-yellow-50 border-b border-yellow-200" : "bg-red-50 border-b border-red-200")}>
                      <svg className={"w-5 h-5 " + (totalVekt < 100 ? "text-yellow-600" : "text-red-600")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className={"text-sm font-medium " + (totalVekt < 100 ? "text-yellow-700" : "text-red-700")}>
                        {totalVekt < 100 
                          ? "Total vekting er " + formatPercent(totalVekt) + " (" + formatPercent(100 - totalVekt) + " uallokert)"
                          : "Total vekting er " + formatPercent(totalVekt) + " (overallokert med " + formatPercent(totalVekt - 100) + ")"
                        }
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
                          <input type="checkbox" checked={autoRebalanserAllokering} onChange={(e) => setAutoRebalanserAllokering(e.target.checked)} className="w-3.5 h-3.5 rounded" style={{ accentColor: PENSUM_COLORS.teal }} />
                          <span>Auto 100%</span>
                        </label>
                        <button onClick={normaliserAllokeringTil100} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                          Juster til 100%
                        </button>
                        <label className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
                          <input type="checkbox" checked={belopInputModus} onChange={(e) => setBelopInputModus(e.target.checked)} className="w-3.5 h-3.5 rounded" style={{ accentColor: PENSUM_COLORS.lightBlue }} />
                          <span>Rediger beløp</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        {belopInputModus && effektivtInvestertBelop > 0 && (
                          <div className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 tabular-nums" title="Total av innskrevne beløp">
                            {formatCurrency(effektivtInvestertBelop)}
                          </div>
                        )}
                        <div className={"flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold " + (Math.abs(totalVekt - 100) < 0.2 ? "bg-green-50 text-green-700 border border-green-200" : totalVekt > 100 ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                          <div className={"w-2 h-2 rounded-full " + (Math.abs(totalVekt - 100) < 0.2 ? "bg-green-500" : totalVekt > 100 ? "bg-red-500" : "bg-amber-500")}></div>
                          {formatPercent(totalVekt)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        const fjernIndeks = (navn) => setAllokering(prev => prev.filter(a => a.navn !== navn));
                        const katFarger = { aksjer: { bg: '#EFF6FF', stripe: '#0D2841' }, renter: { bg: '#FFF1F2', stripe: '#C4967E' }, privateMarkets: { bg: '#F0FDFA', stripe: '#2D6A6A' }, eiendom: { bg: '#FEF9C3', stripe: '#A67B3D' }, shipping: { bg: '#F0FDFA', stripe: '#1E5F74' } };
                        const katNavn = { aksjer: 'Aksjer', renter: 'Renter', privateMarkets: 'Alternative', eiendom: 'Alternative', shipping: 'Alternative' };
                        const grupper = [
                          { id: 'aksjer', filter: a => a.kategori === 'aksjer' },
                          { id: 'renter', filter: a => a.kategori === 'renter' },
                        ];
                        if (effektivVisAlternative && allokering.some(a => a.kategori === 'privateMarkets' || a.kategori === 'eiendom' || a.kategori === 'shipping')) {
                          grupper.push({ id: 'privateMarkets', filter: a => a.kategori === 'privateMarkets' || a.kategori === 'eiendom' || a.kategori === 'shipping' });
                        }
                        return grupper.map(({ id, filter }) => {
                          const items = allokering.filter(filter);
                          if (!items.length) return null;
                          const kat = kategorierData.find(c => c.kategori === (id === 'privateMarkets' ? 'alternative' : id));
                          const farger = katFarger[id] || { bg: '#F8F9FA', stripe: '#888' };
                          return (
                            <div key={id}>
                              <div className="flex items-center justify-between px-4 py-2 mt-1 rounded-t-lg" style={{ backgroundColor: farger.bg, borderLeft: `4px solid ${farger.stripe}` }}>
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: farger.stripe }} />
                                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: farger.stripe }}>{katNavn[id] || id}</span>
                                </div>
                                {kat && (
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="font-semibold tabular-nums" style={{ color: farger.stripe }}>{formatPercent(kat.vekt)}</span>
                                    <span className="text-gray-400 tabular-nums">{formatCurrency(kat.belop)}</span>
                                  </div>
                                )}
                              </div>
                              {items.map((item) => (
                                <div key={item.navn} style={{ backgroundColor: farger.bg, borderLeft: `4px solid ${farger.stripe}`, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <AllokeringRow item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringBelop={updateAllokeringBelop} belopRedigerbar={belopInputModus} updateAllokeringAvkastning={updateAllokeringAvkastning} avkastningLaast={avkastningsraterLaast} onRemove={() => fjernIndeks(item.navn)} />
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Oppsummering: total %, total kr, vektet snittavkastning */}
                    {(() => {
                      const totalBelop = allokering.reduce((s, a) => s + (typeof a.belop === 'number' ? a.belop : (a.vekt / 100) * effektivtInvestertBelop), 0);
                      const snittAvkastning = totalVekt > 0
                        ? allokering.reduce((s, a) => s + (a.vekt || 0) * (a.avkastning || 0), 0) / totalVekt
                        : 0;
                      return (
                        <div className="border-t border-gray-200 mt-3 pt-4 grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total vekting</div>
                            <div className="text-lg font-bold tabular-nums" style={{ color: Math.abs(totalVekt - 100) < 0.2 ? PENSUM_COLORS.teal : '#B45309' }}>{formatPercent(totalVekt)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Totalbeløp</div>
                            <div className="text-lg font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalBelop)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Snittavkastning</div>
                            <div className="text-lg font-bold tabular-nums" style={{ color: PENSUM_COLORS.teal }}>{snittAvkastning.toFixed(1).replace('.', ',')} %</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Legg til indeks */}
                    <div className="border-t border-gray-200 pt-5 mt-2">
                      <h5 className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: PENSUM_COLORS.teal }}>Legg til indeks</h5>
                      <div className={"grid gap-4 " + (effektivVisAlternative ? "grid-cols-3" : "grid-cols-2")}>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">AKSJER</p>
                          <div className="space-y-1">
                            {[
                              { navn: 'Globale Aksjer', avkastning: 10, kategori: 'aksjer' },
                              { navn: 'Norske Aksjer', avkastning: 11, kategori: 'aksjer' },
                              { navn: 'Europeiske Aksjer', avkastning: 9, kategori: 'aksjer' },
                              { navn: 'Emerging Markets', avkastning: 11, kategori: 'aksjer' },
                              { navn: 'Amerikanske Aksjer', avkastning: 10.5, kategori: 'aksjer' },
                              { navn: 'Asiatiske Aksjer', avkastning: 10, kategori: 'aksjer' },
                            ].filter(p => !allokering.find(a => a.navn === p.navn)).map(produkt => (
                              <button key={produkt.navn} onClick={() => setAllokering(prev => [...prev, { ...produkt, vekt: 0 }])} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">RENTER</p>
                          <div className="space-y-1">
                            {[
                              { navn: 'Investment Grade', avkastning: 5, kategori: 'renter' },
                              { navn: 'Høyrente', avkastning: 7.5, kategori: 'renter' },
                              { navn: 'Statsobligasjoner', avkastning: 3.5, kategori: 'renter' },
                              { navn: 'Obligasjoner', avkastning: 4, kategori: 'renter' },
                            ].filter(p => !allokering.find(a => a.navn === p.navn)).map(produkt => (
                              <button key={produkt.navn} onClick={() => setAllokering(prev => [...prev, { ...produkt, vekt: 0 }])} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        {effektivVisAlternative && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 mb-2">ALTERNATIVE</p>
                            <div className="space-y-1">
                              {[
                                { navn: 'Private Equity', avkastning: 15, kategori: 'privateMarkets' },
                                { navn: 'Eiendom', avkastning: 8, kategori: 'eiendom' },
                                { navn: 'Infrastruktur', avkastning: 9, kategori: 'privateMarkets' },
                                { navn: 'Hedgefond', avkastning: 7, kategori: 'privateMarkets' },
                                { navn: 'Shipping', avkastning: 11, kategori: 'shipping' },
                              ].filter(p => !allokering.find(a => a.navn === p.navn)).map(produkt => (
                                <button key={produkt.navn} onClick={() => setAllokering(prev => [...prev, { ...produkt, vekt: 0 }])} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-amber-50 border border-amber-200 flex items-center justify-between">
                                  <span>{produkt.navn}</span>
                                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 mt-2 italic">Alle alternative investeringer er illikvide</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2 space-y-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
                  {/* Porteføljesammensetning - donut chart with side legend */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljesammensetning</h4>
                      {totalLaan > 0 && effektivtInvestertBelop > 0 && (
                        <div className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                          LTV {formatPercent((totalLaan / effektivtInvestertBelop) * 100)} · Lån {formatCurrency(totalLaan)}
                        </div>
                      )}
                    </div>
                    {showComparison ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</h5>
                          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2} cornerRadius={3}>{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || '#888'} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                          <div className="space-y-1 mt-1">
                            {pieData.filter(d => d.value > 0).map(d => (
                              <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: ASSET_COLORS[d.name] || '#888' }}></div><span className="text-gray-600 truncate">{d.name}</span></div>
                                <span className="font-semibold">{d.value.toFixed(0).replace('.', ',')} %</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.teal }}>{sammenligningProfil}</h5>
                          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={sammenligningPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2} cornerRadius={3}>{sammenligningPieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS_LIGHT[e.name] || ASSET_COLORS[e.name] || '#888'} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                          <div className="space-y-1 mt-1">
                            {sammenligningPieData.filter(d => d.value > 0).map(d => (
                              <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: ASSET_COLORS_LIGHT[d.name] || ASSET_COLORS[d.name] || '#888' }}></div><span className="text-gray-600 truncate">{d.name}</span></div>
                                <span className="font-semibold">{d.value.toFixed(0).replace('.', ',')} %</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        <div className="shrink-0">
                          <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                {pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === e.name)?.kategori] || '#888'} />)}
                              </Pie>
                              <Tooltip formatter={(v, n) => [v.toFixed(1).replace('.', ',') + ' %', n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1">
                          {pieData.filter(d => d.value > 0).map((entry, idx) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[entry.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === entry.name)?.kategori] || '#888' }}></div>
                                <span style={{ color: PENSUM_COLORS.darkBlue }}>{entry.name}</span>
                              </div>
                              <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{entry.value.toFixed(1).replace('.', ',')} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Likviditet — donut on right side */}
                {(() => {
                  const illikvKat = ['privateMarkets', 'eiendom', 'shipping'];
                  const currIllikvid = allokering.filter(a => illikvKat.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
                  const currLikvid = totalVekt - currIllikvid;
                  const currLikvidData = [{ name: 'Likvid', value: currLikvid }, { name: 'Illikvid', value: currIllikvid }].filter(d => d.value > 0);

                  if (showComparison) {
                    const sammIllikvid = sammenligningAllokering.filter(a => illikvKat.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
                    const sammLikvid = sammenligningAllokering.reduce((s, a) => s + a.vekt, 0) - sammIllikvid;
                    const sammLikvidData = [{ name: 'Likvid', value: sammLikvid }, { name: 'Illikvid', value: sammIllikvid }].filter(d => d.value > 0);
                    return (
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                        <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</h5>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={currLikvidData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2} cornerRadius={3}>{currLikvidData.map((e, i) => <Cell key={i} fill={[PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i]} />)}</Pie><Tooltip formatter={(v) => v.toFixed(0).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                            <div className="space-y-1 mt-1">
                              {currLikvidData.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: [PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i] }}></div><span className="text-gray-600">{d.name}</span></div>
                                  <span className="font-semibold">{d.value.toFixed(0).replace('.', ',')} %</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.teal }}>{sammenligningProfil}</h5>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={sammLikvidData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2} cornerRadius={3}>{sammLikvidData.map((e, i) => <Cell key={i} fill={[PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i]} />)}</Pie><Tooltip formatter={(v) => v.toFixed(0).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                            <div className="space-y-1 mt-1">
                              {sammLikvidData.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: [PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i] }}></div><span className="text-gray-600">{d.name}</span></div>
                                  <span className="font-semibold">{d.value.toFixed(0).replace('.', ',')} %</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                      <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet</h4>
                      <div className="flex items-center gap-6">
                        <div className="shrink-0">
                          <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                              <Pie data={currLikvidData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                {currLikvidData.map((e, i) => <Cell key={i} fill={[PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i]} />)}
                              </Pie>
                              <Tooltip formatter={(v) => v.toFixed(0).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2.5 flex-1">
                          {currLikvidData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2.5 text-sm">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: [PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold][i] }}></div>
                              <span className="flex-1 text-gray-700">{d.name}</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{d.value.toFixed(0).replace('.', ',')} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Sammensetning ved valgt slutt-år — inkl. rebalanseringer */}
                {visSluttSammensetning && sluttSammensetning && (
                  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden p-5">
                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 space-y-5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>
                          Sammensetning ved år {sluttSammensetning.aar}
                        </h4>
                        <span className="text-xs text-gray-500">etter {sluttSammensetningAar} år · {formatCurrency(sluttSammensetning.total)}</span>
                      </div>
                      {totalLaan > 0 && (() => {
                        const radLaan = sluttSammensetning.laanBalanse || totalLaan;
                        const ltv = sluttSammensetning.total > 0 ? (radLaan / sluttSammensetning.total) * 100 : 0;
                        const startLtv = effektivtInvestertBelop > 0 ? (totalLaan / effektivtInvestertBelop) * 100 : 0;
                        const ltvDiff = ltv - startLtv;
                        return (
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg px-2 py-1.5" style={{ backgroundColor: '#FEF2F2' }}>
                              <div className="text-[10px] uppercase tracking-wide" style={{ color: '#B91C1C' }}>Lånebalanse</div>
                              <div className="text-xs font-bold tabular-nums" style={{ color: '#7F1D1D' }}>{formatCurrency(radLaan)}</div>
                            </div>
                            <div className="rounded-lg px-2 py-1.5 bg-blue-50">
                              <div className="text-[10px] uppercase tracking-wide text-blue-700">Netto EK</div>
                              <div className="text-xs font-bold tabular-nums text-blue-900">{formatCurrency(Math.max(0, sluttSammensetning.total - radLaan))}</div>
                            </div>
                            <div className="rounded-lg px-2 py-1.5" style={{ backgroundColor: '#FDF6F2' }}>
                              <div className="text-[10px] uppercase tracking-wide" style={{ color: PENSUM_COLORS.salmon }}>LTV</div>
                              <div className="text-xs font-bold tabular-nums" style={{ color: '#8B6650' }}>
                                {formatPercent(ltv)} {Math.abs(ltvDiff) > 0.5 && <span className={ltvDiff < 0 ? 'text-emerald-600' : 'text-red-600'}>({ltvDiff > 0 ? '+' : ''}{ltvDiff.toFixed(1)} pp)</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div>
                        <div className="text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljesammensetning</div>
                        <div className="flex items-center gap-6">
                          <div className="shrink-0">
                            <ResponsiveContainer width={180} height={180}>
                              <PieChart>
                                <Pie data={sluttSammensetning.pie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                  {sluttSammensetning.pie.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === e.name)?.kategori] || '#888'} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v.toFixed(1).replace('.', ',') + ' %', n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 flex-1">
                            {sluttSammensetning.pie.map((entry) => (
                              <div key={entry.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[entry.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === entry.name)?.kategori] || '#888' }}></div>
                                  <span style={{ color: PENSUM_COLORS.darkBlue }}>{entry.name}</span>
                                </div>
                                <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{entry.value.toFixed(1).replace('.', ',')} %</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-emerald-100">
                        <div className="text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet</div>
                        <div className="flex items-center gap-6">
                          <div className="shrink-0">
                            <ResponsiveContainer width={140} height={140}>
                              <PieChart>
                                <Pie
                                  data={[{ name: 'Likvid', value: sluttSammensetning.likvid }, { name: 'Illikvid', value: sluttSammensetning.illikvid }].filter(d => d.value > 0)}
                                  cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={2} cornerRadius={4}
                                >
                                  <Cell fill={PENSUM_COLORS.darkBlue} />
                                  {sluttSammensetning.illikvid > 0 && <Cell fill={PENSUM_COLORS.gold} />}
                                </Pie>
                                <Tooltip formatter={(v) => v.toFixed(0).replace('.', ',') + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div><span className="text-gray-700">Likvid</span></div>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{sluttSammensetning.likvid.toFixed(0).replace('.', ',')} %</span>
                            </div>
                            {sluttSammensetning.illikvid > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.gold }}></div><span className="text-gray-700">Illikvid</span></div>
                                <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{sluttSammensetning.illikvid.toFixed(0).replace('.', ',')} %</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Samlet panel: Kontantstrøm, Rebalansering, Lånefinansiering, Finansielt mål */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Forutsetninger og mål</h3>
              </div>
              <div className="p-6 space-y-5">
                {/* ── Årlig kontantstrøm (alltid synlig) ── */}
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Årlig kontantstrøm</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Årlig innskudd (kr)</label>
                      <input type="text" value={formatNumber(innskudd || 0)} onChange={(e) => { const v = parseBelop(e.target.value) || 0; setInnskudd(v); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Årlige uttak (kr)</label>
                      <input type="text" value={formatNumber(uttak || 0)} onChange={(e) => { const v = parseBelop(e.target.value) || 0; setUttak(v); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                    </div>
                    <div className="rounded-lg p-3" style={{ backgroundColor: nettoKontantstrom >= 0 ? '#F0FDF4' : '#FEF2F2' }}>
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Netto kontantstrøm</div>
                      <div className={"text-xl font-bold " + (nettoKontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(nettoKontantstrom)}</div>
                    </div>
                  </div>
                </div>

                {/* ── Årlig rebalansering ── */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setRebalanseringAktiv(!rebalanseringAktiv)}>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Årlig rebalansering</h4>
                      {!rebalanseringAktiv && <span className="text-xs text-gray-400">(klikk for å aktivere)</span>}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-gray-500">{rebalanseringAktiv ? 'Aktiv' : 'Inaktiv'}</span>
                      <div className="relative">
                        <input type="checkbox" checked={rebalanseringAktiv} onChange={(e) => setRebalanseringAktiv(e.target.checked)} className="sr-only" />
                        <div className={"w-11 h-6 rounded-full transition-colors " + (rebalanseringAktiv ? "bg-green-500" : "bg-gray-300")}></div>
                        <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (rebalanseringAktiv ? "translate-x-5" : "")}></div>
                      </div>
                    </label>
                  </div>
                  {rebalanseringAktiv && (
                    <div className="mt-4 space-y-4">
                      {rebalanseringer.map((reb, rebIdx) => (
                        <div key={rebIdx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div>
                            {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Selg fra</label>}
                            <select value={reb.fraAktiva} onChange={(e) => setRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, fraAktiva: e.target.value } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                              {allokering.map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                            </select>
                          </div>
                          <div>
                            {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Kjøp til</label>}
                            <select value={reb.tilAktiva} onChange={(e) => setRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, tilAktiva: e.target.value } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                              {allokering.filter(a => a.navn !== reb.fraAktiva).map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                            </select>
                          </div>
                          <div>
                            {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Andel per år</label>}
                            <div className="relative">
                              <input type="number" min="1" max="100" value={reb.prosentPerAar} onChange={(e) => setRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, prosentPerAar: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 pr-8 text-sm" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                            <p>{pst(reb.prosentPerAar)} % av {reb.fraAktiva} → {reb.tilAktiva}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {rebalanseringer.length > 1 && (
                              <button onClick={() => setRebalanseringer(prev => prev.filter((_, i) => i !== rebIdx))} className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50">Fjern</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setRebalanseringer(prev => [...prev, { fraAktiva: allokering[0]?.navn || 'Eiendom', tilAktiva: allokering[1]?.navn || 'Globale Aksjer', prosentPerAar: 5 }])}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                        + Legg til regel
                      </button>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Allokering ved slutten av perioden ({horisont} år):</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {verdiutvikling[verdiutvikling.length - 1]?.allokeringSnapshot?.filter(a => a.vekt > 0.1).map(a => (
                            <span key={a.navn} className="inline-flex items-center gap-1.5 text-sm">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSET_COLORS[a.navn] || '#888' }}></span>
                              {a.navn}: {formatPercent(a.vekt)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {renderLaanOgMaal({
                  laanAktiv, setLaanAktiv, prognoseFinansiering, setPrognoseFinansiering,
                  laanModus, setLaanModus, akkumulerRenter, setAkkumulerRenter,
                  malAktiv, setMalAktiv, hovedmal, setHovedmal,
                  visDelmal, setVisDelmal, delmal, setDelmal,
                  visSluttSammensetning, setVisSluttSammensetning,
                  sluttSammensetningAar, setSluttSammensetningAar,
                  totalLaan, aarligRentekostnad, eksisterendeLaanModus,
                  egenkapitalBelop, effektivtInvestertBelop, portefoljeBelop,
                  verdiutvikling, vektetAvkastning, nettoKontantstrom, horisont,
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Startkapital" value={formatCurrency(effektivtInvestertBelop)} />
              <StatCard label="Forventet avkastning" value={formatPercent(vektetAvkastning)} subtext="årlig" />
              <StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((verdiutvikling[verdiutvikling.length - 1]?.total || 0) - effektivtInvestertBelop - (nettoKontantstrom * horisont))} color={PENSUM_COLORS.green} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">{showComparison ? "Prognose - Sammenligning" : "Prognose på utvikling i formuesverdi"}</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={kombinertVerdiutvikling} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={showComparison ? "20%" : "40%"}>
                    <defs>
                      <pattern id="laanPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                        <rect width="8" height="8" fill="#FEE2E2" />
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#B91C1C" strokeWidth="2" opacity="0.55" />
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} domain={[0, (dataMax) => {
                      const referanseVerdier = [dataMax, (malAktiv && hovedmal.visIGraf) ? hovedmal.belop : 0, totalLaan, ...(malAktiv && visDelmal ? delmal.map(m => m.belop || 0) : [])];
                      const maxRef = Math.max(...referanseVerdier);
                      if (maxRef <= 0) return 100;
                      const buffer = maxRef * 1.08;
                      const exp = Math.floor(Math.log10(buffer));
                      const niceNumbers = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
                      const mantissa = buffer / Math.pow(10, exp);
                      const nice = niceNumbers.find(n => n >= mantissa) || 10;
                      return nice * Math.pow(10, exp);
                    }]} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const assetEntries = payload.filter(p => aktiveAktiva.some(a => a.navn === p.dataKey));
                      const sum = assetEntries.reduce((s, p) => s + (Number(p.value) || 0), 0);
                      const laanRow = payload.find(p => p.dataKey === 'laanBalanse');
                      const altRow = payload.find(p => p.dataKey === 'total_alt');
                      return (
                        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 6, color: PENSUM_COLORS.darkBlue }}>{label}</div>
                          {assetEntries.map(p => {
                            const pct = sum > 0 ? (p.value / sum * 100) : 0;
                            return (
                              <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: p.color }}>
                                <span>{p.dataKey}</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(p.value)} <span style={{ color: '#94A3B8' }}>({pct.toFixed(1).replace('.', ',')} %)</span></span>
                              </div>
                            );
                          })}
                          {sum > 0 && (
                            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                              <span>Total</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sum)}</span>
                            </div>
                          )}
                          {altRow && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: altRow.color }}>
                              <span>Total ({sammenligningProfil})</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(altRow.value)}</span>
                            </div>
                          )}
                          {laanRow && Number(laanRow.value) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: '#B91C1C' }}>
                              <span>Lån</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(laanRow.value)} <span style={{ color: '#94A3B8' }}>(LTV {sum > 0 ? ((laanRow.value / sum) * 100).toFixed(1) : 0}%)</span></span>
                            </div>
                          )}
                        </div>
                      );
                    }} />
                    <Legend iconType="circle" />
                    {totalLaan > 0 && !akkumulerRenter && <ReferenceArea y1={0} y2={totalLaan} fill="url(#laanPattern)" fillOpacity={1} ifOverflow="visible" />}
                    {aktiveAktiva.map((a) => <Bar key={a.navn} dataKey={a.navn} stackId="a" fill={ASSET_COLORS[a.navn] || CATEGORY_COLORS[a.kategori]} />)}
                    {showComparison && <Bar dataKey="total_alt" stackId="b" fill={PENSUM_COLORS.teal} name={"Total (" + sammenligningProfil + ")"} opacity={0.7} />}
                    {totalLaan > 0 && akkumulerRenter && (
                      <Area type="monotone" dataKey="laanBalanse" fill="url(#laanPattern)" fillOpacity={1} stroke="#B91C1C" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} name="Lånebalanse">
                        <LabelList dataKey="laanBalanse" content={(props) => {
                          const { x, y, value, index } = props;
                          if (index !== kombinertVerdiutvikling.length - 1) return null;
                          return <text x={x} y={y - 6} fill="#FFFFFF" fontSize={13} fontWeight={700} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#B91C1C', strokeWidth: 4, strokeLinejoin: 'round' }}>Lån: {formatCurrency(value)}</text>;
                        }} />
                      </Area>
                    )}
                    {totalLaan > 0 && !akkumulerRenter && <ReferenceLine y={totalLaan} stroke="#B91C1C" strokeWidth={2} label={{ value: `Lån: ${formatCurrency(totalLaan)}`, position: 'insideBottomRight', fill: '#FFFFFF', fontSize: 13, fontWeight: 700, offset: 8, style: { paintOrder: 'stroke', stroke: '#B91C1C', strokeWidth: 4, strokeLinejoin: 'round' } }} />}
                    {malAktiv && hovedmal.belop > 0 && hovedmal.visIGraf && <ReferenceLine y={hovedmal.belop} stroke="#012441" strokeWidth={2} strokeDasharray="8 4" label={{ value: `${hovedmal.navn || 'Hovedmål'}: ${formatCurrency(hovedmal.belop)}`, position: 'insideTopRight', fill: '#012441', fontSize: 12, fontWeight: 600 }} />}
                    {malAktiv && hovedmal.belop > 0 && hovedmal.visIGraf && (() => {
                      const naarRow = verdiutvikling.find(r => r.total >= hovedmal.belop);
                      if (!naarRow) return null;
                      return <ReferenceDot x={naarRow.year} y={hovedmal.belop} r={9} fill="#059669" stroke="#FFFFFF" strokeWidth={2} ifOverflow="extendDomain" label={{ value: '✓', position: 'center', fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }} />;
                    })()}
                    {malAktiv && visDelmal && delmal.filter(m => m.belop > 0).map((m, i) => <ReferenceLine key={i} y={m.belop} stroke="#059669" strokeDasharray="4 4" label={{ value: m.navn || `Delmål ${i+1}`, position: 'right', fill: '#059669', fontSize: 11 }} />)}
                  </ComposedChart>
                </ResponsiveContainer>
                {showComparison && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)}</p></div>
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.teal }}>{sammenligningProfil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.teal }}>{formatCurrency(sammenligningVerdiutvikling[sammenligningVerdiutvikling.length - 1]?.total || 0)}</p></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Differanse: <strong className={(sammenligningVerdiutvikling[sammenligningVerdiutvikling.length-1]?.total||0) > (verdiutvikling[verdiutvikling.length-1]?.total||0) ? "text-green-600" : "text-red-600"}>{formatCurrency(Math.abs((sammenligningVerdiutvikling[sammenligningVerdiutvikling.length-1]?.total||0) - (verdiutvikling[verdiutvikling.length-1]?.total||0)))}</strong></p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Detaljert verdiutvikling</h3></div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                      <th className="py-3 px-4 text-left text-white">År</th>
                      <th className="py-3 px-3 text-right text-white">Innskudd/uttak</th>
                      {aktiveAktiva.map(a => <th key={a.navn} className="py-3 px-3 text-right text-white">{a.navn}</th>)}
                      <th className="py-3 px-4 text-right text-white font-bold">Total</th>
                      {totalLaan > 0 && <th className="py-3 px-3 text-right text-red-200">LTV</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {verdiutvikling.map((row, idx) => {
                      const radTotal = row.total || 0;
                      const radLaan = row.laanBalanse || totalLaan;
                      return (
                        <tr key={row.year} className={"border-b border-gray-100 " + (idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                          <td className="py-3 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                          <td className={"py-3 px-3 text-right " + (row.kontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{idx === 0 ? '—' : formatCurrency(row.kontantstrom)}</td>
                          {aktiveAktiva.map(a => {
                            const v = row[a.navn] || 0;
                            const pct = radTotal > 0 ? (v / radTotal) * 100 : 0;
                            return (
                              <td key={a.navn} className="py-3 px-3 text-right text-gray-600 tabular-nums">
                                <div>{formatCurrency(v)}</div>
                                <div className="text-[10px] text-gray-400">{pct.toFixed(1).replace('.', ',')} %</div>
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(radTotal)}</td>
                          {totalLaan > 0 && (
                            <td className="py-3 px-3 text-right text-red-600 text-xs tabular-nums">
                              <div>{radTotal > 0 ? formatPercent((radLaan / radTotal) * 100) : '—'}</div>
                              {akkumulerRenter && <div className="text-[10px] text-gray-400">{formatCurrency(radLaan)}</div>}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>


            {/* ====== RENTERS RENTE-EFFEKT ====== */}
            {(() => {
              const sluttverdi = verdiutvikling[verdiutvikling.length - 1]?.total || 0;
              const totalInnskutt = effektivtInvestertBelop + (nettoKontantstrom > 0 ? nettoKontantstrom * horisont : 0);
              const totalRentekostnad = aarligRentekostnad * horisont;
              const nettoKontantstromEtterRente = nettoKontantstrom - aarligRentekostnad;
              // Enkel avkastning = kapital × avkastning × antall år (uten compounding)
              const enkelAvkastning = effektivtInvestertBelop * (vektetAvkastning / 100) * horisont + nettoKontantstromEtterRente * (vektetAvkastning / 100) * ((horisont - 1) / 2) * horisont / horisont;
              // Compound: total avkastning = sluttverdi - investert - netto kontantstrøm over perioden
              const totalAvkastning = sluttverdi - effektivtInvestertBelop - (nettoKontantstromEtterRente * horisont);
              // Enkel lineær avkastning (uten rentes rente): hvert år får man avkastning bare på opprinnelig kapital
              const enkelLineaer = (() => {
                let enkel = effektivtInvestertBelop;
                for (let y = 1; y <= horisont; y++) {
                  enkel += effektivtInvestertBelop * (vektetAvkastning / 100) + nettoKontantstromEtterRente;
                }
                return enkel;
              })();
              const rentersRenteIsolert = sluttverdi - enkelLineaer;
              const rentersRentePct = effektivtInvestertBelop > 0 ? (rentersRenteIsolert / effektivtInvestertBelop * 100) : 0;
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Renters rente-effekt</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-xs text-blue-600 font-medium mb-1">Investert kapital</div>
                        <div className="text-lg font-bold text-blue-900">{formatCurrency(effektivtInvestertBelop)}</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-xs text-amber-600 font-medium mb-1">Enkel avkastning</div>
                        <div className="text-lg font-bold text-amber-900">{formatCurrency(enkelLineaer - effektivtInvestertBelop - nettoKontantstromEtterRente * horisont)}</div>
                        <div className="text-xs text-amber-500 mt-0.5">Uten renters rente</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="text-xs text-emerald-600 font-medium mb-1">Renters rente (isolert)</div>
                        <div className="text-lg font-bold text-emerald-900">{formatCurrency(rentersRenteIsolert)}</div>
                        <div className="text-xs text-emerald-500 mt-0.5">Compound-effekten alene</div>
                      </div>
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F8' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Sluttverdi</div>
                        <div className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(sluttverdi)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Etter {horisont} år</div>
                      </div>
                      {totalLaan > 0 && (
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="text-xs text-red-600 font-medium mb-1">Lånekostnad totalt</div>
                          <div className="text-lg font-bold text-red-900">{formatCurrency(totalRentekostnad)}</div>
                          <div className="text-xs text-red-500 mt-0.5">LTV: {formatPercent(effektivtInvestertBelop > 0 ? (totalLaan / effektivtInvestertBelop) * 100 : 0)}</div>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                      Med {formatPercent(vektetAvkastning)} årlig avkastning og renters rente gir <strong className="text-gray-700">{formatCurrency(effektivtInvestertBelop)}</strong> investert en sluttverdi på <strong style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(sluttverdi)}</strong>.
                      {' '}Av totalavkastningen på <strong className="text-gray-700">{formatCurrency(totalAvkastning)}</strong> er <strong className="text-emerald-700">{formatCurrency(rentersRenteIsolert)}</strong> ren compound-effekt — avkastning på tidligere års avkastning.
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ====== SCENARIO-PARAMETERE ====== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Scenario-parametere</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showPessimistic} onChange={(e) => setShowPessimistic(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-blue-200">Vis pessimistisk scenario</span>
                </label>
              </div>
              <div className="p-6">
                <div className={"grid gap-4 " + (showPessimistic ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                  {showPessimistic && (
                    <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider">Pessimistisk</div>
                        <div className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{formatPercent(scenarioParams.pessimistisk)} p.a.</div>
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold">Sluttverdi etter {horisont} år</div>
                      <div className="text-4xl font-bold text-red-700 mb-1 tabular-nums">{formatCurrency(scenarioData[scenarioData.length-1]?.pessimistisk || 0)}</div>
                      <input type="range" min="-10" max={vektetAvkastning} step="0.5" value={scenarioParams.pessimistisk}
                        onChange={(e) => setScenarioParams(p => ({...p, pessimistisk: parseFloat(e.target.value)}))}
                        className="w-full h-2 bg-red-200 rounded-lg cursor-pointer mt-3" />
                      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-red-100">
                        <div><div className="text-xs text-red-400">Gevinst/tap</div><div className="font-semibold text-red-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.pessimistisk||0) - effektivtInvestertBelop - fremskrivMedKontantstrom(effektivtInvestertBelop, scenarioParams.pessimistisk, horisont, nettoKontantstrom).nettoKontantstrom)}</div></div>
                        <div><div className="text-xs text-red-400">CAGR</div><div className="font-semibold text-red-700 text-sm">{formatPercent(scenarioParams.pessimistisk)}</div></div>
                      </div>
                    </div>
                  )}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#0D2240' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">Forventet</div>
                      <div className="text-xs font-semibold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full">{formatPercent(vektetAvkastning)} p.a.</div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">Sluttverdi etter {horisont} år</div>
                    <div className="text-4xl font-bold text-white mb-1 tabular-nums">{formatCurrency(scenarioData[scenarioData.length-1]?.forventet || 0)}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-blue-800">
                      <div><div className="text-xs text-blue-400">Gevinst/tap</div><div className="font-semibold text-white text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.forventet||0) - effektivtInvestertBelop - fremskrivMedKontantstrom(effektivtInvestertBelop, vektetAvkastning, horisont, nettoKontantstrom).nettoKontantstrom)}</div></div>
                      <div><div className="text-xs text-blue-400">CAGR</div><div className="font-semibold text-white text-sm">{formatPercent(vektetAvkastning)}</div></div>
                    </div>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-green-500 uppercase tracking-wider">Optimistisk</div>
                      <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{formatPercent(scenarioParams.optimistisk)} p.a.</div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-green-500 font-semibold">Sluttverdi etter {horisont} år</div>
                    <div className="text-4xl font-bold text-green-700 mb-1 tabular-nums">{formatCurrency(scenarioData[scenarioData.length-1]?.optimistisk || 0)}</div>
                    <input type="range" min={vektetAvkastning} max="25" step="0.5" value={scenarioParams.optimistisk}
                      onChange={(e) => setScenarioParams(p => ({...p, optimistisk: parseFloat(e.target.value)}))}
                      className="w-full h-2 rounded-lg cursor-pointer bg-green-200 mt-3" />
                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-green-100">
                      <div><div className="text-xs text-green-400">Gevinst/tap</div><div className="font-semibold text-green-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.optimistisk||0) - effektivtInvestertBelop - fremskrivMedKontantstrom(effektivtInvestertBelop, scenarioParams.optimistisk, horisont, nettoKontantstrom).nettoKontantstrom)}</div></div>
                      <div><div className="text-xs text-green-400">CAGR</div><div className="font-semibold text-green-700 text-sm">{formatPercent(scenarioParams.optimistisk)}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenariograf */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Scenarioanalyse — Verdiutvikling</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={scenarioData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v, name) => [formatCurrency(v), name === 'forventet' ? 'Forventet' : name === 'optimistisk' ? 'Optimistisk' : 'Pessimistisk']} />
                    <Legend iconType="circle" />
                    {showPessimistic && <Line type="monotone" dataKey="pessimistisk" name="Pessimistisk" stroke={PENSUM_COLORS.salmon} strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                    <Line type="monotone" dataKey="forventet" name="Forventet" stroke={PENSUM_COLORS.darkBlue} strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="optimistisk" name="Optimistisk" stroke={PENSUM_COLORS.teal} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    {showComparison && <Line type="monotone" dataKey="sammenligning" name={sammenligningProfil} stroke={PENSUM_COLORS.teal} strokeWidth={2} strokeDasharray="8 4" dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ====== KOSTNADSANALYSE ====== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all"
                style={{ backgroundColor: PENSUM_COLORS.salmon }}
                onClick={() => setKostnadsanalyseAktiv(!kostnadsanalyseAktiv)}>
                <h3 className="text-lg font-semibold text-white">Kostnadsanalyse — Hva koster det å ikke investere?</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#F5E6DF' }}>{kostnadsanalyseAktiv ? 'Skjul' : 'Vis'}</span>
                  <svg className={"w-5 h-5 text-white transition-transform " + (kostnadsanalyseAktiv ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {kostnadsanalyseAktiv && kostnadsanalyseData && (
                <div className="p-6 space-y-6">
                  {/* Parametre */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Skattepliktig formue</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumber(skattepliktigFormue)}
                        onChange={(e) => setSkattepliktigFormue(parseBelop(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Årlig forbruk (uttak)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumber(aarligForbruk)}
                        onChange={(e) => setAarligForbruk(parseBelop(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Inflasjon (%)</label>
                      <input type="number" step="0.1" value={inflasjon} onChange={(e) => setInflasjon(Number(e.target.value) || 0)} onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bankrente (%)</label>
                      <input type="number" step="0.1" value={renteAvkastning} onChange={(e) => setRenteAvkastning(Number(e.target.value) || 0)} onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300" />
                    </div>
                  </div>

                  {/* Nøkkeltall */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: '#FDF6F2', borderColor: '#E8CFC2' }}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PENSUM_COLORS.salmon }}>Årlig kostnad</div>
                      <div className="text-sm mb-2" style={{ color: '#B8917D' }}>Forbruk + formuesskatt</div>
                      <div className="text-2xl font-bold" style={{ color: '#8B6650' }}>{formatCurrency(kostnadsanalyseData.aarligKostnad)}</div>
                      <div className="mt-2 text-xs" style={{ color: '#B8917D' }}>
                        Forbruk: {formatCurrency(aarligForbruk)} | Formuesskatt: {formatCurrency(kostnadsanalyseData.aarligFormuesskatt)}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Break-even avkastning</div>
                      <div className="text-sm text-amber-400 mb-2">For å opprettholde realformue</div>
                      <div className="text-2xl font-bold text-amber-700">{formatPercent(kostnadsanalyseData.bruttoAksjePaakrevet * 100)} <span className="text-sm font-normal">brutto p.a.</span></div>
                      <div className="mt-2 text-xs text-amber-500">
                        Netto påkrevet: {formatPercent(kostnadsanalyseData.nettoAvkastningPaakrevet * 100)} | Portefølje: {formatPercent(vektetAvkastning)}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border-2" style={{ backgroundColor: '#0D2240', borderColor: PENSUM_COLORS.darkBlue }}>
                      <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Bankkonto etter {horisont} år</div>
                      <div className="text-sm text-blue-400 mb-2">Kun rente ({formatPercent(renteAvkastning)}, netto {formatPercent(kostnadsanalyseData.nettoRente)})</div>
                      <div className="text-2xl font-bold text-white">{formatCurrency(kostnadsanalyseData.bankSerie[kostnadsanalyseData.bankSerie.length - 1]?.bankFormue || 0)}</div>
                      <div className="mt-2 text-xs text-blue-400">
                        Tapt kjøpekraft: {formatCurrency(effektivtInvestertBelop - (kostnadsanalyseData.bankSerie[kostnadsanalyseData.bankSerie.length - 1]?.bankFormue || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Sammenligning: Bank vs Investert */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Realformue over tid — Bankkonto vs. Investert portefølje</h4>
                    <ResponsiveContainer width="100%" height={380}>
                      <ComposedChart
                        data={kostnadsanalyseData.bankSerie.map((b, i) => ({
                          ...b,
                          investert: scenarioData[i]?.forventet || 0,
                        }))}
                        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={100} />
                        <Tooltip formatter={(v, name) => [formatCurrency(v), name === 'bankFormue' ? 'Bankkonto (real)' : 'Investert portefølje']} />
                        <Legend iconType="circle" />
                        <Area type="monotone" dataKey="investert" name="Investert portefølje" fill={PENSUM_COLORS.darkBlue} fillOpacity={0.08} stroke={PENSUM_COLORS.darkBlue} strokeWidth={3} dot={false} />
                        <Area type="monotone" dataKey="bankFormue" name="Bankkonto (real)" fill={PENSUM_COLORS.salmon} fillOpacity={0.08} stroke={PENSUM_COLORS.salmon} strokeWidth={2} strokeDasharray="6 3" dot={false} />
                        <ReferenceLine y={effektivtInvestertBelop} stroke="#9CA3AF" strokeDasharray="3 3" label={{ value: 'Startkapital', position: 'right', fill: '#9CA3AF', fontSize: 11 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Oppsummering */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Oppsummering:</strong> Med et årlig forbruk på {formatCurrency(aarligForbruk)} og formuesskatt på {formatCurrency(kostnadsanalyseData.aarligFormuesskatt)},
                      {' '}vil en bankkonto med {formatPercent(renteAvkastning)} rente gi en realformue på{' '}
                      <strong>{formatCurrency(kostnadsanalyseData.bankSerie[kostnadsanalyseData.bankSerie.length - 1]?.bankFormue || 0)}</strong> etter {horisont} år.
                      {' '}Til sammenligning gir den forventede porteføljen <strong>{formatCurrency(scenarioData[scenarioData.length - 1]?.forventet || 0)}</strong>.
                      {' '}Du trenger minst <strong>{formatPercent(kostnadsanalyseData.bruttoAksjePaakrevet * 100)}</strong> brutto årlig avkastning for å opprettholde realformuen.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
        )}


        {activeTab === 'losninger' && (
          <div className="space-y-6 no-print">
            {/* Snarveier til de tre gruppene i byggeren */}
            <div className="flex flex-wrap items-center gap-2" data-byggernav>
              {PB_GRUPPER.map(g => (
                <button key={g.id} onClick={() => { setPbGrupper(prev => ({ ...prev, [g.id]: true })); setTimeout(() => document.getElementById('pb-gruppe-' + g.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">{g.tittel}</button>
              ))}
              <button onClick={() => { const alleAapne = PB_GRUPPER.every(g => pbGrupper[g.id]); setPbGrupper(Object.fromEntries(PB_GRUPPER.map(g => [g.id, !alleAapne]))); }}
                className="ml-auto text-xs text-gray-500 underline hover:text-gray-700">{PB_GRUPPER.every(g => pbGrupper[g.id]) ? 'Fold sammen alle' : 'Åpne alle'}</button>
            </div>

            {pbGruppeHode('portefolje', 'Portefølje', 'Sammensetning, fordeling og eksponering')}
            {pbGrupper.portefolje && (
            <div className="space-y-6">
            {/* Header med standardporteføljer og innstillinger */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Pensum Porteføljesammensetning</h3>
                  <div className="flex items-center gap-4">
                    {/* Innstillinger */}
                    <div className="flex items-center gap-4 pr-4 border-r border-blue-400">
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={visAlternative} onChange={(e) => setVisAlternative(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Alternative investeringer</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer" title="Legg inn investeringer kunden har utenfor Pensum, så de kommer med i prognosen og totaloversikten">
                        <input type="checkbox" checked={tilleggAktiv} onChange={(e) => { setTilleggAktiv(e.target.checked); if (e.target.checked) setTimeout(() => document.getElementById('tilleggspanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80); }} className="w-4 h-4 rounded" data-tillegg-bryter />
                        <span>Kundens øvrige investeringer</span>
                      </label>
                    </div>
                    {/* Standardporteføljer */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-200">Standardportefølje:</span>
                      {Object.keys(pensumStandardPortefoljer).map(profil => (
                        <button key={profil} onClick={() => velgPensumStandardPortefolje(profil)} className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (valgtPensumProfil === profil && !valgtStandardLosning ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}>
                          {profil}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Definerte porteføljer (fra Pensum-skissen) */}
                <div className="mt-3 pt-3 border-t border-blue-700 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-blue-200">Definerte porteføljer:</span>
                  <select
                    value={valgtStandardLosning || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) velgDefinertPortefolje(v, valgtAllokering);
                      else setValgtStandardLosning(null);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-blue-800 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">— Velg portefølje —</option>
                    {Object.keys(defaultPensumStandardLosninger).map(navn => (
                      <option key={navn} value={navn}>{navn}</option>
                    ))}
                  </select>
                  {valgtStandardLosning && (
                    <>
                      <span className="text-sm text-blue-200">Allokering:</span>
                      <div className="flex items-center gap-1">
                        {Object.keys(defaultPensumStandardLosninger[valgtStandardLosning].allokeringer).map(allokNavn => (
                          <button
                            key={allokNavn}
                            onClick={() => velgDefinertPortefolje(valgtStandardLosning, allokNavn)}
                            className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (valgtAllokering === allokNavn ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}
                          >
                            {allokNavn.replace('Allokering ', '')}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-blue-300 italic flex-1">{defaultPensumStandardLosninger[valgtStandardLosning].beskrivelse}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Venstre: Allokering */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center justify-between" style={{ color: PENSUM_COLORS.darkBlue }}>
                      <span>Pensum-forslaget</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-500">Beløp:</span>
                          <input
                            type="text"
                            value={investertBelop !== null ? formatNumber(investertBelop) : formatNumber(totalKapital)}
                            onChange={(e) => {
                              const value = parseBelop(e.target.value) || 0;
                              setInvestertBelop(value);
                            }}
                            className="border border-gray-200 rounded py-1 px-2 w-28 text-right text-xs"
                          />
                          <span className="text-gray-400">kr</span>
                          {investertBelop !== null && (
                            <button onClick={() => setInvestertBelop(null)} className="text-blue-600 hover:text-blue-800 underline" title="Tilbakestill til kundeinformasjon">↺</button>
                          )}
                        </div>
                        <label className="text-xs px-2 py-1 rounded-full border border-blue-200 text-blue-700 flex items-center gap-1.5">
                          <input type="checkbox" checked={autoRebalanserPensum} onChange={(e) => setAutoRebalanserPensum(e.target.checked)} className="w-3.5 h-3.5" />
                          Auto 100%
                        </label>
                        <button onClick={normaliserPensumTil100} className="text-xs px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50">
                          Juster til 100%
                        </button>
                        <label className={"text-xs px-2 py-1 rounded-full border flex items-center gap-1.5 cursor-pointer " + (pensumBelopModus ? "border-blue-400 bg-blue-50 text-blue-800" : "border-blue-200 text-blue-700")}>
                          <input type="checkbox" checked={pensumBelopModus} onChange={(e) => setPensumBelopModus(e.target.checked)} className="w-3.5 h-3.5" />
                          Rediger beløp
                        </label>
                        {pensumLikviditet.illikvid > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            {pst(pensumLikviditet.illikvid)} % illikvid
                          </span>
                        )}
                        <span className={"text-sm px-3 py-1 rounded-full " + (Math.abs(pensumTotalVekt - 100) < 0.2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          Total: {pensumTotalVekt.toFixed(1).replace('.', ',')} %
                        </span>
                      </div>
                    </h4>
                    
                    {/* Valgte produkter */}
                    <div className="space-y-2 mb-6">
                      {pensumAllokering.map(produkt => {
                        const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                        const produktInfo = alleProdukt.find(p => p.id === produkt.id);
                        const erIllikvid = produktInfo?.likviditet === 'illikvid';
                        const harEksponering = produktEksponering[produkt.id];
                        const beskr = produktBeskrivelser?.[produkt.id];
                        // Rolle-fargene matcher byggverket (Kjerne=mørkeblå, Stabilisator=salmon, Spisset=gull),
                        // men med rene, klart distinkte pastell-bakgrunner som ikke gjør stab og spisset like.
                        let rolleStripe = '#9CA3AF';
                        let rolleBgFarge = '#F8FAFC'; // default lett grå
                        let bruktRolle = false;
                        if (erIllikvid) {
                          rolleStripe = PENSUM_COLORS.gold;
                          rolleBgFarge = '#FFFBEB'; // amber-50, varm krem
                          bruktRolle = true;
                        } else if (produktInfo?.aktivatype === 'rente' || produktInfo?.aktivatype === 'dynamisk' || produktInfo?.aktivatype === 'blandet') {
                          rolleStripe = PENSUM_COLORS.salmon;
                          rolleBgFarge = '#FFF1F2'; // rose-50, lett rosa
                          bruktRolle = true;
                        } else if (produktInfo?.rolle === 'spisset') {
                          rolleStripe = PENSUM_COLORS.gold;
                          rolleBgFarge = '#FEF9C3'; // yellow-100, lett gul — tydelig forskjellig fra salmon-rosa
                          bruktRolle = true;
                        } else if (produktInfo?.rolle === 'kjerne') {
                          rolleStripe = PENSUM_COLORS.darkBlue;
                          rolleBgFarge = '#EFF6FF'; // blue-50, lett blå
                          bruktRolle = true;
                        }
                        const rolleBg = bruktRolle ? '' : 'bg-gray-50/80 border border-gray-100 hover:bg-gray-100/50';
                        const rolleStyle = bruktRolle ? { backgroundColor: rolleBgFarge, borderTop: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', borderLeftWidth: '6px', borderLeftStyle: 'solid', borderLeftColor: rolleStripe } : undefined;
                        const tooltipTekst = beskr ? `${beskr.rolle} — ${beskr.kategoriBeskrivelse}\n\n${beskr.beskrivelse}` : null;
                        return (
                          <div key={produkt.id} className={"flex items-center gap-3 p-3 rounded-xl transition-colors " + rolleBg} style={rolleStyle}>
                            <button onClick={() => fjernPensumProdukt(produkt.id)} className="text-red-500 hover:text-red-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="flex-1">
                              <p className="font-medium text-sm flex items-center gap-2" style={{ color: PENSUM_COLORS.darkBlue }}>
                                <button
                                  onClick={() => setValgtProduktDetalj(produktInfo)}
                                  className={"hover:underline " + (harEksponering ? "cursor-pointer" : "")}
                                  title={harEksponering ? "Klikk for å se detaljer" : ""}
                                >
                                  {produkt.navn}
                                </button>
                                {tooltipTekst && (
                                  <span className="relative group inline-flex items-center">
                                    <svg className="w-4 h-4 text-blue-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => harEksponering && setValgtProduktDetalj(produktInfo)}>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="invisible group-hover:visible absolute left-0 top-full mt-1 z-50 w-72 p-3 rounded-lg shadow-lg bg-white border border-gray-200" style={{ pointerEvents: 'none' }}>
                                      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: rolleStripe }}>{beskr.rolle} · {beskr.kategoriBeskrivelse}</div>
                                      <div className="text-xs text-gray-700 leading-relaxed">{beskr.beskrivelse}</div>
                                      {erGyldigTall(produktInfo?.forventetAvkastning) && (
                                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                          Forv. avkastning: <strong style={{ color: PENSUM_COLORS.green }}>{pst(produktInfo.forventetAvkastning)} %</strong>
                                          {erGyldigTall(produktInfo?.forventetYield) && <> · Yield: <strong style={{ color: PENSUM_COLORS.teal }}>{pst(produktInfo.forventetYield)} %</strong></>}
                                          {erGyldigTall(produktInfo?.forventetRisiko) && <> · Vol: <strong>{pst(produktInfo.forventetRisiko)} %</strong></>}
                                        </div>
                                      )}
                                    </div>
                                  </span>
                                )}
                                {erIllikvid && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Illikvid</span>}
                              </p>
                              <p className="text-xs text-gray-500">{produkt.kategori === 'enkeltfond' ? (pensumProdukter.enkeltfond.find(p => p.id === produkt.id)?.mandat ? 'Aksjemandat' : 'Enkeltfond') : produkt.kategori === 'alternative' ? 'Alternativ investering' : produkt.kategori === 'eksterneFond' ? 'Eksternt fond' : produkt.kategori === 'kontanter' ? (produkt.id === 'gull' ? 'Gull' : 'Kontanter og pengemarked') : 'Fondsportefølje'}{(() => { const v = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative].find(p => p.id === produkt.id)?.valuta; return v && v !== 'NOK' ? ` · ${v}` : ''; })()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {pensumBelopModus ? (() => {
                                const basis = investertBelop !== null ? investertBelop : totalKapital;
                                const radBelop = typeof produkt.belop === 'number' ? produkt.belop : Math.round(((produkt.vekt || 0) / 100) * basis);
                                return (
                                  <>
                                    <div className="flex items-center bg-white border border-blue-200 rounded overflow-hidden focus-within:border-blue-400" style={{ width: '130px' }}>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        key={radBelop}
                                        defaultValue={formatNumber(radBelop)}
                                        onBlur={(e) => oppdaterPensumBelop(produkt.id, parseBelop(e.target.value) || 0)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                        className="w-full py-1 px-2 text-sm text-right outline-none tabular-nums"
                                      />
                                      <span className="text-xs text-gray-400 pr-1.5">kr</span>
                                    </div>
                                    <span className="text-xs text-gray-400 tabular-nums w-12 text-right">{(produkt.vekt || 0).toFixed(1).replace('.', ',')} %</span>
                                  </>
                                );
                              })() : (
                                <>
                                  <button onClick={() => oppdaterPensumVekt(produkt.id, (produkt.vekt || 0) - 0.5)} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-100">−</button>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={pensumDragVekter[produkt.id] ?? produkt.vekt}
                                    onChange={(e) => startPensumDrag(produkt.id, parseFloat(e.target.value) || 0)}
                                    onMouseUp={() => commitPensumDrag(produkt.id)}
                                    onTouchEnd={() => commitPensumDrag(produkt.id)}
                                    className="w-36 accent-blue-700"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={pensumDragVekter[produkt.id] ?? produkt.vekt}
                                    onChange={(e) => startPensumDrag(produkt.id, parseFloat(e.target.value) || 0)}
                                    onBlur={() => commitPensumDrag(produkt.id)}
                                    className="w-20 border border-gray-200 rounded py-1 px-2 text-sm text-right"
                                  />
                                  <span className="text-sm text-gray-500">%</span>
                                  <button onClick={() => oppdaterPensumVekt(produkt.id, (produkt.vekt || 0) + 0.5)} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-100">+</button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legg til produkter */}
                    <div className="border-t border-gray-200 pt-5 mt-2">
                      <h5 className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: '#94A3B8' }}>Legg til produkt</h5>
                      <div className={"grid gap-4 " + (visAlternative ? "grid-cols-4" : "grid-cols-3")}>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">ENKELTFOND</p>
                          <div className="space-y-1">
                            {pensumProdukter.enkeltfond.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'enkeltfond')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-start justify-between gap-2">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">FONDSPORTEFØLJER</p>
                          <div className="space-y-1">
                            {pensumProdukter.fondsportefoljer.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'fondsportefoljer')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-start justify-between gap-2">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">KONTANTER, PENGEMARKED OG GULL</p>
                          <div className="space-y-1">
                            {(pensumProdukter.eksterneFond || []).filter(p => p.gruppe === 'kontanter' && !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'kontanter')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-50 border border-gray-200 flex items-start justify-between gap-2" title={`Forventet avkastning ${pst(produkt.forventetAvkastning)} % og volatilitet ${pst(produkt.forventetRisiko)} %`}>
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-teal-700 mb-2">EKSTERNE FOND</p>
                          {(() => {
                            const tilgjengelige = (pensumProdukter.eksterneFond || []).filter(p => p.gruppe !== 'kontanter' && !pensumAllokering.find(a => a.id === p.id));
                            const sok = eksterneFondSok.trim().toLowerCase();
                            const filtrerte = sok ? tilgjengelige.filter(p => p.navn.toLowerCase().includes(sok)) : tilgjengelige;
                            // Treff i hele Morningstar-universet (lastes ved første søk)
                            const msTreff = sok.length >= 2 && eksterneFond
                              ? sokEksterneFondFuzzy(eksterneFondSok, 8).filter(f => !pensumAllokering.some(a => a.id === `ms-${f.isin}`))
                              : [];
                            return (
                              <>
                                <div className="relative mb-2">
                                  <svg className="w-3.5 h-3.5 text-teal-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                  <input
                                    type="text"
                                    value={eksterneFondSok}
                                    onChange={(e) => { setEksterneFondSok(e.target.value); if (e.target.value.trim().length >= 2) lastEksterneFond(); }}
                                    placeholder="Søk på fondsnavn eller ISIN…"
                                    className="w-full border border-teal-200 rounded py-1.5 pl-8 pr-7 text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-300"
                                  />
                                  {eksterneFondSok && (
                                    <button onClick={() => setEksterneFondSok('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Tøm søk">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
                                  {filtrerte.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic px-1 py-2">{sok ? 'Ingen treff' : 'Alle fond er lagt til'}</p>
                                  ) : filtrerte.map(produkt => (
                                    <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'eksterneFond')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-teal-50 border border-teal-200 flex items-start justify-between gap-2">
                                      <span>{produkt.navn}</span>
                                      <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-teal-700 mt-2 italic">{sok ? `${filtrerte.length} av ${tilgjengelige.length} på fondsfokuslisten` : 'Fond fra fondsfokuslisten – søk for å finne flere'}</p>
                                {sok.length >= 2 && (
                                  <div className="mt-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Fra Morningstar ({eksterneFond ? `${eksterneFond.length.toLocaleString('nb-NO')} fond` : 'laster…'})</p>
                                    <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
                                      {eksterneFondLoading && !eksterneFond ? (
                                        <p className="text-xs text-gray-400 italic px-1 py-2">Laster fondsdata…</p>
                                      ) : msTreff.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic px-1 py-2">Ingen treff</p>
                                      ) : msTreff.map(f => (
                                        <button key={f.isin} onClick={() => leggTilMorningstarFond(f)} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-teal-50 border border-gray-200 flex items-start justify-between gap-2" title={`${f.isin} – forventet avkastning settes til CMA-anslag for ${CMA_KLASSER[cmaKlasseForMorningstarFond(f)].navn.toLowerCase()}`}>
                                          <span className="min-w-0">
                                            <span className="block">{f.n}</span>
                                            <span className="block text-[11px] text-gray-400">{f.cat || 'Ukjent kategori'} · {lagProduktFraMorningstar(f).produkt.valuta || '–'}{erGyldigTall(f.r3y) ? ` · 3 år ${pst(f.r3y.toFixed(1))} % p.a.` : ''}</span>
                                          </span>
                                          <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Morningstar-data per {MORNINGSTAR_DATO}. Forventet avkastning og risiko settes til CMA-anslag for fondets aktivaklasse.</p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {visAlternative && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 mb-2">ALTERNATIVE INVESTERINGER</p>
                            <div className="space-y-1">
                              {pensumProdukter.alternative.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                                <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'alternative')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-amber-50 border border-amber-200 flex items-start justify-between gap-2">
                                  <span>{produkt.navn}</span>
                                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 mt-2 italic">Alle alternative investeringer er illikvide</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Høyre: Kakediagrammer */}
                  <div className="space-y-8">
                    {/* Porteføljefordeling */}
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                      <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljefordeling</h4>
                      <div className="flex items-center gap-6">
                        <div className="shrink-0">
                          <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                              <Pie data={pensumAllokering.filter(p => p.vekt > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="vekt" paddingAngle={2} cornerRadius={4}
                                onMouseEnter={(d) => setKakeHover({ kake: 'produkt', id: d?.id ?? d?.payload?.id })} onMouseLeave={() => setKakeHover(null)}>
                                {pensumAllokering.filter(p => p.vekt > 0).map((entry, idx) => (
                                  <Cell key={entry.id} fill={PORTEFOLJE_FARGER[idx % PORTEFOLJE_FARGER.length]}
                                    opacity={kakeHover?.kake === 'produkt' && kakeHover.id !== entry.id ? 0.25 : 1} style={{ transition: 'opacity 150ms' }} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => pst(v) + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* min-w-0 og fast bredde på prosentkolonnen gjør at prosentene alltid vises,
                            også med mange produkter; lange navn kuttes i stedet. */}
                        <div className={"flex-1 min-w-0 " + (pensumAllokering.filter(p => p.vekt > 0).length > 8 ? 'space-y-1' : 'space-y-2')}>
                          {pensumAllokering.filter(p => p.vekt > 0).map((p, idx) => (
                            <div key={p.id} onMouseEnter={() => setKakeHover({ kake: 'produkt', id: p.id })} onMouseLeave={() => setKakeHover(null)}
                              className={"flex items-center gap-2.5 cursor-default transition-opacity " + (kakeHover?.kake === 'produkt' && kakeHover.id !== p.id ? 'opacity-40 ' : '') + (pensumAllokering.filter(q => q.vekt > 0).length > 8 ? 'text-xs' : 'text-sm')}>
                              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: PORTEFOLJE_FARGER[idx % PORTEFOLJE_FARGER.length] }}></div>
                              <span className="flex-1 min-w-0 truncate text-gray-700" title={p.navn}>{p.navn}</span>
                              <span className="font-semibold tabular-nums flex-shrink-0 w-14 text-right whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(p.vekt)} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Aktivafordeling */}
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                      <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivafordeling</h4>
                      <div className="flex items-center gap-6">
                        <div className="shrink-0">
                          <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                              <Pie data={pensumAktivafordeling.filter(p => p.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2} cornerRadius={4}
                                onMouseEnter={(d) => setKakeHover({ kake: 'aktiva', id: d?.name ?? d?.payload?.name })} onMouseLeave={() => setKakeHover(null)}>
                                {pensumAktivafordeling.filter(p => p.value > 0).map((entry) => (
                                  <Cell key={entry.name} fill={entry.color}
                                    opacity={kakeHover?.kake === 'aktiva' && kakeHover.id !== entry.name ? 0.25 : 1} style={{ transition: 'opacity 150ms' }} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => pst(v) + ' %'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2.5 flex-1">
                          {pensumAktivafordeling.filter(a => a.value > 0).map(a => (
                            <div key={a.name} onMouseEnter={() => setKakeHover({ kake: 'aktiva', id: a.name })} onMouseLeave={() => setKakeHover(null)}
                              className={"flex items-center gap-2.5 text-sm cursor-default transition-opacity " + (kakeHover?.kake === 'aktiva' && kakeHover.id !== a.name ? 'opacity-40' : '')}>
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }}></div>
                              <span className="flex-1 text-gray-700">{a.name}</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(a.value)} %</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Likviditet: én linje nederst i kortet, med stolpe bare når noe er illikvid */}
                      {(pensumLikviditet.likvid + pensumLikviditet.illikvid) > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100" data-likviditet>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold uppercase tracking-wider text-gray-400">Likviditet</span>
                            <span className="text-gray-600 tabular-nums">
                              {pensumLikviditet.illikvid > 0
                                ? <>{pst(Number((pensumLikviditet.likvid / (pensumLikviditet.likvid + pensumLikviditet.illikvid) * 100).toFixed(1)))} % daglig likvid · <span style={{ color: PENSUM_COLORS.gold }} className="font-semibold">{pst(Number((pensumLikviditet.illikvid / (pensumLikviditet.likvid + pensumLikviditet.illikvid) * 100).toFixed(1)))} % illikvid</span></>
                                : 'Hele porteføljen er daglig likvid'}
                            </span>
                          </div>
                          {pensumLikviditet.illikvid > 0 && (
                            <div className="mt-2 h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: '#E2E8F0' }}>
                              <div style={{ width: (pensumLikviditet.likvid / (pensumLikviditet.likvid + pensumLikviditet.illikvid)) * 100 + '%', backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                              <div className="flex-1" style={{ backgroundColor: PENSUM_COLORS.gold }}></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Eksponeringsroller — byggesett som klassisk byggverk (tak/midt/grunnmur) */}
                    {(() => {
                      const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                      let kjerneSum = 0, stabSum = 0, spissetSum = 0;
                      const kjerneNavn = [], stabNavn = [], spissetNavn = [];
                      pensumAllokering.forEach(a => {
                        if (a.vekt <= 0) return;
                        const p = alleProd.find(pp => pp.id === a.id);
                        if (!p) return;
                        if (p.aktivatype === 'blandet' || p.aktivatype === 'dynamisk') {
                          kjerneSum += a.vekt * 0.5;
                          stabSum += a.vekt * 0.5;
                          kjerneNavn.push(`${p.navn} (50% aksjedel)`);
                          stabNavn.push(`${p.navn} (50% rentedel)`);
                        } else if (p.aktivatype === 'rente' || p.aktivatype === 'kontanter') {
                          stabSum += a.vekt;
                          stabNavn.push(p.navn);
                        } else if (p.rolle === 'spisset' || p.aktivatype === 'alternativ') {
                          spissetSum += a.vekt;
                          spissetNavn.push(p.navn);
                        } else {
                          kjerneSum += a.vekt;
                          kjerneNavn.push(p.navn);
                        }
                      });
                      const total = kjerneSum + stabSum + spissetSum;
                      if (total === 0) return null;

                      // Beregn høyder (proporsjonale med min-floor for synlighet)
                      const totalH = 240;
                      const minSection = 36;
                      const aktive = [
                        { key: 'kjerne', verdi: kjerneSum, items: kjerneNavn },
                        { key: 'stab', verdi: stabSum, items: stabNavn },
                        { key: 'spisset', verdi: spissetSum, items: spissetNavn }
                      ].filter(b => b.verdi > 0);
                      const tilgjengelig = totalH - aktive.length * minSection;
                      const hoyder = {};
                      aktive.forEach(b => {
                        hoyder[b.key] = minSection + (b.verdi / total) * tilgjengelig;
                      });

                      // Klassisk byggverk-proporsjoner: bred grunnmur, smalere midt-etasje, bredt saltak
                      const svgWidth = 220;
                      const stabW = 170;       // midt (stabilisator) bredde — selve "huset"
                      const baseW = 200;       // grunnmur/pedestal — bredere enn huset
                      const baseInnerW = 184;  // pedestalens øvre del (litt smalere enn ytterkant)
                      const taklednW = 200;    // saltakets bredde nederst — bredere enn huset for overhang
                      const cx = svgWidth / 2;

                      const kjerneH = hoyder.kjerne || 0;
                      const stabH = hoyder.stab || 0;
                      const spissetH = hoyder.spisset || 0;
                      const ledgeH = 7; // tynn avsats mellom etasjene
                      const baseLip = 5; // pedestalens øvre kant-lipp
                      const baseFoot = 4; // pedestalens nedre fotlist

                      // y-koordinater (fra topp av SVG)
                      const yKjerneTop = totalH - kjerneH;
                      const yKjerneLedge = yKjerneTop - ledgeH;
                      const yStabBot = yKjerneLedge;
                      const yStabTop = yStabBot - stabH;
                      const yStabLedge = yStabTop - ledgeH;
                      const yRoofBase = yStabLedge;
                      const yRoofPeak = yRoofBase - spissetH;

                      const tooltipFor = (key) => {
                        if (key === 'kjerne') return `Kjerne: ${kjerneSum.toFixed(1).replace('.', ',')} %\n${kjerneNavn.join(', ')}`;
                        if (key === 'stab') return `Stabilisator: ${stabSum.toFixed(1).replace('.', ',')} %\n${stabNavn.join(', ')}`;
                        return `Spisset: ${spissetSum.toFixed(1).replace('.', ',')} %\n${spissetNavn.join(', ')}`;
                      };

                      const fraTopp = [
                        { navn: 'Spisset', kort: 'SPISSET', verdi: spissetSum, farge: PENSUM_COLORS.gold, beskr: 'Målrettet sektor-, tema- eller regionseksponering for meravkastning',
                          ikon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.8} /><circle cx="12" cy="12" r="5.5" strokeWidth={1.8} /><circle cx="12" cy="12" r="2" strokeWidth={1.8} fill="currentColor" /></svg> },
                        { navn: 'Stabilisator', kort: 'STABILISATOR', verdi: stabSum, farge: PENSUM_COLORS.salmon, beskr: 'Renter for løpende avkastning og lavere svingninger',
                          ikon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
                        { navn: 'Kjerne', kort: 'KJERNE', verdi: kjerneSum, farge: PENSUM_COLORS.darkBlue, beskr: 'Bred kvalitetseksponering — langsiktig grunnmur',
                          ikon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21V8l3-2 3 2v13M3 21h18M9 21V3l3-2 3 2v18M15 21V9l3-2 3 2v12" /></svg> }
                      ].filter(b => b.verdi > 0);

                      // Tekst-størrelse adaptiv for hver seksjon
                      const tekstFor = (h) => {
                        if (h >= 70) return { pct: 22, label: 10 };
                        if (h >= 48) return { pct: 18, label: 9 };
                        if (h >= 36) return { pct: 14, label: 8 };
                        return { pct: 11, label: 7 };
                      };

                      return (
                        <div className="rounded-xl border border-gray-100 bg-white p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-5 w-1 rounded" style={{ backgroundColor: PENSUM_COLORS.gold }}></div>
                            <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Eksponeringsroller — byggesett</h4>
                          </div>
                          <div className="flex items-start gap-4">
                            {/* SVG-byggverk */}
                            <div className="shrink-0 mx-auto">
                              <svg width={svgWidth} height={totalH} viewBox={`0 0 ${svgWidth} ${totalH}`} style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}>
                                {/* Kjerne — pedestal/grunnmur med fotlist */}
                                {kjerneH > 0 && <>
                                  {/* Pedestalens hoveddel */}
                                  <rect x={cx - baseW / 2} y={yKjerneTop + baseLip} width={baseW} height={kjerneH - baseLip - baseFoot} fill={PENSUM_COLORS.darkBlue} />
                                  {/* Fotlist på bunnen — litt bredere overhang */}
                                  <rect x={cx - (baseW + 6) / 2} y={yKjerneTop + kjerneH - baseFoot} width={baseW + 6} height={baseFoot} fill={PENSUM_COLORS.darkBlue} />
                                  {/* Topplate på pedestalen — litt bredere */}
                                  <rect x={cx - (baseW + 6) / 2} y={yKjerneTop} width={baseW + 6} height={baseLip} fill={PENSUM_COLORS.darkBlue} />
                                  {/* Hvit avsats mellom pedestal og hus */}
                                  <rect x={cx - baseInnerW / 2} y={yKjerneLedge} width={baseInnerW} height={ledgeH} fill="#FFFFFF" />
                                  <line x1={cx - baseInnerW / 2} y1={yKjerneLedge + ledgeH} x2={cx + baseInnerW / 2} y2={yKjerneLedge + ledgeH} stroke="#D1D5DB" strokeWidth={0.5} />
                                </>}
                                {/* Tekst kjerne */}
                                {kjerneH > 0 && (() => {
                                  const t = tekstFor(kjerneH);
                                  const yMidt = yKjerneTop + (kjerneH - baseFoot) / 2 + baseLip / 2;
                                  return <g pointerEvents="none">
                                    <text x={cx} y={yMidt - (kjerneH >= 48 ? 2 : 4)} textAnchor="middle" fill="white" fontSize={t.pct} fontWeight="800" style={{ letterSpacing: '-0.5px' }}>{kjerneSum.toFixed(0).replace('.', ',')} %</text>
                                    {kjerneH >= 48 && <text x={cx} y={yMidt + 13} textAnchor="middle" fill="white" fontSize={t.label} fontWeight="700" style={{ letterSpacing: '1.5px' }}>KJERNE</text>}
                                  </g>;
                                })()}
                                {/* Stabilisator — selve "huset" med arkede vinduer */}
                                {stabH > 0 && <>
                                  <rect x={cx - stabW / 2} y={yStabTop} width={stabW} height={stabH} fill={PENSUM_COLORS.salmon} />
                                  {/* Arkede vinduer på sidene (kun hvis tilstrekkelig høyde) */}
                                  {stabH >= 60 && <>
                                    {(() => {
                                      const winW = 18;
                                      const winH = Math.min(stabH * 0.45, 50);
                                      const winY = yStabTop + (stabH - winH) / 2;
                                      const leftX = cx - stabW / 2 + 22;
                                      const rightX = cx + stabW / 2 - 22 - winW;
                                      // Arket vindu = rektangel med halvsirkel på toppen
                                      return [leftX, rightX].map((wx, i) => (
                                        <g key={i}>
                                          <path
                                            d={`M ${wx},${winY + winW/2} Q ${wx},${winY} ${wx + winW/2},${winY} Q ${wx + winW},${winY} ${wx + winW},${winY + winW/2} L ${wx + winW},${winY + winH} L ${wx},${winY + winH} Z`}
                                            fill="rgba(255,255,255,0.22)"
                                          />
                                          <line x1={wx + winW/2} y1={winY + winW/2 - 2} x2={wx + winW/2} y2={winY + winH} stroke="rgba(255,255,255,0.30)" strokeWidth={1} />
                                        </g>
                                      ));
                                    })()}
                                  </>}
                                  {/* Hvit avsats/gesims mellom hus og tak */}
                                  <rect x={cx - (stabW + 12) / 2} y={yStabLedge} width={stabW + 12} height={ledgeH} fill="#FFFFFF" />
                                  <line x1={cx - (stabW + 12) / 2} y1={yStabLedge + ledgeH} x2={cx + (stabW + 12) / 2} y2={yStabLedge + ledgeH} stroke="#D1D5DB" strokeWidth={0.5} />
                                </>}
                                {/* Tekst stabilisator (mellom vinduene) */}
                                {stabH > 0 && (() => {
                                  const t = tekstFor(stabH);
                                  const yMidt = yStabTop + stabH / 2;
                                  return <g pointerEvents="none">
                                    <text x={cx} y={yMidt - (stabH >= 48 ? 2 : 4)} textAnchor="middle" fill="white" fontSize={t.pct} fontWeight="800" style={{ letterSpacing: '-0.5px' }}>{stabSum.toFixed(0).replace('.', ',')} %</text>
                                    {stabH >= 48 && <text x={cx} y={yMidt + 13} textAnchor="middle" fill="white" fontSize={t.label} fontWeight="700" style={{ letterSpacing: '1.5px' }}>STABILISATOR</text>}
                                  </g>;
                                })()}
                                {/* Spisset — saltak med svak overhang */}
                                {spissetH > 0 && <>
                                  <polygon
                                    points={`${cx - taklednW / 2},${yRoofBase} ${cx},${yRoofPeak} ${cx + taklednW / 2},${yRoofBase}`}
                                    fill={PENSUM_COLORS.gold}
                                  />
                                </>}
                                {/* Tekst spisset (sentrert i taket) */}
                                {spissetH > 0 && (() => {
                                  const t = tekstFor(spissetH);
                                  // Plassér tekst slik at den ligger godt sentrert i den synlige delen av taket
                                  const yTekst = yRoofBase - spissetH * 0.40;
                                  return <g pointerEvents="none">
                                    <text x={cx} y={yTekst - (spissetH >= 40 ? 1 : 3)} textAnchor="middle" fill="white" fontSize={t.pct} fontWeight="800" style={{ letterSpacing: '-0.5px' }}>{spissetSum.toFixed(0).replace('.', ',')} %</text>
                                    {spissetH >= 40 && <text x={cx} y={yTekst + 11} textAnchor="middle" fill="white" fontSize={t.label} fontWeight="700" style={{ letterSpacing: '1.5px' }}>SPISSET</text>}
                                  </g>;
                                })()}
                              </svg>
                            </div>
                            {/* Beskrivelser-liste — øverst spisset, nederst kjerne */}
                            <div className="flex-1 min-w-0 space-y-2.5 py-1">
                              {fraTopp.map((b, idx) => (
                                <div key={b.navn}>
                                  <div className="flex items-start gap-2">
                                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border" style={{ borderColor: b.farge + '40', color: b.farge, backgroundColor: b.farge + '15' }}>
                                      {b.ikon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-[11px] tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>{b.kort}</span>
                                        <span className="font-bold text-sm tabular-nums" style={{ color: b.farge }}>{b.verdi.toFixed(0).replace('.', ',')} %</span>
                                      </div>
                                      <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{b.beskr}</p>
                                    </div>
                                  </div>
                                  {idx < fraTopp.length - 1 && <div className="border-b border-gray-100 mt-2"></div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>

                {/* Kundens øvrige investeringer: ligger rett under Pensum-produktene, i samme kort, når funksjonen er på */}
                {tilleggAktiv && (
                  <div id="tilleggspanel" className="mt-8 rounded-xl border-2 overflow-hidden" style={{ borderColor: '#CBD5E1', scrollMarginTop: '1rem' }} data-tilleggspanel>
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Kundens øvrige investeringer</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Investeringer utenfor Pensum. De tas med i prognosen og totaloversikten, men ikke i Pensum-forslagets vekter, historikk eller kostnader.</p>
                      </div>
                      {/* Uten eget beløp bruker Pensum-forslaget hele formuen på kundekortet. Da ville postene blitt talt to ganger. */}
                      <button onClick={hentTilleggFraKundekort} disabled={investertBelop === null}
                        title={investertBelop === null ? 'Sett først beløpet som skal investeres hos Pensum. Uten det bruker forslaget hele formuen på kundekortet, og postene ville blitt talt to ganger.' : 'Lager linjer av formuespostene på kundekortet'}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: PENSUM_COLORS.darkBlue }}>Hent fra kundekortet</button>
                    </div>
                    <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
                      <div>
                        {tillegg.length > 0 && (
                          <div className="grid grid-cols-[1fr_9.5rem_8.5rem_5.5rem_1.75rem] gap-x-2 gap-y-2 items-center text-sm">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Navn</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Type</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-right">Beløp (kr)</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-right" title="Forventet årlig avkastning. Tomt felt bruker anslaget for typen.">Avk. %</span>
                            <span></span>
                            {tillegg.map((x) => (
                              <React.Fragment key={x.id}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: TILLEGG_TYPER[x.type]?.farge }}></span>
                                  <input type="text" value={x.navn} onChange={(e) => oppdaterTillegg(x.id, { navn: e.target.value.slice(0, 80) })} placeholder="F.eks. Hytte, DNB-fond" aria-label="Navn på investeringen"
                                    className="w-full min-w-0 border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                                </div>
                                <select value={x.type} onChange={(e) => oppdaterTillegg(x.id, { type: e.target.value })} aria-label="Type investering" className="border border-gray-200 rounded-lg py-1.5 px-2 text-sm bg-white">
                                  {Object.entries(TILLEGG_TYPER).map(([id, t]) => <option key={id} value={id}>{t.navn}</option>)}
                                </select>
                                <input type="text" inputMode="numeric" value={x.belop ? formatNumber(x.belop) : ''} onChange={(e) => { const v = parseBelop(e.target.value); oppdaterTillegg(x.id, { belop: Number.isFinite(v) && v > 0 ? Math.min(1e12, v) : 0 }); }} placeholder="0" aria-label="Beløp i kroner"
                                  className="border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm text-right tabular-nums focus:border-blue-400 focus:outline-none" />
                                {/* Teksten får stå urørt mens rådgiveren skriver («7,» og «-»), og tolkes når feltet forlates. */}
                                <input type="text" inputMode="decimal" key={`${x.id}:${x.avkastning}`} defaultValue={x.avkastning === null || x.avkastning === undefined ? '' : String(x.avkastning).replace('.', ',')}
                                  onBlur={(e) => { const t = e.target.value.replace(',', '.').replace('−', '-').replace(/[%\s]/g, ''); const v = Number(t); const ny = t === '' || !Number.isFinite(v) ? null : Math.max(-20, Math.min(30, v)); if (ny === null) e.target.value = ''; oppdaterTillegg(x.id, { avkastning: ny }); }}
                                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                  placeholder={TILLEGG_TYPER[x.type]?.avk != null ? String(TILLEGG_TYPER[x.type].avk).replace('.', ',') : 'oppgi'} aria-label="Forventet årlig avkastning i prosent"
                                  className={"border rounded-lg py-1.5 px-2.5 text-sm text-right tabular-nums focus:border-blue-400 focus:outline-none " + (x.type === 'annet' && x.avkastning === null && x.belop > 0 ? "border-amber-300 bg-amber-50" : "border-gray-200")} />
                                <button onClick={() => setTillegg((prev) => prev.filter((y) => y.id !== x.id))} aria-label={`Fjern ${x.navn || 'investeringen'}`} className="text-gray-300 hover:text-red-600 text-lg leading-none">×</button>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {tillegg.length === 0 && <p className="text-sm text-gray-500">Legg til det kunden har andre steder, for eksempel bolig, bankinnskudd eller fond i en annen bank. Du kan også be Luna om det, eller lime inn et skjermbilde.</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <span className="text-xs text-gray-400">Legg til:</span>
                          {[['Eiendom', 'eiendom', 'Eiendom'], ['Bankinnskudd', 'kontanter', 'Bankinnskudd'], ['Aksjefond i annen bank', 'aksjer', 'Aksjefond'], ['Rentefond', 'renter', 'Rentefond'], ['Unoterte aksjer', 'pe', 'Unoterte aksjer'], ['Annet', 'annet', '']].map(([etikett, type, navn]) => (
                            <button key={etikett} onClick={() => leggTilTillegg(type, navn)} disabled={tillegg.length >= TILLEGG_MAKS}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TILLEGG_TYPER[type].farge }}></span>+ {etikett}
                            </button>
                          ))}
                        </div>
                        {investertBelop === null && totalKapital > 0 && <p className="text-xs mt-3" style={{ color: '#92400E' }}>Pensum-forslaget bruker nå hele formuen på kundekortet ({formatCurrency(totalKapital)}). Sett beløpet som skal investeres hos Pensum, så det samme ikke telles to ganger her.</p>}
                        {totalbilde?.manglerAvkastning.length > 0 && <p className="text-xs mt-3" style={{ color: '#92400E' }}>Oppgi forventet avkastning for {totalbilde.manglerAvkastning.join(', ')}. Uten den regnes verdien som uendret i prognosen.</p>}
                        <p className="text-[11px] text-gray-400 mt-3">Tomt felt for avkastning bruker verktøyets anslag for typen. Verdiene fremskrives med renters rente, uten innskudd og uttak.</p>
                      </div>

                      {/* Totalbildet: ytre ring viser Pensum mot øvrig, indre ring aktivaklassene samlet */}
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5" data-totalbilde>
                        <h4 className="font-semibold mb-3 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Kundens totalportefølje</h4>
                        {!totalbilde ? <p className="text-sm text-gray-500">Legg inn minst én investering med beløp for å se totalbildet.</p> : (() => {
                          const KLASSEFARGE = { Aksjer: PENSUM_COLORS.darkBlue, Renter: PENSUM_COLORS.salmon, Alternativer: PENSUM_COLORS.teal, Kontanter: PENSUM_COLORS.gray, Annet: '#B8A9C9' };
                          const ytre = [{ name: 'Hos Pensum', value: totalbilde.pensum, farge: PENSUM_COLORS.darkBlue }, { name: 'Øvrige investeringer', value: totalbilde.ovrig, farge: '#CBD5E1' }].filter((d) => d.value > 0);
                          const p1 = (v) => v.toFixed(1).replace('.', ',');
                          return (
                            <>
                              <div className="flex items-center gap-5">
                                <div className="shrink-0 relative">
                                  <ResponsiveContainer width={170} height={170}>
                                    <PieChart>
                                      <Pie data={totalbilde.klasser} dataKey="belop" nameKey="navn" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} cornerRadius={3} isAnimationActive={false}>
                                        {totalbilde.klasser.map((k) => <Cell key={k.navn} fill={KLASSEFARGE[k.navn] || '#94A3B8'} />)}
                                      </Pie>
                                      <Pie data={ytre} dataKey="value" cx="50%" cy="50%" innerRadius={68} outerRadius={80} paddingAngle={2} cornerRadius={3} isAnimationActive={false}>
                                        {ytre.map((d) => <Cell key={d.name} fill={d.farge} />)}
                                      </Pie>
                                      <Tooltip formatter={(v, n) => [formatCurrency(v), n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex-1 min-w-0 space-y-3">
                                  <div>
                                    <div className="text-[11px] uppercase tracking-wider text-gray-400">Totalt</div>
                                    <div className="text-xl font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalbilde.total)}</div>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    {ytre.map((d) => (
                                      <div key={d.name} className="flex items-center gap-2">
                                        <span className="w-3 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.farge }}></span>
                                        <span className="flex-1 text-gray-700">{d.name}</span>
                                        <span className="tabular-nums text-gray-500 text-xs">{formatCurrency(d.value)}</span>
                                        <span className="font-semibold tabular-nums w-14 text-right" style={{ color: PENSUM_COLORS.darkBlue }}>{p1((d.value / totalbilde.total) * 100)} %</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-sm">
                                <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Aktivaklasser samlet</div>
                                {totalbilde.klasser.map((k) => (
                                  <div key={k.navn} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: KLASSEFARGE[k.navn] || '#94A3B8' }}></span>
                                    <span className="flex-1 text-gray-700">{k.navn}</span>
                                    <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{p1(k.andel)} %</span>
                                  </div>
                                ))}
                              </div>
                              {erGyldigTall(totalbilde.totalAvkastning) && <p className="text-xs text-gray-500 mt-3">Forventet avkastning samlet: <strong style={{ color: PENSUM_COLORS.darkBlue }}>{p1(totalbilde.totalAvkastning)} % per år</strong> (Pensum {formatPercent(pensumForventetAvkastning)}, øvrig {formatPercent(totalbilde.ovrigAvkastning)}).</p>}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hvor er pengene investert? (kun aksjedelen) */}
                {(() => {
                  // Beregn vektet aggregert eksponering for hele porteføljen (ekskl. høyrente/rente)
                  const aksjeProdukter = pensumAllokering.filter(a => {
                    if (a.vekt <= 0) return false;
                    const alle = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                    const p = alle.find(pp => pp.id === a.id);
                    // Ekskluder rente/høyrente-produkter
                    if (p?.aktivatype === 'rente') return false;
                    if (a.id === 'global-hoyrente' || a.id === 'nordisk-hoyrente') return false;
                    return true;
                  });
                  const aggreger = (key) => aggregerEksponering(aksjeProdukter, produktEksponering, key, 10);

                  const aggRegioner = aggreger('regioner');
                  const aggSektorer = aggreger('sektorer');
                  const aggStil = aggreger('stil');
                  const aggVerdensdeler = aggregerVerdensdeler(aksjeProdukter, produktEksponering);

                  if (aksjeProdukter.length === 0) return null;

                  return (
                    <div className="mt-8 rounded-2xl border border-blue-200/60 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #EBF3FF 50%, #DBEAFE 100%)' }}>
                      <div className="px-5 py-4 border-b border-blue-200/50" style={{ backgroundColor: 'rgba(13, 34, 64, 0.04)' }}>
                        <h4 className="font-semibold text-base" style={{ color: PENSUM_COLORS.darkBlue }}>Hvor er pengene investert?</h4>
                        <p className="text-xs text-gray-500 mt-1">Vektet eksponering for den samlede porteføljen. <em>Gjelder aksjedelen ({aksjeProdukter.map(a => a.navn?.replace('Pensum ', '')).join(', ')}).</em></p>
                      </div>
                      <div className="p-5">
                        {/* Verdensdeler: grov geografisk fordeling av aksjedelen */}
                        {aggVerdensdeler.length > 0 && (
                          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
                            <p className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Verdensdeler</p>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="shrink-0">
                                <ResponsiveContainer width={170} height={170}>
                                  <PieChart>
                                    <Pie data={aggVerdensdeler} dataKey="vekt" nameKey="navn" cx="50%" cy="50%" innerRadius={45} outerRadius={78} paddingAngle={2} cornerRadius={4} isAnimationActive={false}>
                                      {aggVerdensdeler.map((d) => <Cell key={d.navn} fill={VERDENSDEL_FARGER[d.navn]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [pst(v) + ' %', n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 w-full">
                                {aggVerdensdeler.map((d) => (
                                  <div key={d.navn} className="flex items-center gap-2.5 text-sm">
                                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: VERDENSDEL_FARGER[d.navn] }}></div>
                                    <span className="flex-1 min-w-0 truncate text-gray-700">{d.navn}</span>
                                    <span className="font-semibold tabular-nums flex-shrink-0 w-14 text-right whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(d.vekt)} %</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {aggVerdensdeler.some(d => d.navn === 'Ikke fordelt') && (
                              <p className="text-[11px] text-gray-400 mt-3">«Ikke fordelt» er land Morningstar ikke spesifiserer i fondenes rapportering.</p>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                          {[
                            { title: 'Regioner', data: aggRegioner, color: PENSUM_COLORS.teal },
                            { title: 'Sektorer', data: aggSektorer, color: PENSUM_COLORS.lightBlue },
                            { title: 'Stil', data: aggStil, color: PENSUM_COLORS.gold }
                          ].map(block => (
                            <div key={block.title} className="rounded-xl border border-slate-200 bg-white p-4">
                              <p className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>{block.title}</p>
                              {block.data.length > 0 ? (
                                <div className="space-y-2">
                                  {block.data.map((row, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="text-xs min-w-0 flex-1 truncate">{oversettEksponering(row.navn)}</span>
                                      <div className="w-24 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(row.vekt, 100)}%`, backgroundColor: block.color }}></div>
                                      </div>
                                      <span className="text-xs font-medium w-10 text-right">{pst(row.vekt)} %</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-[100px] flex items-center justify-center text-sm text-slate-400">Ingen data</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Produktspesifikk eksponering */}
                <div className="mt-8 rounded-2xl border border-amber-200/60 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF7E6 50%, #FEF3D0 100%)' }}>
                  <div className="px-5 py-4 border-b border-amber-200/50 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3" style={{ backgroundColor: 'rgba(180, 134, 11, 0.06)' }}>
                    <div>
                      <h4 className="font-semibold text-base" style={{ color: PENSUM_COLORS.darkBlue }}>Produktspesifikk eksponering</h4>
                      <p className="text-sm mt-1 max-w-3xl" style={{ color: '#78716C' }}>Vis hvert produkt for seg. Dette er arbeidsflaten som brukes som rapportgrunnlag i det genererte investeringsforslaget. Aggregert eksponering brukes bare som sekundær oppsummering.</p>
                    </div>
                    {aktivtEksponeringsProdukt && (
                      <button
                        onClick={() => setValgtProduktDetalj(aktivtEksponeringsProdukt)}
                        className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
                        style={{ color: PENSUM_COLORS.darkBlue }}
                      >
                        Åpne produktdetalj
                      </button>
                    )}
                  </div>

                  {valgtePensumProdukterMedEksponering.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-12">
                      <div className="xl:col-span-3 border-r border-amber-200/40 bg-white/80">
                        <div className="p-4 border-b border-slate-100">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valgte produkter</p>
                          <p className="text-sm text-slate-600 mt-1">Velg et produkt for å se innhold, rolle og rapportgrunnlag.</p>
                        </div>
                        <div className="p-3 space-y-2 max-h-[760px] overflow-auto">
                          {valgtePensumProdukterMedEksponering.map((produkt) => (
                            <button
                              key={produkt.id}
                              onClick={() => setAktivEksponeringProduktId(produkt.id)}
                              className={`w-full text-left rounded-xl border px-3 py-3 transition ${aktivEksponeringProduktId === produkt.id ? 'shadow-sm' : 'hover:bg-slate-50'}`}
                              style={{
                                borderColor: aktivEksponeringProduktId === produkt.id ? PENSUM_COLORS.lightBlue : '#E2E8F0',
                                backgroundColor: aktivEksponeringProduktId === produkt.id ? '#EFF6FF' : '#FFFFFF'
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: PENSUM_COLORS.darkBlue }}>{produkt.navn}</p>
                                  <p className="text-xs text-slate-500 mt-1 truncate">{produkt.rapport?.role || produkt.aktivatype || 'Pensum-løsning'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(produkt.vekt)}</p>
                                  <p className="text-[11px] text-slate-400">vekt</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="xl:col-span-9 p-4 lg:p-5">
                        {aktivtEksponeringsProdukt ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                              <div className="xl:col-span-7">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valgt produkt</p>
                                <h4 className="text-2xl font-semibold mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{aktivtEksponeringsProdukt.rapport?.slideTitle || aktivtEksponeringsProdukt.navn}</h4>
                                <p className="text-sm text-slate-600 mt-1">{aktivtEksponeringsProdukt.rapport?.slideSubtitle || aktivtEksponeringsProdukt.navn}</p>
                                <p className="text-sm text-slate-600 mt-3 max-w-3xl">{aktivtEksponeringsProdukt.rapport?.pitch || aktivtEksponeringsProdukt.rapport?.caseText || (aktivtEksponeringsProdukt.kilde === 'morningstar' ? `Morningstar-kategori: ${aktivtEksponeringsProdukt.morningstarKategori || 'ukjent'} · valuta ${aktivtEksponeringsProdukt.valuta || 'ukjent'}. Forventet avkastning er CMA-anslag for ${String(aktivtEksponeringsProdukt.cmaKlasse || '').toLowerCase()}.` : null) || 'Ingen produktpitch registrert.'}</p>
                              </div>
                              <div className="xl:col-span-5 grid grid-cols-3 gap-3 shrink-0">
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Porteføljevekt</p>
                                  <p className="text-xl font-semibold mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(aktivtEksponeringsProdukt.vekt)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Forv. avkastning</p>
                                  <p className="text-xl font-semibold mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{erGyldigTall((aktivtEksponeringsProdukt.rapport?.expectedReturn ?? aktivtEksponeringsProdukt.forventetAvkastning)) ? `${pst((aktivtEksponeringsProdukt.rapport?.expectedReturn ?? aktivtEksponeringsProdukt.forventetAvkastning))} %` : '—'}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Forv. yield</p>
                                  <p className="text-xl font-semibold mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{erGyldigTall((aktivtEksponeringsProdukt.rapport?.expectedYield ?? aktivtEksponeringsProdukt.forventetYield)) ? `${pst((aktivtEksponeringsProdukt.rapport?.expectedYield ?? aktivtEksponeringsProdukt.forventetYield))} %` : '—'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              {[
                                { key: 'sektorer', title: 'Sektorer', color: PENSUM_COLORS.lightBlue },
                                { key: 'regioner', title: 'Regioner', color: PENSUM_COLORS.teal },
                                { key: 'underliggende', title: 'Underliggende', color: PENSUM_COLORS.salmon },
                                { key: 'stil', title: 'Stil / øvrig', color: PENSUM_COLORS.gold }
                              ].map((block) => {
                                const rows = (aktivtEksponeringsProdukt.eksponering?.[block.key] || []).slice(0, 8);
                                return (
                                  <div key={block.key} className="rounded-xl border border-slate-200 bg-white p-4 min-h-[220px]">
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{block.title}</p>
                                      <span className="text-[11px] text-slate-400">{rows.length ? `${rows.length} linjer` : 'Ingen data'}</span>
                                    </div>
                                    {rows.length ? (
                                      <div className="space-y-2">
                                        {rows.map((row, idx) => (
                                          <div key={`${block.key}-${idx}`} className="flex items-center gap-2">
                                            <span className="text-xs min-w-0 flex-1 truncate">{oversettEksponering(row.navn)}</span>
                                            <div className="w-28 bg-slate-100 rounded-full h-4 overflow-hidden">
                                              <div className="h-full rounded-full" style={{ width: `${Math.min(Number(row.vekt) || 0, 100)}%`, backgroundColor: block.color }}></div>
                                            </div>
                                            <span className="text-xs font-medium w-10 text-right">{pst(row.vekt)} %</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="h-[152px] flex items-center justify-center text-sm text-slate-400">Ingen data registrert</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Rolle i porteføljen</p>
                                <p className="mt-2 text-sm text-slate-700">{aktivtEksponeringsProdukt.rapport?.role || '—'}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Benchmark</p>
                                <p className="mt-2 text-sm text-slate-700">{aktivtEksponeringsProdukt.rapport?.benchmark || '—'}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Investeringscase</p>
                                <p className="mt-2 text-sm text-slate-700">{aktivtEksponeringsProdukt.rapport?.caseText || aktivtEksponeringsProdukt.rapport?.whyIncluded || aktivtEksponeringsProdukt.rapport?.pitch || '—'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                              <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Nøkkelrisiko</p>
                                <p className="mt-2 text-sm text-slate-700">{aktivtEksponeringsProdukt.rapport?.riskText || '—'}</p>
                              </div>
                              {aktivtEksponeringsProdukt.eksponering?.disclaimer && (
                                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-3 text-xs text-amber-800">
                                  {aktivtEksponeringsProdukt.eksponering.disclaimer}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[280px] flex items-center justify-center text-slate-400">Ingen produkter med vekt valgt.</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-slate-500">Legg til produkter og tilordne vekt for å se produktspesifikk eksponering her.</div>
                  )}
                </div>
              </div>
            </div>
            </div>
            )}

            {pbGruppeHode('prognose', 'Prognose', 'Forventet utvikling, mål, scenarioer og renters rente')}
            {pbGrupper.prognose && (
            <div className="space-y-6">
            {/* Prognose */}
            {(() => {
              const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
              let yieldSum = 0; let yieldTotal = 0;
              pensumAllokering.forEach(a => {
                const p = alleProdukt.find(pp => pp.id === a.id);
                const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
                if (erGyldigTall(y) && a.vekt > 0) { yieldSum += y * a.vekt; yieldTotal += a.vekt; }
              });
              const vektetYield = yieldTotal > 0 ? yieldSum / yieldTotal : 0;
              return (
                <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <StatCard label="Startkapital" value={formatCurrency(effektivtInvestertBelop)} />
                  <StatCard label="Forventet avkastning" value={formatPercent(pensumForventetAvkastning)} subtext="årlig" color={PENSUM_COLORS.green} />
                  <StatCard label="Forventet yield" value={formatPercent(vektetYield)} subtext="løpende" color={PENSUM_COLORS.teal} />
                  <StatCard label="Sluttverdi" value={formatCurrency(pensumPrognose[pensumPrognose.length - 1]?.verdi || 0)} subtext={"etter " + horisont + " år"} />
                  <StatCard label="Total avkastning" value={formatCurrency((pensumPrognose[pensumPrognose.length - 1]?.verdi || 0) - effektivtInvestertBelop)} color={PENSUM_COLORS.green} />
                </div>
                {totalbilde && (
                  <div className="mt-4 rounded-xl border border-gray-100 bg-white px-5 py-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm" data-totalprognose>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PENSUM_COLORS.darkBlue }}>Med kundens øvrige investeringer</span>
                    <span className="text-gray-600">I dag: <strong className="tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalbilde.total)}</strong></span>
                    <span className="text-gray-600">Om {horisont} år: <strong className="tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency((pensumPrognose[pensumPrognose.length - 1]?.verdi || 0) + (tilleggFrem[tilleggFrem.length - 1]?.total || 0))}</strong></span>
                    <span className="text-gray-500 text-xs">Hos Pensum {formatCurrency(pensumPrognose[pensumPrognose.length - 1]?.verdi || 0)} · øvrig {formatCurrency(tilleggFrem[tilleggFrem.length - 1]?.total || 0)}</span>
                  </div>
                )}
                </>
              );
            })()}

            {/* Prognosegraf — stacked per Pensum-produkt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Utvikling i formuesverdi</h3>
                {/* Tidshorisont: samme verdi som på forsiden, kan justeres her */}
                <div className="flex items-center gap-2" data-horisontvelger>
                  <span className="text-sm text-blue-200">Horisont</span>
                  {[5, 10, 15, 20].map(aar => (
                    <button key={aar} onClick={() => { setHorisont(aar); setLocalHorisont(String(aar)); }}
                      className={"px-2.5 py-1 rounded-md text-xs font-semibold transition-colors " + (horisont === aar ? "bg-white" : "text-blue-100 border border-blue-400 hover:bg-white/10")}
                      style={horisont === aar ? { color: PENSUM_COLORS.darkBlue } : {}}>{aar} år</button>
                  ))}
                  <input type="number" min={1} max={50} value={horisont} aria-label="Tidshorisont i år"
                    onChange={(e) => { const v = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)); setHorisont(v); setLocalHorisont(String(v)); }}
                    className="border border-blue-400 bg-blue-800/50 text-white rounded py-1 px-2 w-16 text-right text-sm" />
                  <span className="text-blue-300 text-sm">år</span>
                  {tilleggLinjer.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer ml-3 pl-3 border-l border-blue-400">
                      <input type="checkbox" checked={visTilleggIPrognose} onChange={(e) => setVisTilleggIPrognose(e.target.checked)} className="w-4 h-4 rounded" />
                      <span>Vis øvrige investeringer</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={380}>
                  <ComposedChart data={prognoseMedTillegg} barCategoryGap="30%">
                    <defs>
                      <pattern id="pbTilleggPattern" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
                        <rect width="7" height="7" fill="#E2E8F0" />
                        <line x1="0" y1="0" x2="0" y2="7" stroke="#64748B" strokeWidth="2" opacity="0.5" />
                      </pattern>
                      <pattern id="pbLaanPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                        <rect width="8" height="8" fill="#FEE2E2" />
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#B91C1C" strokeWidth="2" opacity="0.55" />
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                    <Legend iconType="circle" iconSize={8} />
                    {pbTotalLaan > 0 && !pbAkkumulerRenter && <ReferenceArea y1={0} y2={pbTotalLaan} fill="url(#pbLaanPattern)" fillOpacity={1} ifOverflow="visible" />}
                    {valgteProdukterForChart.map((p, idx) => <Bar key={p.id} dataKey={p.navn} stackId="a" fill={pensumProduktFarger[idx % pensumProduktFarger.length]} />)}
                    {tilleggLinjer.length > 0 && visTilleggIPrognose && <Bar dataKey={TILLEGG_NAVN} stackId="a" fill="url(#pbTilleggPattern)" stroke="#94A3B8" strokeWidth={0.5} />}
                    {pbTotalLaan > 0 && pbAkkumulerRenter && (
                      <Area type="monotone" dataKey="laanBalanse" fill="url(#pbLaanPattern)" fillOpacity={1} stroke="#B91C1C" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} name="Lånebalanse">
                        <LabelList dataKey="laanBalanse" content={(props) => {
                          const { x, y, value, index } = props;
                          if (index !== pensumPrognose.length - 1) return null;
                          return <text x={x} y={y - 6} fill="#FFFFFF" fontSize={13} fontWeight={700} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#B91C1C', strokeWidth: 4, strokeLinejoin: 'round' }}>Lån: {formatCurrency(value)}</text>;
                        }} />
                      </Area>
                    )}
                    {pbTotalLaan > 0 && !pbAkkumulerRenter && <ReferenceLine y={pbTotalLaan} stroke="#B91C1C" strokeWidth={2} label={{ value: `Lån: ${formatCurrency(pbTotalLaan)}`, position: 'insideBottomRight', fill: '#FFFFFF', fontSize: 13, fontWeight: 700, offset: 8, style: { paintOrder: 'stroke', stroke: '#B91C1C', strokeWidth: 4, strokeLinejoin: 'round' } }} />}
                    {pbMalAktiv && pbHovedmal.belop > 0 && pbHovedmal.visIGraf && <ReferenceLine y={pbHovedmal.belop} stroke="#012441" strokeWidth={2} strokeDasharray="8 4" label={{ value: `${pbHovedmal.navn || 'Hovedmål'}: ${formatCurrency(pbHovedmal.belop)}`, position: 'insideTopRight', fill: '#012441', fontSize: 12, fontWeight: 600 }} />}
                    {pbMalAktiv && pbVisDelmal && pbDelmal.filter(m => m.belop > 0).map((m, i) => <ReferenceLine key={i} y={m.belop} stroke="#059669" strokeDasharray="4 4" label={{ value: m.navn || `Delmål ${i+1}`, position: 'right', fill: '#059669', fontSize: 11 }} />)}
                  </ComposedChart>
                </ResponsiveContainer>
                {nettoKontantstrom !== 0 && (
                  <div className="mt-3 p-3 rounded-lg border border-blue-100 bg-blue-50 text-xs text-gray-700">
                    Årlig netto kontantstrøm fra kundeinformasjon: <strong style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(nettoKontantstrom)}</strong>
                    {innskudd > 0 && <span> ({formatCurrency(innskudd)} innskudd</span>}
                    {innskudd > 0 && uttak > 0 && <span>, </span>}
                    {uttak > 0 && <span>{innskudd > 0 ? '' : '('}{formatCurrency(uttak)} uttak</span>}
                    {(innskudd > 0 || uttak > 0) && <span>)</span>}
                    . Endre på Kundeinformasjon-fanen.
                  </div>
                )}
              </div>
            </div>

            {/* Forutsetninger og mål — samlet panel rett under prognosegrafen.
                 Inneholder kontantstrøm + Pensum-rebalansering (som faktisk styrer
                 grafen over), samt snarvei til lån/mål i Formuesplanleggeren. */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setVisForutsetninger(v => !v)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:opacity-95 transition-opacity"
                style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Forutsetninger og mål</h3>
                  <span className="text-xs text-blue-200">
                    {[((innskudd || 0) !== 0 || (uttak || 0) !== 0) && 'Kontantstrøm', pensumRebalanseringAktiv && 'Rebalansering', pbLaanAktiv && 'Lånefinansiering', pbMalAktiv && 'Mål'].filter(Boolean).join(' · ') || 'Klikk for å konfigurere'}
                  </span>
                </div>
                <svg className={`w-5 h-5 text-white transition-transform ${visForutsetninger ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {visForutsetninger && (
                <div className="p-6 space-y-5">
                  {/* Årlig kontantstrøm */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Årlig kontantstrøm</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Årlig innskudd (kr)</label>
                        <input type="text" value={formatNumber(innskudd || 0)} onChange={(e) => { const v = parseBelop(e.target.value) || 0; setInnskudd(v); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Årlige uttak (kr)</label>
                        <input type="text" value={formatNumber(uttak || 0)} onChange={(e) => { const v = parseBelop(e.target.value) || 0; setUttak(v); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-right" />
                      </div>
                      <div className="rounded-lg p-3" style={{ backgroundColor: nettoKontantstrom >= 0 ? '#F0FDF4' : '#FEF2F2' }}>
                        <div className="text-xs font-medium text-gray-500 mb-0.5">Netto kontantstrøm</div>
                        <div className={"text-xl font-bold " + (nettoKontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(nettoKontantstrom)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Årlig rebalansering (Pensum-portefølje) */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setPensumRebalanseringAktiv(!pensumRebalanseringAktiv)}>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Årlig rebalansering</h4>
                        {!pensumRebalanseringAktiv && <span className="text-xs text-gray-400">(klikk for å aktivere)</span>}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-gray-500">{pensumRebalanseringAktiv ? 'Aktiv' : 'Inaktiv'}</span>
                        <div className="relative">
                          <input type="checkbox" checked={pensumRebalanseringAktiv} onChange={(e) => setPensumRebalanseringAktiv(e.target.checked)} className="sr-only" />
                          <div className={"w-11 h-6 rounded-full transition-colors " + (pensumRebalanseringAktiv ? "bg-green-500" : "bg-gray-300")}></div>
                          <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (pensumRebalanseringAktiv ? "translate-x-5" : "")}></div>
                        </div>
                      </label>
                    </div>
                    {pensumRebalanseringAktiv && (
                      <div className="mt-4 space-y-4">
                        {pensumRebalanseringer.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Ingen rebalanseringsregler — legg til en regel for å flytte vekt mellom Pensum-produkter hvert år.</p>
                        )}
                        {pensumRebalanseringer.map((reb, rebIdx) => {
                          const valgteProd = pensumAllokering.filter(a => a.vekt > 0);
                          return (
                            <div key={rebIdx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                              <div>
                                {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Selg fra</label>}
                                <select value={reb.fraId} onChange={(e) => setPensumRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, fraId: e.target.value } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                                  {valgteProd.map(a => <option key={a.id} value={a.id}>{a.navn}</option>)}
                                </select>
                              </div>
                              <div>
                                {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Kjøp til</label>}
                                <select value={reb.tilId} onChange={(e) => setPensumRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, tilId: e.target.value } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                                  {valgteProd.filter(a => a.id !== reb.fraId).map(a => <option key={a.id} value={a.id}>{a.navn}</option>)}
                                </select>
                              </div>
                              <div>
                                {rebIdx === 0 && <label className="block text-xs font-medium mb-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>Andel per år</label>}
                                <div className="relative">
                                  <input type="number" min="1" max="100" value={reb.prosentPerAar} onChange={(e) => setPensumRebalanseringer(prev => prev.map((r, i) => i === rebIdx ? { ...r, prosentPerAar: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) } : r))} className="w-full border border-gray-200 rounded-lg py-2 px-3 pr-8 text-sm" />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                                <p>{pst(reb.prosentPerAar)} % av {pensumAllokering.find(a => a.id === reb.fraId)?.navn || '?'} → {pensumAllokering.find(a => a.id === reb.tilId)?.navn || '?'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setPensumRebalanseringer(prev => prev.filter((_, i) => i !== rebIdx))} className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50">Fjern</button>
                              </div>
                            </div>
                          );
                        })}
                        {pensumAllokering.filter(a => a.vekt > 0).length >= 2 && (
                          <button onClick={() => {
                            const valgteProd = pensumAllokering.filter(a => a.vekt > 0);
                            setPensumRebalanseringer(prev => [...prev, { fraId: valgteProd[0].id, tilId: valgteProd[1].id, prosentPerAar: 5 }]);
                          }} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                            + Legg til regel
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lånefinansiering & finansielt mål */}
                  {renderLaanOgMaal({
                    laanAktiv: pbLaanAktiv, setLaanAktiv: setPbLaanAktiv,
                    prognoseFinansiering: pbPrognoseFinansiering, setPrognoseFinansiering: setPbPrognoseFinansiering,
                    laanModus: pbLaanModus, setLaanModus: setPbLaanModus,
                    akkumulerRenter: pbAkkumulerRenter, setAkkumulerRenter: setPbAkkumulerRenter,
                    malAktiv: pbMalAktiv, setMalAktiv: setPbMalAktiv,
                    hovedmal: pbHovedmal, setHovedmal: setPbHovedmal,
                    visDelmal: pbVisDelmal, setVisDelmal: setPbVisDelmal,
                    delmal: pbDelmal, setDelmal: setPbDelmal,
                    visSluttSammensetning: pbVisSluttSammensetning, setVisSluttSammensetning: setPbVisSluttSammensetning,
                    sluttSammensetningAar: pbSluttSammensetningAar, setSluttSammensetningAar: setPbSluttSammensetningAar,
                    totalLaan: pbTotalLaan, aarligRentekostnad: pbAarligRentekostnad, eksisterendeLaanModus: pbEksisterendeLaanModus,
                    egenkapitalBelop: pbEgenkapitalBelop, effektivtInvestertBelop: pbEffektivtInvestertBelop, portefoljeBelop: pbPortefoljeBelop,
                    verdiutvikling: pensumPrognose, vektetAvkastning: pensumForventetAvkastning, nettoKontantstrom, horisont,
                  })}

                  {/* Sammensetning ved valgt år: produktfordeling og aktivaklasser etter vekst, kontantstrøm og rebalansering */}
                  {pbMalAktiv && pbVisSluttSammensetning && (() => {
                    const aar = Math.max(1, Math.min(horisont, pbSluttSammensetningAar));
                    const rad = pensumPrognose[aar];
                    const valgte = pensumAllokering.filter(a => a.vekt > 0);
                    if (!rad || !valgte.length || !(rad.verdi > 0)) return null;
                    const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                    const sumVekt = valgte.reduce((sum, a) => sum + a.vekt, 0) || 1;
                    const linjer = valgte.map((a, idx) => ({
                      id: a.id, navn: a.navn, farge: PORTEFOLJE_FARGER[idx % PORTEFOLJE_FARGER.length],
                      type: alleProd.find(pp => pp.id === a.id)?.aktivatype,
                      naa: (a.vekt / sumVekt) * 100, da: ((rad[a.navn] || 0) / rad.verdi) * 100, belop: rad[a.navn] || 0,
                    }));
                    const KLASSER = [['Aksjer', PENSUM_COLORS.darkBlue], ['Renter', PENSUM_COLORS.salmon], ['Alternativer', PENSUM_COLORS.teal], ['Kontanter', PENSUM_COLORS.gray]];
                    const klasseSum = (felt) => {
                      const sum = { Aksjer: 0, Renter: 0, Alternativer: 0, Kontanter: 0 };
                      linjer.forEach(l => {
                        if (l.type === 'aksje') sum.Aksjer += l[felt];
                        else if (l.type === 'rente') sum.Renter += l[felt];
                        else if (l.type === 'alternativ') sum.Alternativer += l[felt];
                        else if (l.type === 'kontanter') sum.Kontanter += l[felt];
                        else if (l.type === 'blandet' || l.type === 'dynamisk') { sum.Aksjer += l[felt] * 0.5; sum.Renter += l[felt] * 0.5; }
                      });
                      return sum;
                    };
                    const klasserNaa = klasseSum('naa'); const klasserDa = klasseSum('da');
                    const p1 = (v) => v.toFixed(1).replace('.', ',');
                    const endring = (d) => Math.abs(d) < 0.05 ? <span className="text-gray-300">–</span> : <span style={{ color: d > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>{d > 0 ? '+' : '−'}{p1(Math.abs(d))}</span>;
                    const stolpe = (sum) => (
                      <div className="h-2.5 rounded-full overflow-hidden flex" style={{ backgroundColor: '#E2E8F0' }}>
                        {KLASSER.filter(([n]) => sum[n] > 0.05).map(([n, farge]) => <div key={n} title={`${n} ${p1(sum[n])} %`} style={{ width: sum[n] + '%', backgroundColor: farge }}></div>)}
                      </div>
                    );
                    return (
                      <div className="mt-5 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5" data-sluttsammensetning>
                        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                          <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Sammensetning i {rad.year}</h4>
                          <span className="text-xs text-gray-500">etter {aar} år · {formatCurrency(Math.round(rad.verdi))}</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 items-center">
                          <div className="mx-auto">
                            <ResponsiveContainer width={180} height={180}>
                              <PieChart>
                                <Pie data={linjer.filter(l => l.da > 0.05)} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="da" nameKey="navn" paddingAngle={2} cornerRadius={4}>
                                  {linjer.filter(l => l.da > 0.05).map(l => <Cell key={l.id} fill={l.farge} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [p1(v) + ' %', n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200">
                                <th className="py-1.5 text-left font-semibold">Produkt</th>
                                <th className="py-1.5 text-right font-semibold">I dag</th>
                                <th className="py-1.5 text-right font-semibold">{rad.year}</th>
                                <th className="py-1.5 text-right font-semibold">Endring</th>
                                <th className="py-1.5 text-right font-semibold">Verdi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {linjer.map(l => (
                                <tr key={l.id} className="border-b border-gray-100">
                                  <td className="py-1.5 pr-2"><span className="inline-block w-2.5 h-2.5 rounded mr-2 align-middle" style={{ backgroundColor: l.farge }}></span><span className="text-gray-700">{l.navn}</span></td>
                                  <td className="py-1.5 text-right tabular-nums text-gray-500">{p1(l.naa)} %</td>
                                  <td className="py-1.5 text-right tabular-nums font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{p1(l.da)} %</td>
                                  <td className="py-1.5 text-right tabular-nums text-xs">{endring(l.da - l.naa)}</td>
                                  <td className="py-1.5 text-right tabular-nums text-gray-600 whitespace-nowrap">{formatCurrency(Math.round(l.belop))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2 items-center text-xs">
                          <span className="text-gray-500">I dag</span>{stolpe(klasserNaa)}
                          <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{rad.year}</span>{stolpe(klasserDa)}
                          <span></span>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-gray-600">
                            {KLASSER.filter(([n]) => klasserNaa[n] > 0.05 || klasserDa[n] > 0.05).map(([n, farge]) => (
                              <span key={n} className="flex items-center gap-1.5 tabular-nums"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: farge }}></span>{n} {p1(klasserNaa[n])} % → <strong style={{ color: PENSUM_COLORS.darkBlue }}>{p1(klasserDa[n])} %</strong></span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3">Fordelingen endrer seg fordi produktene har ulik forventet avkastning{pensumRebalanseringAktiv && pensumRebalanseringer.length > 0 ? ', og fordi rebalanseringsreglene flytter midler mellom dem' : ''}. Tallene er en fremskrivning, ikke en garanti.</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Detaljert verdiutvikling — viser uttak/innskudd og vekt per produkt år for år */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Detaljert verdiutvikling</h3>
                <p className="text-xs text-blue-200 mt-0.5">Inkluderer årlig kontantstrøm{pensumRebalanseringAktiv && pensumRebalanseringer.length > 0 ? ' og rebalanseringer' : ''}.</p>
              </div>
              <div className="p-6 overflow-x-auto">
                {(() => {
                  const valgte = pensumAllokering.filter(a => a.vekt > 0);
                  if (valgte.length === 0 || pensumPrognose.length === 0) {
                    return <p className="text-sm text-gray-500 italic">Legg til produkter for å se detaljert verdiutvikling.</p>;
                  }
                  return (
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                          <th className="py-3 px-4 text-left text-white">År</th>
                          <th className="py-3 px-3 text-right text-white">Innskudd/uttak</th>
                          {valgte.map(a => <th key={a.id} className="py-3 px-3 text-right text-white">{a.navn}</th>)}
                          <th className="py-3 px-4 text-right text-white font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pensumPrognose.map((row, idx) => (
                          <tr key={row.year} className={"border-b border-gray-100 " + (idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                            <td className="py-3 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                            <td className={"py-3 px-3 text-right tabular-nums " + (idx === 0 ? "text-gray-400" : (nettoKontantstrom > 0 ? "text-green-600" : (nettoKontantstrom < 0 ? "text-red-600" : "text-gray-400")))}>
                              {idx === 0 ? '—' : (nettoKontantstrom !== 0 ? formatCurrency(nettoKontantstrom) : '—')}
                            </td>
                            {valgte.map(a => <td key={a.id} className="py-3 px-3 text-right text-gray-600 tabular-nums">{formatCurrency(row[a.navn] || 0)}</td>)}
                            <td className="py-3 px-4 text-right font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.verdi)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
                {pensumRebalanseringAktiv && pensumRebalanseringer.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg border border-blue-100 bg-blue-50 text-xs text-gray-700">
                    <strong style={{ color: PENSUM_COLORS.darkBlue }}>Aktive rebalanseringsregler:</strong>{' '}
                    {pensumRebalanseringer.map((reb, i) => {
                      const fra = pensumAllokering.find(a => a.id === reb.fraId)?.navn || '?';
                      const til = pensumAllokering.find(a => a.id === reb.tilId)?.navn || '?';
                      return <span key={i}>{i > 0 ? ' · ' : ''}{pst(reb.prosentPerAar)} % av {fra} → {til}</span>;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Scenarioanalyse */}
            {(() => {
              const kapital = investertBelop !== null ? investertBelop : totalKapital;
              const baseAvk = erGyldigTall(pensumForventetAvkastning) ? pensumForventetAvkastning : 8;
              const risikoScen = beregnScenarioAvkastning(baseAvk, pensumScenarioVolatilitet.verdi, horisont);
              const pessAvk = scenarioLosninger.pessimistisk !== null ? scenarioLosninger.pessimistisk : risikoScen.svak;
              const optAvk = scenarioLosninger.optimistisk !== null ? scenarioLosninger.optimistisk : risikoScen.sterk;
              const scenarioer = [
                { id: 'pessimistisk', tittel: 'Svakt scenario', undertittel: '5 % sannsynlighet for svakere', avk: pessAvk, farge: '#DC2626', borderColor: '#DC2626', beskrivelse: `Svak markedsutvikling: omtrent 1 av 20 utfall blir svakere enn dette, gitt forventet svingning i porteføljen (volatilitet ca. ${pensumScenarioVolatilitet.verdi.toFixed(1).replace('.', ',')} % p.a., CMA). Underveis kan verdien falle betydelig – også om snittet over hele perioden blir positivt.` },
                { id: 'hoved', tittel: 'Hovedscenario', undertittel: 'Modellbasert illustrasjon', avk: Math.round(baseAvk * 10) / 10, farge: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue, beskrivelse: 'Modellbasert illustrasjon basert på CMA-forutsetninger. Ikke en prognose eller garanti for fremtidig avkastning.' },
                { id: 'optimistisk', tittel: 'Sterkt scenario', undertittel: '5 % sannsynlighet for sterkere', avk: optAvk, farge: '#059669', borderColor: '#059669', beskrivelse: 'Sterk markedsutvikling: omtrent 1 av 20 utfall blir sterkere enn dette, gitt forventet svingning i porteføljen.' },
              ];
              const scData = [];
              for (let i = 0; i <= horisont; i++) {
                const year = new Date().getFullYear() + i;
                const row = { year };
                scenarioer.forEach(s => {
                  row[s.id] = Math.round(fremskrivVerdi(kapital, s.avk, i, nettoKontantstrom));
                });
                scData.push(row);
              }
              const formatSluttverdi = (v) => v > 1000000 ? (v / 1000000).toFixed(1).replace('.', ',') + ' MNOK' : formatCurrency(v);

              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setVisScenarioanalyse(!visScenarioanalyse)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: visScenarioanalyse ? PENSUM_COLORS.darkBlue : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className={"w-5 h-5 transition-transform " + (visScenarioanalyse ? "rotate-180 text-white" : "text-gray-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      <h3 className={"text-lg font-semibold " + (visScenarioanalyse ? "text-white" : "")} style={{ color: visScenarioanalyse ? undefined : PENSUM_COLORS.darkBlue }}>Scenarioanalyse — hva kan du forvente?</h3>
                    </div>
                    <span className={"text-sm " + (visScenarioanalyse ? "text-blue-200" : "text-gray-400")}>
                      {visScenarioanalyse ? 'Skjul' : 'Tre mulige utfall basert på porteføljens sammensetning'}
                    </span>
                  </button>
                  {visScenarioanalyse && (
                    <div className="p-6 space-y-5 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 italic">Tre mulige utfall over {horisont} år basert på historiske mønstre og porteføljens sammensetning</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showPessimisticLosninger} onChange={(e) => setShowPessimisticLosninger(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                          <span className="text-sm text-gray-500">Vis pessimistisk scenario</span>
                        </label>
                      </div>

                      {/* Scenario cards */}
                      <div className={"grid gap-5 " + (showPessimisticLosninger ? "grid-cols-3" : "grid-cols-2")}>
                        {showPessimisticLosninger && (() => {
                          const s = scenarioer[0];
                          const { verdi: _slutt, nettoKontantstrom: _faktiskKs } = fremskrivMedKontantstrom(kapital, s.avk, horisont, nettoKontantstrom);
                          const sluttverdi = Math.round(_slutt);
                          const gevinst = sluttverdi - kapital - _faktiskKs; // avkastning, ekskl. innskudd og uttak som faktisk ble gjennomført
                          return (
                            <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden shadow-sm">
                              <div className="w-full h-1.5" style={{ backgroundColor: s.borderColor }}></div>
                              <div className="p-5 space-y-3">
                                <div>
                                  <h3 className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{s.tittel}</h3>
                                  <p className="text-xs text-gray-400">{s.undertittel}</p>
                                </div>
                                <div>
                                  <p className="text-4xl font-bold text-red-700">{formatPercent(s.avk)}</p>
                                  <input type="range" min="-10" max={baseAvk} step="0.5" value={s.avk}
                                    onChange={(e) => setScenarioLosninger(p => ({...p, pessimistisk: parseFloat(e.target.value)}))}
                                    className="w-full h-2 bg-red-200 rounded-lg cursor-pointer mt-2" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-500">Sluttverdi</p>
                                  <p className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatSluttverdi(sluttverdi)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-red-100">
                                  <div><div className="text-xs text-red-400">Gevinst/tap</div><div className="font-semibold text-red-700 text-sm">{formatCurrency(gevinst)}</div></div>
                                  <div><div className="text-xs text-red-400">CAGR</div><div className="font-semibold text-red-700 text-sm">{formatPercent(s.avk)}</div></div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.beskrivelse}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Hovedscenario - locked to portfolio weighted return */}
                        {(() => {
                          const s = scenarioer[1];
                          const { verdi: _slutt, nettoKontantstrom: _faktiskKs } = fremskrivMedKontantstrom(kapital, s.avk, horisont, nettoKontantstrom);
                          const sluttverdi = Math.round(_slutt);
                          const gevinst = sluttverdi - kapital - _faktiskKs; // avkastning, ekskl. innskudd og uttak som faktisk ble gjennomført
                          return (
                            <div className="rounded-xl border-2 overflow-hidden shadow-sm" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#0D2240' }}>
                              <div className="w-full h-1.5" style={{ backgroundColor: s.borderColor }}></div>
                              <div className="p-5 space-y-3">
                                <div>
                                  <h3 className="text-lg font-bold text-white">{s.tittel}</h3>
                                  <p className="text-xs text-blue-300">{s.undertittel}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-blue-400">Sluttverdi</p>
                                  <p className="text-4xl font-bold text-white">{formatSluttverdi(sluttverdi)}</p>
                                  <p className="text-blue-300 text-sm">etter {horisont} år</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-800">
                                  <div><div className="text-xs text-blue-400">Gevinst/tap</div><div className="font-semibold text-white text-sm">{formatCurrency(gevinst)}</div></div>
                                  <div><div className="text-xs text-blue-400">CAGR</div><div className="font-semibold text-white text-sm">{formatPercent(s.avk)}</div></div>
                                </div>
                                <p className="text-xs text-blue-300 leading-relaxed">{s.beskrivelse}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Optimistisk - with slider */}
                        {(() => {
                          const s = scenarioer[2];
                          const { verdi: _slutt, nettoKontantstrom: _faktiskKs } = fremskrivMedKontantstrom(kapital, s.avk, horisont, nettoKontantstrom);
                          const sluttverdi = Math.round(_slutt);
                          const gevinst = sluttverdi - kapital - _faktiskKs; // avkastning, ekskl. innskudd og uttak som faktisk ble gjennomført
                          return (
                            <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden shadow-sm">
                              <div className="w-full h-1.5" style={{ backgroundColor: s.borderColor }}></div>
                              <div className="p-5 space-y-3">
                                <div>
                                  <h3 className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{s.tittel}</h3>
                                  <p className="text-xs text-gray-400">{s.undertittel}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-500">Sluttverdi</p>
                                  <p className="text-4xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatSluttverdi(sluttverdi)}</p>
                                  <p className="text-green-500 text-sm">etter {horisont} år</p>
                                </div>
                                <div>
                                  <input type="range" min={baseAvk} max="25" step="0.5" value={s.avk}
                                    onChange={(e) => setScenarioLosninger(p => ({...p, optimistisk: parseFloat(e.target.value)}))}
                                    className="w-full h-2 bg-green-200 rounded-lg cursor-pointer" />
                                  <div className="text-center font-bold text-green-600 mt-1">{formatPercent(s.avk)} p.a.</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-green-100">
                                  <div><div className="text-xs text-green-400">Gevinst/tap</div><div className="font-semibold text-green-700 text-sm">{formatCurrency(gevinst)}</div></div>
                                  <div><div className="text-xs text-green-400">CAGR</div><div className="font-semibold text-green-700 text-sm">{formatPercent(s.avk)}</div></div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.beskrivelse}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Scenario projection chart */}
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                        <h4 className="text-sm font-semibold mb-4" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet utvikling over {horisont} år</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={scData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(0).replace('.', ',') + 'M' : (v / 1000).toFixed(0) + 'k'} />
                            <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `År ${l}`} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            <Area type="monotone" dataKey="optimistisk" name="Optimistisk" stroke="#059669" fill="#05966915" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                            <Area type="monotone" dataKey="hoved" name="Hovedscenario" stroke={PENSUM_COLORS.darkBlue} fill={PENSUM_COLORS.darkBlue + '20'} strokeWidth={2.5} dot={false} />
                            {showPessimisticLosninger && <Area type="monotone" dataKey="pessimistisk" name="Pessimistisk" stroke="#DC2626" fill="#DC262610" strokeWidth={2} strokeDasharray="6 3" dot={false} />}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <p className="text-[10px] text-gray-400 italic">Scenarioene er modellbaserte illustrasjoner. Faktisk avkastning vil kunne avvike vesentlig.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Avkastningsestimat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Avkastningsestimat</h3>
                <p className="text-xs text-blue-200 mt-0.5">Forventet avkastning er basert på CMA-metodikk (BlackRock, Vanguard, J.P. Morgan + nordisk overlay). Historiske tall er beregnet fra månedlig kursutvikling.</p>
              </div>
              <div className="p-6">
                {/* Vektet porteføljeavkastning */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                  <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum-forslagets historiske avkastning</h4>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    {[
                      { aar: '2026 YTD', key: 'aar2026' },
                      { aar: '2025', key: 'aar2025' },
                      { aar: '2024', key: 'aar2024' },
                      { aar: '2023', key: 'aar2023' },
                      { aar: '2022', key: 'aar2022' }
                    ].map(({ aar, key }) => (
                      <div key={aar}>
                        <p className="text-xs text-gray-500 mb-1">{aar}</p>
                        <p className={"text-lg font-bold " + (erGyldigTall(beregnPensumHistorikk[key]) ? (beregnPensumHistorikk[key] >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>
                          {erGyldigTall(beregnPensumHistorikk[key]) ? (beregnPensumHistorikk[key] >= 0 ? '+' : '') + beregnPensumHistorikk[key].toFixed(1).replace('.', ',') + ' %' : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabell med alle produkter */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <th className="py-3 px-4 text-left text-white">Navn</th>
                        <th className="py-3 px-3 text-right text-white">Vekt</th>
                        <th className="py-3 px-3 text-right text-white">2026 YTD</th>
                        <th className="py-3 px-3 text-right text-white">2025</th>
                        <th className="py-3 px-3 text-right text-white">2024</th>
                        <th className="py-3 px-3 text-right text-white">2023</th>
                        <th className="py-3 px-3 text-right text-white">2022</th>
                        <th className="py-3 px-3 text-right text-white">Årlig 3 år</th>
                        <th className="py-3 px-3 text-right text-white">Risiko 3 år</th>
                        <th className="py-3 px-2 text-right text-white" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>Sharpe</th>
                        <th className="py-3 px-2 text-right text-white">Maks DD</th>
                        <th className="py-3 px-3 text-right text-white" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>Forv. avk.</th>
                        <th className="py-3 px-3 text-right text-white">Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Vektet totalrad */}
                      {pensumAllokering.length > 0 && (() => {
                        const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                        const vektetYield = (() => {
                          let sum = 0; let totalV = 0;
                          pensumAllokering.forEach(a => {
                            const p = alleProdukt.find(pp => pp.id === a.id);
                            const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
                            if (erGyldigTall(y) && a.vekt > 0) { sum += y * a.vekt; totalV += a.vekt; }
                          });
                          return totalV > 0 ? sum / totalV : null;
                        })();
                        // 3-års nøkkeltall for porteføljen som helhet (daglig rebalansert, siste 3 år).
                        const portStat3 = beregnPortefoljeStatistikk(pensumAllokering, produktHistorikk, periodeStartDato(3));
                        return (
                          <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                            <td className="py-3 px-4 font-bold text-white">Vektet portefølje</td>
                            <td className="py-3 px-3 text-right text-white font-bold">{pensumTotalVekt.toFixed(0).replace('.', ',')} %</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2026) ? (beregnPensumHistorikk.aar2026 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2026) ? beregnPensumHistorikk.aar2026.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2025) ? (beregnPensumHistorikk.aar2025 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2025) ? beregnPensumHistorikk.aar2025.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2024) ? (beregnPensumHistorikk.aar2024 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2024) ? beregnPensumHistorikk.aar2024.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2023) ? (beregnPensumHistorikk.aar2023 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2023) ? beregnPensumHistorikk.aar2023.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2022) ? (beregnPensumHistorikk.aar2022 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2022) ? beregnPensumHistorikk.aar2022.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className="py-3 px-3 text-right text-white font-bold">{erGyldigTall(portStat3?.aarlig) ? portStat3.aarlig.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className="py-3 px-3 text-right text-white font-bold">{erGyldigTall(portStat3?.risiko) ? portStat3.risiko.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className="py-3 px-2 text-right text-white font-bold" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>{erGyldigTall(portStat3?.sharpe) ? portStat3.sharpe.toFixed(2).replace('.', ',') : '—'}</td>
                            <td className="py-3 px-2 text-right text-red-300 font-bold">{erGyldigTall(portStat3?.maxDrawdown) ? portStat3.maxDrawdown.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            <td className="py-3 px-3 text-right font-bold text-white" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>{formatPercent(pensumForventetAvkastning)}</td>
                            <td className="py-3 px-3 text-right font-bold text-white">{erGyldigTall(vektetYield) ? vektetYield.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          </tr>
                        );
                      })()}
                      <tr className="bg-gray-100">
                        <td colSpan="13" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>ENKELTFOND</td>
                      </tr>
                      {pensumProdukter.enkeltfond.map((p, idx) => {
                        const aar2026 = hentAarsverdiForProdukt(p, 'aar2026', 2026);
                        const aar2025 = hentAarsverdiForProdukt(p, 'aar2025', 2025);
                        const aar2024 = hentAarsverdiForProdukt(p, 'aar2024', 2024);
                        const aar2023 = hentAarsverdiForProdukt(p, 'aar2023', 2023);
                        const aar2022 = hentAarsverdiForProdukt(p, 'aar2022', 2022);
                        const allok = pensumAllokering.find(a => a.id === p.id);
                        const fAvk = p.forventetAvkastning ?? produktRapportMeta?.[p.id]?.expectedReturn;
                        const fYield = p.forventetYield ?? produktRapportMeta?.[p.id]?.expectedYield;
                        const pStat = beregnProduktStatistikk(produktHistorikk[p.id], periodeStartDato(3));
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}{p.kortHistorikk && <sup title="Kort historikk - tall kan være estimerte" className="text-amber-600">*</sup>}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }, produktHistorikk?.[p.id]); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td></>; })()}
                          <td className="py-2 px-2 text-right" style={{ borderLeft: '2px solid #E5E7EB' }}>{pStat ? <span className={"font-semibold px-1.5 py-0.5 rounded text-xs " + (pStat.sharpe >= 1 ? "bg-green-100 text-green-700" : pStat.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{pStat.sharpe.toFixed(2).replace('.', ',')}</span> : '—'}</td>
                          <td className="py-2 px-2 text-right text-red-600 text-xs font-medium">{pStat ? pStat.maxDrawdown.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                        </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan="13" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>FONDSPORTEFØLJER</td>
                      </tr>
                      {pensumProdukter.fondsportefoljer.map((p, idx) => {
                        const aar2026 = hentAarsverdiForProdukt(p, 'aar2026', 2026);
                        const aar2025 = hentAarsverdiForProdukt(p, 'aar2025', 2025);
                        const aar2024 = hentAarsverdiForProdukt(p, 'aar2024', 2024);
                        const aar2023 = hentAarsverdiForProdukt(p, 'aar2023', 2023);
                        const aar2022 = hentAarsverdiForProdukt(p, 'aar2022', 2022);
                        const allok = pensumAllokering.find(a => a.id === p.id);
                        const fAvk = p.forventetAvkastning ?? produktRapportMeta?.[p.id]?.expectedReturn;
                        const fYield = p.forventetYield ?? produktRapportMeta?.[p.id]?.expectedYield;
                        const pStat = beregnProduktStatistikk(produktHistorikk[p.id], periodeStartDato(3));
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}{p.kortHistorikk && <sup title="Kort historikk - tall kan være estimerte" className="text-amber-600">*</sup>}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }, produktHistorikk?.[p.id]); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td></>; })()}
                          <td className="py-2 px-2 text-right" style={{ borderLeft: '2px solid #E5E7EB' }}>{pStat ? <span className={"font-semibold px-1.5 py-0.5 rounded text-xs " + (pStat.sharpe >= 1 ? "bg-green-100 text-green-700" : pStat.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{pStat.sharpe.toFixed(2).replace('.', ',')}</span> : '—'}</td>
                          <td className="py-2 px-2 text-right text-red-600 text-xs font-medium">{pStat ? pStat.maxDrawdown.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                        </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan="13" className="py-2 px-4 font-semibold text-xs text-teal-700">EKSTERNE FOND</td>
                      </tr>
                      {(pensumProdukter.eksterneFond || []).map((p, idx) => {
                        const aar2026 = hentAarsverdiForProdukt(p, 'aar2026', 2026);
                        const aar2025 = hentAarsverdiForProdukt(p, 'aar2025', 2025);
                        const aar2024 = hentAarsverdiForProdukt(p, 'aar2024', 2024);
                        const aar2023 = hentAarsverdiForProdukt(p, 'aar2023', 2023);
                        const aar2022 = hentAarsverdiForProdukt(p, 'aar2022', 2022);
                        const allok = pensumAllokering.find(a => a.id === p.id);
                        const fAvk = p.forventetAvkastning ?? produktRapportMeta?.[p.id]?.expectedReturn;
                        const fYield = p.forventetYield ?? produktRapportMeta?.[p.id]?.expectedYield;
                        const pStat = beregnProduktStatistikk(produktHistorikk[p.id], periodeStartDato(3));
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}{p.kortHistorikk && <sup title="Kort historikk - tall kan være estimerte" className="text-amber-600">*</sup>}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }, produktHistorikk?.[p.id]); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1).replace('.', ',') + ' %' : '—'}</td></>; })()}
                          <td className="py-2 px-2 text-right" style={{ borderLeft: '2px solid #E5E7EB' }}>{pStat ? <span className={"font-semibold px-1.5 py-0.5 rounded text-xs " + (pStat.sharpe >= 1 ? "bg-green-100 text-green-700" : pStat.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{pStat.sharpe.toFixed(2).replace('.', ',')}</span> : '—'}</td>
                          <td className="py-2 px-2 text-right text-red-600 text-xs font-medium">{pStat ? pStat.maxDrawdown.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                        </tr>
                        );
                      })}
                      {visAlternative && (
                        <>
                          <tr className="bg-amber-100">
                            <td colSpan="13" className="py-2 px-4 font-semibold text-xs text-amber-700">ALTERNATIVE INVESTERINGER (ILLIKVIDE)</td>
                          </tr>
                          {pensumProdukter.alternative.map((p, idx) => {
                            const allok = pensumAllokering.find(a => a.id === p.id);
                            const fAvk = p.forventetAvkastning;
                            const fYield = p.forventetYield;
                            return (
                            <tr key={p.id} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                              <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}{p.kortHistorikk && <sup title="Kort historikk - tall kan være estimerte" className="text-amber-600">*</sup>}</td>
                              <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-2 text-right text-gray-400" style={{ borderLeft: '2px solid #E5E7EB' }}>—</td>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                              <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1).replace('.', ',') + ' %' : '—'}</td>
                            </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-gray-700 space-y-1.5">
                  <p><sup className="text-amber-600 font-bold">*</sup> Kort historikk: avkastningstall er estimerte eller mangler for hele perioden.</p>
                  <p><strong>Forventet avkastning</strong> er basert på CMA-metodikk (Capital Market Assumptions) — institusjonell konsensus fra <a href="https://www.blackrock.com/us/financial-professionals/insights/capital-market-assumptions" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">BlackRock</a>, <a href="https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">Vanguard</a> og <a href="https://am.jpmorgan.com/content/dam/jpm-am-aem/americas/us/en/institutional/insights/portfolio-insights/ltcma-full-report.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">J.P. Morgan Asset Management</a>, supplert med en eksplisitt nordisk/norsk overlay. Se metodikkdokumentasjon for full beskrivelse.</p>
                </div>
                <div className="mt-4">{renderHistorikkDisclaimer()}</div>
              </div>
            </div>

            {/* Renters rente-effekt */}
            {(() => {
              const sluttverdi = pensumPrognose[pensumPrognose.length - 1]?.total || 0;
              const baseAvk = pensumForventetAvkastning;
              const nettoKS = nettoKontantstrom - (pbAkkumulerRenter ? 0 : pbAarligRentekostnad);
              // Enkel (lineær) avkastning: avkastning bare på opprinnelig kapital hvert år
              let enkel = pbEffektivtInvestertBelop;
              for (let y = 1; y <= horisont; y++) {
                enkel += pbEffektivtInvestertBelop * (baseAvk / 100) + nettoKS;
              }
              const enkelAvkastning = enkel - pbEffektivtInvestertBelop - nettoKS * horisont;
              const compoundAvkastning = sluttverdi - pbEffektivtInvestertBelop - nettoKS * horisont;
              const compoundBidrag = compoundAvkastning - enkelAvkastning;
              const ratio = enkelAvkastning > 0 ? (compoundBidrag / enkelAvkastning) * 100 : 0;
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Renters rente-effekt</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-xs text-blue-600 font-medium mb-1">Investert kapital</div>
                        <div className="text-lg font-bold text-blue-900 tabular-nums">{formatCurrency(pbEffektivtInvestertBelop)}</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-xs text-amber-600 font-medium mb-1">Enkel avkastning</div>
                        <div className="text-lg font-bold text-amber-900 tabular-nums">{formatCurrency(enkelAvkastning)}</div>
                        <div className="text-xs text-amber-500 mt-0.5">Uten renters rente</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="text-xs text-emerald-600 font-medium mb-1">Renters rente (isolert)</div>
                        <div className="text-lg font-bold text-emerald-900 tabular-nums">{formatCurrency(compoundBidrag)}</div>
                        <div className="text-xs text-emerald-500 mt-0.5">Compound-effekten alene</div>
                      </div>
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F8' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Sluttverdi</div>
                        <div className="text-lg font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(sluttverdi)}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Etter {horisont} år</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-gray-700 leading-relaxed">
                      Med {formatPercent(baseAvk)} årlig avkastning og renters rente gir <strong>{formatCurrency(pbEffektivtInvestertBelop)}</strong> investert en sluttverdi på <strong>{formatCurrency(sluttverdi)}</strong>. Av totalavkastningen på <strong>{formatCurrency(compoundAvkastning)}</strong> er <strong className="text-emerald-700">{formatCurrency(compoundBidrag)}</strong> ren compound-effekt — avkastning på tidligere års avkastning{ratio > 0 ? ` (${ratio.toFixed(0).replace('.', ',')} % mer enn enkel avkastning)` : ''}.
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
            )}

            {pbGruppeHode('historikk', 'Historikk og risiko', 'Sammenligning mot indekser, nedsiderisiko og avkastning mot risiko')}
            {pbGrupper.historikk && (
            <div className="space-y-6">
            {/* ====== SAMMENLIGN PORTEFØLJE MOT BENCHMARKS ====== */}
            {(() => {
              const PORT_COMP_INDEKS_CONFIG = {
                'MSCI World': { farge: PENSUM_COLORS.lightBlue, feedKey: 'msci-world' },
                // Oslo Børs får distinkt orange farge så den ikke smelter sammen med Pensum-forslaget (navy)
                'Oslo Børs': { farge: '#D97706', feedKey: 'oslo-bors' },
                'MSCI ACWI': { farge: PENSUM_COLORS.salmon, feedKey: 'msci-acwi' },
                'S&P 500': { farge: PENSUM_COLORS.teal, feedKey: 'sp500' },
                'MSCI Europe': { farge: PENSUM_COLORS.gold, feedKey: 'msci-europe' },
                'MSCI EM': { farge: PENSUM_COLORS.purple, feedKey: 'msci-em' },
                'Norske Statsobl.': { farge: PENSUM_COLORS.gray, feedKey: 'norske-statsobl' },
              };

              const PORT_COMP_PROD_CONFIG = [
                { label: 'Basis', id: 'basis', farge: PENSUM_COLORS.salmon },
                { label: 'Fin. Opp.', id: 'financial-d', farge: PENSUM_COLORS.gray },
                { label: 'Global Core Active', id: 'global-core-active', farge: PENSUM_COLORS.navy },
                { label: 'Global Edge', id: 'global-edge', farge: PENSUM_COLORS.lightBlue },
                { label: 'Global Energy', id: 'energy-a', farge: PENSUM_COLORS.gold },
                { label: 'Global Høyrente', id: 'global-hoyrente', farge: PENSUM_COLORS.teal },
                { label: 'Nordic Banking', id: 'banking-d', farge: PENSUM_COLORS.midBlue },
                { label: 'Nordisk Høyrente', id: 'nordisk-hoyrente', farge: PENSUM_COLORS.purple },
                { label: 'Norske Aksjer', id: 'norge-a', farge: PENSUM_COLORS.red }
              ];

              // Beregn startdato fra periodevalg
              const compStartDato = (() => {
                const now = RAPPORT_DATO_OBJEKT;
                const p = portCompPeriode;
                if (p === '1M') return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                if (p === '3M') return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                if (p === '6M') return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                if (p === 'YTD') return new Date(now.getFullYear(), 0, 1);
                if (p === '1Å') return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                if (p === '3Å') return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
                if (p === '5Å') return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
                return new Date(2015, 0, 1);
              })();

              // Bygg sammenligningsdata
              const byggPortCompData = () => {
                const serieMap = {};

                // 1. Vektet portefølje fra pensumAllokering
                const valgteProdIds = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
                const totalVekt = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;
                if (valgteProdIds.length > 0) {
                  const produktSerier = {};
                  valgteProdIds.forEach(id => {
                    const hist = produktHistorikk?.[id];
                    if (!hist?.data?.length) return;
                    const maanedlig = byggMaanedssluttSerie(hist.data);
                    const filtrert = maanedlig.filter(d => {
                      const dato = parseHistorikkDato(d.dato);
                      return dato && dato >= compStartDato;
                    });
                    if (filtrert.length > 0) {
                      const startVerdi = filtrert[0].verdi;
                      produktSerier[id] = {};
                      filtrert.forEach(d => {
                        produktSerier[id][d.dato] = startVerdi > 0 ? ((d.verdi / startVerdi) - 1) * 100 : 0;
                      });
                    }
                  });
                  const portDatoer = new Set();
                  Object.values(produktSerier).forEach(map => Object.keys(map).forEach(d => portDatoer.add(d)));
                  const portSortert = Array.from(portDatoer).sort();
                  const portSerie = [];
                  portSortert.forEach(dato => {
                    let vektetVerdi = 0; let totalProdVekt = 0;
                    valgteProdIds.forEach(id => {
                      if (produktSerier[id]?.[dato] !== undefined) {
                        const allok = pensumAllokering.find(a => a.id === id);
                        if (allok) {
                          vektetVerdi += produktSerier[id][dato] * (allok.vekt / totalVekt);
                          totalProdVekt += allok.vekt / totalVekt;
                        }
                      }
                    });
                    if (totalProdVekt > 0) {
                      portSerie.push({ dato, indeksert: parseFloat((vektetVerdi / totalProdVekt).toFixed(2)) });
                    }
                  });
                  if (portSerie.length > 0) serieMap['Pensum-forslaget'] = portSerie;
                }

                // 2. Referanseindekser
                portCompIndekser.forEach(n => {
                  const cfg = PORT_COMP_INDEKS_CONFIG[n];
                  if (!cfg) return;
                  const hist = DATAFEED_INDEKS_HISTORIKK?.[cfg.feedKey];
                  if (!hist?.data?.length) return;
                  const maanedlig = byggMaanedssluttSerie(hist.data);
                  const filtrert = maanedlig.filter(d => {
                    const dato = parseHistorikkDato(d.dato);
                    return dato && dato >= compStartDato;
                  });
                  if (filtrert.length > 0) {
                    const startVerdi = filtrert[0].verdi;
                    serieMap[n] = filtrert.map(d => ({
                      dato: d.dato,
                      indeksert: startVerdi > 0 ? parseFloat((((d.verdi / startVerdi) - 1) * 100).toFixed(2)) : 0
                    }));
                  }
                });

                // 3. Valgfrie enkeltprodukter
                portCompVisProdukter.forEach(label => {
                  const cfg = PORT_COMP_PROD_CONFIG.find(c => c.label === label);
                  if (!cfg) return;
                  const hist = produktHistorikk?.[cfg.id];
                  if (!hist?.data?.length) return;
                  const maanedlig = byggMaanedssluttSerie(hist.data);
                  const filtrert = maanedlig.filter(d => {
                    const dato = parseHistorikkDato(d.dato);
                    return dato && dato >= compStartDato;
                  });
                  if (filtrert.length > 0) {
                    const startVerdi = filtrert[0].verdi;
                    serieMap[label] = filtrert.map(d => ({
                      dato: d.dato,
                      indeksert: startVerdi > 0 ? parseFloat((((d.verdi / startVerdi) - 1) * 100).toFixed(2)) : 0
                    }));
                  }
                });

                // Samle alle datoer
                const alleDatoer = new Set();
                Object.values(serieMap).forEach(serie => serie.forEach(d => alleDatoer.add(d.dato)));
                const sorterteDatoer = Array.from(alleDatoer).sort();
                return sorterteDatoer.map(dato => {
                  const punkt = { dato };
                  Object.entries(serieMap).forEach(([n, serie]) => {
                    const match = serie.find(d => d.dato === dato);
                    if (match) punkt[n] = match.indeksert;
                  });
                  return punkt;
                });
              };

              const compData = byggPortCompData();
              const alleCompNavn = [
                ...(pensumAllokering.some(a => a.vekt > 0) ? ['Pensum-forslaget'] : []),
                ...portCompIndekser,
                ...portCompVisProdukter
              ];

              const getFarge = (n) => {
                if (n === 'Pensum-forslaget') return '#1B3A5F';
                if (PORT_COMP_INDEKS_CONFIG[n]) return PORT_COMP_INDEKS_CONFIG[n].farge;
                const prod = PORT_COMP_PROD_CONFIG.find(c => c.label === n);
                return prod?.farge || '#999';
              };

              // Nedsiderisiko: fall fra forrige topp på daglige kurser, for samme periode og
              // samme serier som sammenligningen over.
              const nedside = (() => {
                const startDato = portCompPeriode === 'max' ? null : compStartDato;
                const serier = [];
                if (pensumAllokering.some(a => a.vekt > 0)) {
                  const f = beregnFallFraTopp(byggPortefoljeSerie(pensumAllokering, produktHistorikk, startDato));
                  if (f) serier.push({ navn: 'Pensum-forslaget', ...f });
                }
                portCompIndekser.forEach(n => {
                  const f = beregnFallFraTopp(DATAFEED_INDEKS_HISTORIKK?.[PORT_COMP_INDEKS_CONFIG[n]?.feedKey]?.data, startDato);
                  if (f) serier.push({ navn: n, ...f });
                });
                portCompVisProdukter.forEach(label => {
                  const f = beregnFallFraTopp(produktHistorikk?.[PORT_COMP_PROD_CONFIG.find(c => c.label === label)?.id]?.data, startDato);
                  if (f) serier.push({ navn: label, ...f });
                });
                if (!serier.length) return null;
                // Felles tidsakse. Hver bøtte viser det dypeste fallet i bøtta, så bunnene ikke forsvinner.
                const perDato = new Map();
                serier.forEach(x => x.serie.forEach(d => { if (!perDato.has(d.dato)) perDato.set(d.dato, {}); perDato.get(d.dato)[x.navn] = d.fall; }));
                const datoer = [...perDato.keys()].sort((x, y) => parseHistorikkDato(x) - parseHistorikkDato(y));
                const botte = Math.max(1, Math.ceil(datoer.length / 320));
                const data = [];
                for (let i = 0; i < datoer.length; i += botte) {
                  const del = datoer.slice(i, i + botte);
                  const punkt = { dato: del[del.length - 1] };
                  del.forEach(d => Object.entries(perDato.get(d)).forEach(([n, v]) => { punkt[n] = punkt[n] === undefined ? v : Math.min(punkt[n], v); }));
                  data.push(punkt);
                }
                // Y-aksen går til nærmeste hele trinn under det dypeste fallet.
                const dypest = Math.min(...serier.map(x => x.storsteFall));
                const trinn = dypest < -40 ? 10 : dypest < -8 ? 5 : dypest < -3 ? 2 : 1;
                const bunn = Math.min(-trinn, Math.floor(dypest / trinn) * trinn);
                const ticks = []; for (let v = 0; v >= bunn; v -= trinn) ticks.push(v);
                return { serier, data, bunn, ticks };
              })();
              const MND_KORT = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
              const mndAar = (dato) => { const d = parseHistorikkDato(dato); return d ? `${MND_KORT[d.getMonth()]} ${d.getFullYear()}` : ''; };
              const pstFall = (v) => (Math.abs(v) < 0.05 ? '0,0' : '−' + Math.abs(v).toFixed(1).replace('.', ',')) + ' %';
              const innhenting = (x) => {
                if (!x.bunnDato) return 'Ingen fall i perioden';
                if (!x.hentetInnDato) return 'Ikke hentet inn ennå';
                const mnd = Math.max(1, Math.round((parseHistorikkDato(x.hentetInnDato) - parseHistorikkDato(x.bunnDato)) / (86400000 * 30.44)));
                return `Hentet inn på ${mnd} md.`;
              };
              const periodeTekst = { '1M': 'Siste måned', '3M': 'Siste 3 måneder', '6M': 'Siste 6 måneder', 'YTD': 'Hittil i år', '1Å': 'Siste år', '3Å': 'Siste 3 år', '5Å': 'Siste 5 år', 'max': 'Hele historikken' }[portCompPeriode];

              return (
                <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5">
                    <h3 className="text-xl font-bold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Sammenlign portefølje mot benchmarks</h3>
                    <p className="text-sm text-gray-500 mb-4">Historisk prosentvis avkastning fra startpunkt — Pensum-forslaget vs. referanseindekser</p>

                    {/* Periodeknapper */}
                    <div className="flex items-center gap-2 mb-4">
                      {['1M','3M','6M','YTD','1Å','3Å','5Å','Maks'].map(p => {
                        const key = p === 'Maks' ? 'max' : p;
                        return (
                          <button key={p} onClick={() => setPortCompPeriode(key)}
                            className={"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors " + (portCompPeriode === key ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                            style={portCompPeriode === key ? { backgroundColor: PENSUM_COLORS.darkBlue } : {}}>
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pensum-forslaget indikator */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pensum-forslaget</div>
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 text-white w-fit"
                        style={{ backgroundColor: '#1B3A5F', borderColor: '#1B3A5F' }}>
                        <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                        Pensum-forslaget (vektet)
                      </div>
                    </div>

                    {/* Referanseindekser */}
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Referanseindekser</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PORT_COMP_INDEKS_CONFIG).map(([n, cfg]) => {
                          const aktiv = portCompIndekser.includes(n);
                          return (
                            <button key={n}
                              onClick={() => setPortCompIndekser(prev => aktiv ? prev.filter(x => x !== n) : [...prev, n])}
                              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                              style={aktiv ? { backgroundColor: cfg.farge, borderColor: cfg.farge } : {}}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : cfg.farge }}></span>
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pensums enkeltløsninger */}
                    <div className="mb-5">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pensums enkeltløsninger</div>
                      <div className="flex flex-wrap gap-2">
                        {PORT_COMP_PROD_CONFIG.map(({ label, farge }) => {
                          const aktiv = portCompVisProdukter.includes(label);
                          return (
                            <button key={label}
                              onClick={() => setPortCompVisProdukter(prev => aktiv ? prev.filter(x => x !== label) : [...prev, label])}
                              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                              style={aktiv ? { backgroundColor: farge, borderColor: farge } : {}}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : farge }}></span>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Linjegraf */}
                    {alleCompNavn.length > 0 && compData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={380}>
                        <LineChart data={compData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                            tickFormatter={(d) => { const p = parseHistorikkDato(d); if (!p) return ''; return `${String(p.getMonth()+1).padStart(2,'0')}/${String(p.getFullYear()).slice(2)}`; }}
                            interval={Math.max(1, Math.floor(compData.length / 12))} />
                          <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + ' %'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step, Math.ceil(dataMax / step) * step]; }} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                            labelFormatter={(d) => formatHistorikkEtikett(d)}
                            formatter={(v, n) => [v?.toFixed(1).replace('.', ',') + ' %', n]} />
                          <Legend verticalAlign="bottom" height={36} />
                          <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" />
                          {alleCompNavn.map(n => {
                            const erPortefolje = n === 'Pensum-forslaget' || n === 'Pensum-forslaget';
                            const erIndeks = !!PORT_COMP_INDEKS_CONFIG[n];
                            return (
                              <Line key={n} type="monotone" dataKey={n} stroke={getFarge(n)}
                                strokeWidth={erPortefolje ? 3 : erIndeks ? 1.5 : 2} dot={false} activeDot={{ r: erPortefolje ? 5 : 4 }}
                                strokeDasharray={erIndeks ? '4 3' : undefined} connectNulls />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                        {pensumAllokering.some(a => a.vekt > 0) ? 'Velg indekser eller fond for å se sammenligning' : 'Legg til produkter med vekt i porteføljen for å se sammenligning'}
                      </div>
                    )}
                  </div>
                </div>

                {nedside && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-nedsiderisiko>
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Nedsiderisiko</h3>
                          <p className="text-sm text-gray-500">Hvor mye verdien har falt fra forrige topp. Følger perioden og seriene som er valgt over.</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap" style={{ backgroundColor: '#F1F5F9', color: PENSUM_COLORS.darkBlue }}>{periodeTekst}</span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        {nedside.serier.map(x => {
                          const erPort = x.navn === 'Pensum-forslaget';
                          return (
                            <div key={x.navn} className="rounded-lg px-4 py-3" style={erPort ? { backgroundColor: PENSUM_COLORS.darkBlue } : { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                              <div className={"flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider " + (erPort ? "text-blue-200" : "text-gray-500")}>
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: erPort ? '#FFFFFF' : getFarge(x.navn) }}></span>
                                <span className="truncate">{x.navn}</span>
                              </div>
                              <div className={"text-2xl font-bold tabular-nums mt-1 " + (erPort ? "text-white" : "")} style={erPort ? {} : { color: PENSUM_COLORS.darkBlue }}>{pstFall(x.storsteFall)}</div>
                              <div className={"text-[11px] mt-0.5 " + (erPort ? "text-blue-100" : "text-gray-500")}>
                                {x.bunnDato ? <>Største fall · {mndAar(x.toppDato)}{mndAar(x.toppDato) !== mndAar(x.bunnDato) ? ` – ${mndAar(x.bunnDato)}` : ''}</> : 'Største fall'}
                              </div>
                              <div className={"text-[11px] " + (erPort ? "text-blue-200" : "text-gray-400")}>
                                {innhenting(x)}{x.bunnDato && Math.abs(x.fallNaa) >= 0.05 ? ` · nå ${pstFall(x.fallNaa)}` : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={nedside.data} margin={{ top: 5, right: 30, left: 0, bottom: 10 }}>
                          <defs>
                            <linearGradient id="nedsideFyll" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1B3A5F" stopOpacity={0.05} />
                              <stop offset="100%" stopColor="#1B3A5F" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#EEF2F6" vertical={false} />
                          <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }}
                            tickFormatter={mndAar} interval={Math.max(1, Math.floor(nedside.data.length / 9))} />
                          <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} width={48}
                            tickFormatter={v => Math.round(v) + ' %'} domain={[nedside.bunn, 0]} ticks={nedside.ticks} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                            labelFormatter={(d) => formatHistorikkEtikett(d)}
                            formatter={(v, n) => [pstFall(v), n]} />
                          <Legend verticalAlign="bottom" height={36} iconType="plainline" wrapperStyle={{ fontSize: '12px' }} />
                          <ReferenceLine y={0} stroke="#9CA3AF" />
                          {nedside.serier.map(x => x.navn === 'Pensum-forslaget' ? (
                            <Area key={x.navn} type="monotone" dataKey={x.navn} stroke="#1B3A5F" strokeWidth={2.5} fill="url(#nedsideFyll)" baseValue={0} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
                          ) : (
                            <Line key={x.navn} type="monotone" dataKey={x.navn} stroke={getFarge(x.navn)} strokeWidth={1.5} strokeDasharray={PORT_COMP_INDEKS_CONFIG[x.navn] ? '4 3' : undefined} dot={false} activeDot={{ r: 3 }} connectNulls isAnimationActive={false} />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-gray-400 mt-2">
                        Beregnet på daglige kurser. 0 % betyr at verdien er på topp i perioden.
                        {(() => { const port = nedside.serier.find(x => x.navn === 'Pensum-forslaget'); const forste = port?.serie[0]?.dato; return forste && (!compStartDato || portCompPeriode === 'max' || parseHistorikkDato(forste) - compStartDato > 10 * 86400000) ? ` Pensum-forslaget har felles historikk fra ${formatHistorikkEtikett(forste)}.` : ''; })()}
                        {' '}Historisk utvikling er ingen garanti for fremtidig utvikling. Kilde: {DATAFEED_KILDE}.
                      </p>
                    </div>
                  </div>
                )}
                </>
              );
            })()}

            {/* Scatter plot: avkastning vs risiko (3 og 5 år) */}
            {(() => {
              const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || [])];
              const valgtePIder = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
              const valgteProdukter = alleProd.filter(p => valgtePIder.includes(p.id));

              const indekser = [
                { navn: 'MSCI World', kortNavn: 'MSCI World', feedKey: 'msci-world', farge: PENSUM_COLORS.lightBlue },
                { navn: 'Oslo Børs', kortNavn: 'Oslo Børs', feedKey: 'oslo-bors', farge: PENSUM_COLORS.salmon },
                { navn: 'Norske Statsobl.', kortNavn: 'Statsobl.', feedKey: 'norske-statsobl', farge: PENSUM_COLORS.gray }
              ];

              const fargePalett = [PENSUM_COLORS.darkBlue, PENSUM_COLORS.teal, PENSUM_COLORS.purple, PENSUM_COLORS.green, PENSUM_COLORS.gold, PENSUM_COLORS.midBlue, '#7C3AED', '#059669'];

              // Build short navn for chart labels
              const kortNavn = (navn) => {
                if (!navn) return '';
                return navn.replace('Pensum ', '').replace(/Index|UCITS|Fund|EUR|USD|NOK|Acc|Class|Hrzn|Glb SC|IU2|Y/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
              };

              // Compute weighted portfolio statistics from actual historikk
              // Approximation: vektet gjennomsnitt av komponentenes avk og vol (uten korrelasjoner)
              const beregnPensumPortStat = (periode) => {
                const start = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - periode, RAPPORT_DATO_OBJEKT.getMonth(), 1);
                let sumVekt = 0, sumAvk = 0, sumVol = 0, harData = false;
                valgteProdukter.forEach(p => {
                  const stat = beregnProduktStatistikk(produktHistorikk[p.id], start);
                  const allokVekt = pensumAllokering.find(a => a.id === p.id)?.vekt || 0;
                  if (stat && erGyldigTall(stat.aarligAvkastning) && erGyldigTall(stat.standardavvik) && allokVekt > 0) {
                    sumVekt += allokVekt;
                    sumAvk += allokVekt * stat.aarligAvkastning;
                    sumVol += allokVekt * stat.standardavvik;
                    harData = true;
                  }
                });
                if (!harData || sumVekt === 0) return null;
                return { x: sumVol / sumVekt, y: sumAvk / sumVekt };
              };

              const data3yr = [];
              const data5yr = [];
              valgteProdukter.forEach((p, i) => {
                const farge = fargePalett[i % fargePalett.length];
                const stat3 = beregnProduktStatistikk(produktHistorikk[p.id], periodeStartDato(3));
                const stat5 = beregnProduktStatistikk(produktHistorikk[p.id], periodeStartDato(5));
                if (stat3 && erGyldigTall(stat3.aarligAvkastning) && erGyldigTall(stat3.standardavvik)) {
                  data3yr.push({ x: stat3.standardavvik, y: stat3.aarligAvkastning, navn: p.navn, label: kortNavn(p.navn), id: p.id, type: 'produkt', farge });
                }
                if (stat5 && erGyldigTall(stat5.aarligAvkastning) && erGyldigTall(stat5.standardavvik)) {
                  data5yr.push({ x: stat5.standardavvik, y: stat5.aarligAvkastning, navn: p.navn, label: kortNavn(p.navn), id: p.id, type: 'produkt', farge });
                }
              });
              indekser.forEach(idx => {
                const hist = DATAFEED_INDEKS_HISTORIKK?.[idx.feedKey];
                if (!hist) return;
                const stat3 = beregnProduktStatistikk(hist, periodeStartDato(3));
                const stat5 = beregnProduktStatistikk(hist, periodeStartDato(5));
                if (stat3 && erGyldigTall(stat3.aarligAvkastning) && erGyldigTall(stat3.standardavvik)) {
                  data3yr.push({ x: stat3.standardavvik, y: stat3.aarligAvkastning, navn: idx.navn, label: idx.kortNavn, id: idx.feedKey, type: 'indeks', farge: idx.farge });
                }
                if (stat5 && erGyldigTall(stat5.aarligAvkastning) && erGyldigTall(stat5.standardavvik)) {
                  data5yr.push({ x: stat5.standardavvik, y: stat5.aarligAvkastning, navn: idx.navn, label: idx.kortNavn, id: idx.feedKey, type: 'indeks', farge: idx.farge });
                }
              });
              // Pensum-portefølje (vektet)
              const portStat3 = beregnPensumPortStat(3);
              const portStat5 = beregnPensumPortStat(5);
              if (portStat3) data3yr.push({ x: portStat3.x, y: portStat3.y, navn: 'Pensum-porteføljen', label: 'Pensum-porteføljen', id: '__portfolio__', type: 'portefolje', farge: PENSUM_COLORS.darkBlue });
              if (portStat5) data5yr.push({ x: portStat5.x, y: portStat5.y, navn: 'Pensum-porteføljen', label: 'Pensum-porteføljen', id: '__portfolio__', type: 'portefolje', farge: PENSUM_COLORS.darkBlue });

              if (data3yr.length === 0 && data5yr.length === 0) return null;

              // Custom shape renderers
              const ProduktDot = (props) => {
                const { cx, cy, fill } = props;
                if (cx == null || cy == null) return null;
                return <circle cx={cx} cy={cy} r={9} fill={fill} stroke="white" strokeWidth={2} />;
              };
              const IndeksDiamond = (props) => {
                const { cx, cy, fill } = props;
                if (cx == null || cy == null) return null;
                const s = 10;
                return <polygon points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill={fill} stroke="#0D2240" strokeWidth={2} />;
              };
              const PortStar = (props) => {
                const { cx, cy, fill } = props;
                if (cx == null || cy == null) return null;
                // 5-spiss stjerne
                const r1 = 14, r2 = 6, n = 5;
                const points = [];
                for (let i = 0; i < n * 2; i++) {
                  const r = i % 2 === 0 ? r1 : r2;
                  const ang = (Math.PI / n) * i - Math.PI / 2;
                  points.push(`${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`);
                }
                return <polygon points={points.join(' ')} fill={fill} stroke="white" strokeWidth={2} />;
              };

              const renderScatter = (data, periode) => {
                // Filtrer alle typer etter toggle-state
                const alleProdukter = data.filter(d => d.type === 'produkt');
                const alleIndekser = data.filter(d => d.type === 'indeks');
                const allePort = data.filter(d => d.type === 'portefolje');
                const synligeKomp = alleProdukter.filter(p => scatterAktiveKomponenter[p.id]);
                const synligeIndekser = alleIndekser.filter(i => scatterAktiveIndekser[i.id]);
                const synligePort = scatterVisPort ? allePort : [];

                // Beregn rene domener basert på data som faktisk vises
                const synligData = [...synligeIndekser, ...synligeKomp, ...synligePort];
                const xVerdier = synligData.map(d => d.x);
                const yVerdier = synligData.map(d => d.y);
                const xMax = xVerdier.length > 0 ? Math.ceil((Math.max(...xVerdier) + 2) / 2) * 2 : 20;
                const yMin = yVerdier.length > 0 ? Math.min(...yVerdier) : 0;
                const yMax = yVerdier.length > 0 ? Math.max(...yVerdier) : 20;
                const yDomMin = Math.floor(Math.min(0, yMin - 2));
                const yDomMax = Math.ceil((yMax + 2) / 2) * 2;
                const tickFmt = (v) => Math.round(v) + '%';

                return (
                  <div className="rounded-lg border border-gray-100 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>{periode} — avkastning vs. risiko</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 20, right: 100, bottom: 30, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" dataKey="x" name="Volatilitet" tickFormatter={tickFmt} tick={{ fontSize: 11 }} label={{ value: 'Volatilitet (%)', position: 'insideBottom', offset: -10, fontSize: 11 }} domain={[0, xMax]} />
                        <YAxis type="number" dataKey="y" name="Avkastning p.a." tickFormatter={tickFmt} tick={{ fontSize: 11 }} label={{ value: 'Avkastning p.a. (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} domain={[yDomMin, yDomMax]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }}
                          content={({ payload }) => {
                            if (!payload?.length) return null;
                            const d = payload[0].payload;
                            const typeLabel = d.type === 'indeks' ? 'Indeks' : (d.type === 'portefolje' ? 'Vektet portefølje' : 'Komponent');
                            return <div className="bg-white p-2 rounded border border-gray-200 text-xs shadow-lg">
                              <div className="font-semibold">{d.navn}</div>
                              <div className="text-[10px] text-gray-500 mb-1">{typeLabel}</div>
                              <div>Volatilitet: <strong>{d.x.toFixed(1).replace('.', ',')} %</strong></div>
                              <div>Avkastning: <strong>{d.y.toFixed(1).replace('.', ',')} %</strong></div>
                            </div>;
                          }}
                        />
                        {/* Synlige indekser — diamant med inline label */}
                        {synligeIndekser.length > 0 && (
                          <Scatter name="Indekser" data={synligeIndekser} shape={IndeksDiamond}>
                            {synligeIndekser.map((entry, idx) => <Cell key={'i' + idx} fill={entry.farge} />)}
                            <LabelList dataKey="label" position="right" offset={10} fontSize={10} fontWeight={500} fill={PENSUM_COLORS.darkBlue} />
                          </Scatter>
                        )}
                        {/* Synlige komponenter — kun de som er huket av */}
                        {synligeKomp.length > 0 && (
                          <Scatter name="Komponenter" data={synligeKomp} shape={ProduktDot}>
                            {synligeKomp.map((entry, idx) => <Cell key={'p' + idx} fill={entry.farge} />)}
                            <LabelList dataKey="label" position="right" offset={10} fontSize={10} fontWeight={500} fill={PENSUM_COLORS.darkBlue} />
                          </Scatter>
                        )}
                        {/* Pensum-porteføljen — stjerne (kan skjules) */}
                        {synligePort.length > 0 && (
                          <Scatter name="Pensum-porteføljen" data={synligePort} shape={PortStar}>
                            {synligePort.map((entry, idx) => <Cell key={'pf' + idx} fill={PENSUM_COLORS.gold} />)}
                            <LabelList dataKey="label" position="right" offset={14} fontSize={10} fontWeight={700} fill={PENSUM_COLORS.gold} />
                          </Scatter>
                        )}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                );
              };

              // Toggle-panel — Pensum-portefølje, indekser og komponenter
              const renderToggles = (data) => {
                const alleProdukter = data.filter(d => d.type === 'produkt');
                const alleIndekser = data.filter(d => d.type === 'indeks');
                const allePort = data.filter(d => d.type === 'portefolje');
                if (alleProdukter.length === 0 && alleIndekser.length === 0 && allePort.length === 0) return null;
                const alleKompAktiv = alleProdukter.length > 0 && alleProdukter.every(p => scatterAktiveKomponenter[p.id]);
                return (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Sammensatt portefølje + indekser */}
                    <div className="pb-3 border-b border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-2">Sammensatt portefølje &amp; indekser</div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-1.5">
                        {allePort.length > 0 && (
                          <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-white/50 px-1 rounded">
                            <input
                              type="checkbox"
                              checked={scatterVisPort}
                              onChange={(e) => setScatterVisPort(e.target.checked)}
                              className="w-3 h-3 rounded"
                              style={{ accentColor: PENSUM_COLORS.gold }}
                            />
                            <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
                              <polygon
                                points={(() => {
                                  const cx = 7, cy = 7, r1 = 6, r2 = 2.6, n = 5;
                                  const pts = [];
                                  for (let i = 0; i < n * 2; i++) {
                                    const r = i % 2 === 0 ? r1 : r2;
                                    const ang = (Math.PI / n) * i - Math.PI / 2;
                                    pts.push(`${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`);
                                  }
                                  return pts.join(' ');
                                })()}
                                fill={scatterVisPort ? PENSUM_COLORS.gold : '#CBD5E1'}
                              />
                            </svg>
                            <span className={"font-medium " + (scatterVisPort ? "text-gray-800" : "text-gray-500")} style={{ color: scatterVisPort ? PENSUM_COLORS.gold : undefined }}>Pensum-porteføljen</span>
                          </label>
                        )}
                        {alleIndekser.map(idx => {
                          const aktiv = !!scatterAktiveIndekser[idx.id];
                          return (
                            <label key={idx.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-white/50 px-1 rounded">
                              <input
                                type="checkbox"
                                checked={aktiv}
                                onChange={(e) => setScatterAktiveIndekser(prev => ({ ...prev, [idx.id]: e.target.checked }))}
                                className="w-3 h-3 rounded"
                                style={{ accentColor: idx.farge }}
                              />
                              <span className="w-2.5 h-2.5 shrink-0 transform rotate-45" style={{ backgroundColor: aktiv ? idx.farge : '#CBD5E1', border: aktiv ? '1px solid #0D2240' : '1px solid #94A3B8' }}></span>
                              <span className={"italic truncate " + (aktiv ? "text-gray-800" : "text-gray-500")}>{idx.navn}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {/* Komponenter */}
                    {alleProdukter.length > 0 && <div className="pt-3">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Individuelle komponenter</span>
                        <button
                          onClick={() => {
                            const ny = {};
                            alleProdukter.forEach(p => { ny[p.id] = !alleKompAktiv; });
                            setScatterAktiveKomponenter(ny);
                          }}
                          className="text-[10px] px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                        >
                          {alleKompAktiv ? 'Skjul alle' : 'Vis alle'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {alleProdukter.map(p => {
                          const aktiv = !!scatterAktiveKomponenter[p.id];
                          return (
                            <label key={p.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-white/50 px-1 rounded">
                              <input
                                type="checkbox"
                                checked={aktiv}
                                onChange={(e) => setScatterAktiveKomponenter(prev => ({ ...prev, [p.id]: e.target.checked }))}
                                className="w-3 h-3 rounded"
                                style={{ accentColor: p.farge }}
                              />
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: aktiv ? p.farge : '#CBD5E1' }}></span>
                              <span className={"truncate " + (aktiv ? "text-gray-800 font-medium" : "text-gray-500")}>{p.navn}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>}
                  </div>
                );
              };
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Avkastning vs. risiko</h3>
                    <p className="text-xs text-blue-200 mt-0.5">★ Pensum-porteføljen · ● komponenter · ◆ referanseindekser. Bruk panelet under for å vise/skjule punkter. Punkter øverst til venstre indikerer beste risikojusterte avkastning.</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data3yr.length > 0 && renderScatter(data3yr, '3 år')}
                      {data5yr.length > 0 && renderScatter(data5yr, '5 år')}
                    </div>
                    {/* Felles komponent-toggles — påvirker begge grafer */}
                    {renderToggles(data3yr.length > 0 ? data3yr : data5yr)}
                    <p className="text-[10px] text-gray-500 italic mt-3">
                      Volatilitet er annualisert standardavvik basert på månedlige avkastninger; avkastning er annualisert geometrisk over perioden.
                      Pensum-porteføljen er vektet gjennomsnitt av komponentene (uten korrelasjoner — faktisk porteføljevolatilitet kan være noe lavere pga. diversifisering).
                      Bare komponenter med vekt &gt; 0 vises.
                    </p>
                  </div>
                </div>
              );
            })()}
            </div>
            )}

            {/* Kostnader og handelsvaluta: for rådgiver, nederst og lukket som standard */}
            <details className="bg-white rounded-xl shadow-sm border border-gray-100" data-radgiverdetaljer>
              <summary className="px-6 py-4 cursor-pointer text-sm font-semibold select-none" style={{ color: PENSUM_COLORS.darkBlue }}>Kostnader og handelsvaluta <span className="font-normal text-gray-400">· for rådgiver</span></summary>
              <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kostnader: honorar etter beløp og andelsklasse per fond (estimat for rådgiver) */}
              {(() => {
                const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                // Samme beløp som prognosen fordeler på produktene (inkl. lånefinansiert kapital).
                const belop = pbEffektivtInvestertBelop;
                const k = beregnKostnader(pensumAllokering, alleProd, belop);
                if (!k.linjer.length) return null;
                const p2 = (v) => pst(Number(v.toFixed(2)));
                return (
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Kostnader per år</h4>
                      <span className="text-lg font-bold tabular-nums whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{belop > 0 ? formatCurrency(Math.round(k.kroner)) + ' · ' : ''}{p2(k.pst)} %</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{belop > 0 ? `Honorartrinn ${k.trinn.navn}: ${p2(k.trinn.sats)} % på mandater og eksterne fond. Pensums egne fond har bare fondets kostnad.` : 'Legg inn beløp for å se kostnad i kroner og riktig andelsklasse.'}</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-200">
                          <th className="py-1.5 text-left font-medium">Produkt</th>
                          <th className="py-1.5 text-right font-medium">Honorar</th>
                          <th className="py-1.5 text-right font-medium">Fond</th>
                          <th className="py-1.5 text-right font-medium">Sum</th>
                          {belop > 0 && <th className="py-1.5 text-right font-medium">Kr/år</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {k.linjer.map(l => (
                          <tr key={l.id} className="border-b border-gray-100 align-top">
                            <td className="py-1.5 pr-2">
                              <span className="text-gray-700">{l.navn.replace('Pensum ', '')}</span>
                              {l.andelsklasse && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">klasse {l.andelsklasse}</span>}
                              {l.nesteKlasse && belop > 0 && <span className="block text-[10px] text-teal-700">{formatCurrency(Math.round(l.nesteKlasse.mangler))} til klasse {l.nesteKlasse.klasse} ({p2(l.nesteKlasse.lopendeKostnad)} %)</span>}
                              {l.suksesshonorar && <span className="block text-[10px] text-gray-400">+ suksesshonorar: {l.suksesshonorar}</span>}
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-gray-600">{l.honorarPst > 0 ? p2(l.honorarPst) + ' %' : '–'}</td>
                            <td className="py-1.5 text-right tabular-nums text-gray-600">{l.produktkostnadPst != null ? p2(l.produktkostnadPst) + ' %' : (l.honorarPst === 0 ? '–' : 'ukjent')}</td>
                            <td className="py-1.5 text-right tabular-nums font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{p2(l.totalPst)} %</td>
                            {belop > 0 && <td className="py-1.5 text-right tabular-nums text-gray-700 whitespace-nowrap">{formatNumber(Math.round(l.kroner))}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-xs" data-kostnadsforklaring>
                      <div>
                        <div className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-1">Resultatbasert honorar</div>
                        {k.linjer.some(l => l.suksesshonorar)
                          ? <p className="text-gray-600">{k.linjer.filter(l => l.suksesshonorar).map(l => `${l.navn.replace('Pensum ', '')}: ${l.suksesshonorar}`).join('. ')}. Påløper bare ved meravkastning, og er ikke med i tallene over.</p>
                          : <p className="text-gray-600">Ingen av produktene har resultatbasert honorar.</p>}
                      </div>
                      <div>
                        <div className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-1">Transaksjonskostnader</div>
                        <p className="text-gray-600">Transaksjonshonorar til Pensum: {pst(TRANSAKSJONSHONORAR_PST)} % av handelsbeløpet ved kjøp og salg av fond{belop > 0 ? `, om lag ${formatCurrency(Math.round(belop * TRANSAKSJONSHONORAR_PST / 100))} som engangskostnad ved etablering` : ''}. Fondenes egne transaksjonskostnader står i KID og er ikke med i tallene over.</p>
                      </div>
                      <div>
                        <div className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-1">Slik leser du tallene</div>
                        <p className="text-gray-600">«Fond» er løpende kostnad i fondet, eller vektet snitt for de underliggende fondene i et mandat. Den endres når fondssammensetningen endres. Honoraret er ekskl. mva; depot og plattform inngår.</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3">Estimat som må bekreftes mot gjeldende prisliste. Endelig kostnadsoversikt gis før avtale inngås.{k.mangler.length > 0 ? ` Fondskostnad mangler for: ${k.mangler.join(', ')}.` : ''}</p>
                  </div>
                );
              })()}

              {/* Handelsvaluta: vises bare når noe handles i annen valuta enn kroner */}
              {(() => {
                const alleProd = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || []), ...pensumProdukter.alternative];
                const total = pensumAllokering.reduce((sum, a) => sum + (a.vekt > 0 ? a.vekt : 0), 0);
                const utenlandsk = pensumAllokering
                  .filter(a => a.vekt > 0)
                  .map(a => ({ ...a, p: alleProd.find(x => x.id === a.id) }))
                  .filter(a => a.p?.valuta && a.p.valuta !== 'NOK');
                if (!utenlandsk.length || !(total > 0)) return null;
                const andel = utenlandsk.reduce((sum, a) => sum + a.vekt, 0) / total * 100;
                return (
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5" data-handelsvaluta>
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h4 className="font-semibold text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Handles i annen valuta enn kroner</h4>
                      <span className="text-lg font-bold tabular-nums whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{pst(Number(andel.toFixed(1)))} %</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Disse produktene kjøpes og selges i utenlandsk valuta, så kunden må veksle ved handel. Resten av porteføljen handles i kroner.</p>
                    <table className="w-full text-xs">
                      <tbody>
                        {utenlandsk.map(a => (
                          <tr key={a.id} className="border-b border-gray-100">
                            <td className="py-1.5 text-gray-700">{(a.p.navn || a.navn || a.id).replace('Pensum ', '')}</td>
                            <td className="py-1.5 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{a.p.valuta}</td>
                            <td className="py-1.5 text-right tabular-nums text-gray-600 w-20">{pst(Number((a.vekt / total * 100).toFixed(1)))} %</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-gray-400 mt-3">Dette sier ikke noe om valutarisikoen i porteføljen. Et globalt aksjefond som handles i kroner, har fortsatt eksponering mot utenlandsk valuta.</p>
                  </div>
                );
              })()}
              </div>
            </details>

          </div>
        )}

        {activeTab === 'scenario' && (() => {
          // Indekskonfigurasjon med farger og mapping til datafeed-nøkler
          const INDEKS_CONFIG = {
            'MSCI ACWI': { farge: PENSUM_COLORS.salmon, feedKey: 'msci-acwi' },
            'MSCI World': { farge: PENSUM_COLORS.lightBlue, feedKey: 'msci-world' },
            'S&P 500': { farge: PENSUM_COLORS.teal, feedKey: 'sp500' },
            'MSCI Europe': { farge: PENSUM_COLORS.gold, feedKey: 'msci-europe' },
            'MSCI EM': { farge: PENSUM_COLORS.purple, feedKey: 'msci-em' },
            'TOPIX': { farge: PENSUM_COLORS.midBlue, feedKey: 'topix' },
            // Oslo Børs får distinkt orange/brun farge så den ikke smelter sammen
            // med Pensum-forslaget (navy) i kalenderår- og benchmark-grafene.
            'Oslo Børs': { farge: '#D97706', feedKey: 'oslo-bors' },
            'Norske Statsobl.': { farge: PENSUM_COLORS.gray, feedKey: 'norske-statsobl' },
          };

          // Beregn årsavkastning fra historiske daglige data
          const beregnAarsavkastningFraIndeks = (feedKey, aar) =>
            beregnAarsavkastningFraData(DATAFEED_INDEKS_HISTORIKK?.[feedKey]?.data, aar);

          // Bygg REFERANSE_DATA med årlige avkastninger fra historikk
          const REFERANSE_DATA = Object.entries(INDEKS_CONFIG).reduce((acc, [navn, cfg]) => {
            const data = {};
            for (let aar = 2016; aar <= RAPPORT_AAR_TALL; aar++) {
              const v = beregnAarsavkastningFraIndeks(cfg.feedKey, aar);
              data[aar] = v !== null ? parseFloat(v.toFixed(1)) : null;
            }
            acc[navn] = { farge: cfg.farge, data, feedKey: cfg.feedKey };
            return acc;
          }, {});

          // Pensum-løsningenes konfigurasjoner for label/id/farge + historikk-id
          const PENSUM_SCEN_CONFIG = [
            { label: 'Basis', id: 'basis', farge: PENSUM_COLORS.salmon },
            { label: 'Fin. Opp.', id: 'financial-d', farge: PENSUM_COLORS.gray },
            { label: 'Global Core Active', id: 'global-core-active', farge: PENSUM_COLORS.navy },
            { label: 'Global Edge', id: 'global-edge', farge: PENSUM_COLORS.lightBlue },
            { label: 'Global Energy', id: 'energy-a', farge: PENSUM_COLORS.gold },
            { label: 'Global Høyrente', id: 'global-hoyrente', farge: PENSUM_COLORS.teal },
            { label: 'Nordic Banking', id: 'banking-d', farge: PENSUM_COLORS.midBlue },
            { label: 'Nordisk Høyrente', id: 'nordisk-hoyrente', farge: PENSUM_COLORS.purple },
            { label: 'Norske Aksjer', id: 'norge-a', farge: PENSUM_COLORS.red }
          ];

          const PENSUM_AARLIG = (() => {
            const produktMap = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || [])].reduce((acc, p) => {
              acc[p.id] = p;
              return acc;
            }, {});
            const arMapping = { 2022: 'aar2022', 2023: 'aar2023', 2024: 'aar2024', 2025: 'aar2025', 2026: 'aar2026' };
            return PENSUM_SCEN_CONFIG.reduce((acc, { label, id, farge }) => {
              const p = produktMap[id] || {};
              const data = Object.keys(arMapping).reduce((arAcc, ar) => {
                const felt = arMapping[ar];
                const v = hentAarsverdiForProdukt(p, felt, Number(ar));
                arAcc[Number(ar)] = Number.isFinite(v) ? v : null;
                return arAcc;
              }, {});
              acc[label] = { farge, data, id };
              return acc;
            }, {});
          })();

                    const AAR_KOLONNER = Array.from({ length: 5 }, (_, i) => RAPPORT_AAR_TALL - 4 + i);

          const heatmapFarge = (v) => {
            if (v === null) return 'transparent';
            if (v > 25) return PENSUM_COLORS.teal;
            if (v > 15) return '#4A9A9A';
            if (v > 5) return '#7AADAD';
            if (v > 0) return '#D6E8E8';
            if (v > -5) return '#E8D8CE';
            if (v > -15) return '#D4B8A8';
            return PENSUM_COLORS.salmon;
          };
          const textFarge = (v) => {
            if (v === null) return '#9ca3af';
            if (Math.abs(v) > 10) return 'white';
            return '#111827';
          };

          // Beregn startdato fra periodevalg
          const valgtPeriodeStart = (() => {
            const now = RAPPORT_DATO_OBJEKT;
            const p = sammenligningPeriodeScen;
            if (p === '1M') return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            if (p === '3M') return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            if (p === '6M') return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            if (p === 'YTD') return new Date(now.getFullYear(), 0, 1);
            if (p === '1Å') return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            if (p === '3Å') return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            if (p === '5Å') return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            return new Date(2015, 0, 1); // max
          })();

          // FOND_FARGER for external fund colors
          const FOND_FARGER = [PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.lightBlue, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.navy, PENSUM_COLORS.red, PENSUM_COLORS.midBlue];

          // lastEksterneFond is defined as a top-level useCallback

          // Get unique categories for fond search
          const kategorier = eksterneFond ? [...new Set(eksterneFond.map(f => f.cat).filter(Boolean))].sort() : [];

          // Filter pre-computed search results by category
          const filtrerteFond = fondKategoriFilter
            ? fondSokResultater.filter(f => f.cat === fondKategoriFilter)
            : fondSokResultater;

          // Pensum products for comparison (used in secondary tabs)
          const pensumProdListe = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || [])];
          const PENSUM_FOND_FARGER = {
            'basis': PENSUM_COLORS.salmon, 'financial-d': PENSUM_COLORS.gray,
            'global-core-active': PENSUM_COLORS.navy, 'global-edge': PENSUM_COLORS.lightBlue,
            'energy-a': PENSUM_COLORS.gold, 'global-hoyrente': PENSUM_COLORS.teal,
            'banking-d': PENSUM_COLORS.midBlue, 'nordisk-hoyrente': PENSUM_COLORS.purple,
            'norge-a': PENSUM_COLORS.red
          };

          // Eksisterende portefølje helpers — bruker fond fra kundekort (med beløp som vekter)
          const eksFondMedData = eksisterendePortefolje.fond.filter(f => f.matchet && f.belop > 0);
          const eksFondLookup = {}; // isin → Morningstar fond-objekt
          if (eksterneFond && eksFondMedData.length > 0) {
            eksFondMedData.forEach(ef => {
              if (ef.isin) {
                const ms = eksterneFond.find(f => f.isin === ef.isin);
                if (ms) eksFondLookup[ef.isin] = ms;
              }
            });
          }
          const harEksisterendePortefoljeChart = eksFondMedData.length > 0 && Object.keys(eksFondLookup).length > 0;
          const eksTotalBelop = eksFondMedData.reduce((s, f) => s + f.belop, 0) || 1;

          // Legacy competitor portfolio (kept for backwards compat but secondary to eksisterende)
          const harKonkurrentPortefolje = visKonkurrentPortefolje && valgteFond.length > 0 && valgteFond.some(f => (fondVekter[f.isin] || 0) > 0);
          const konkurrentTotalVekt = valgteFond.reduce((s, f) => s + (fondVekter[f.isin] || 0), 0) || 1;

          // Bygg sammenligningsdata fra månedlige historikkpunkter + external funds + competitor
          const byggSammenligningsdata = () => {
            const alleNavn = [...valgtePensumScen, ...valgteIndekserScen];
            const harEksterneFond = valgteFond.length > 0 && !skjulEnkeltfond;
            if (alleNavn.length === 0 && !visPortefoljeScen && !harEksterneFond && !harKonkurrentPortefolje) return [];

            // Samle månedlige serier per serie-navn
            const serieMap = {};
            alleNavn.forEach(n => {
              let hist = null;
              // Sjekk om det er en Pensum-løsning
              const pensumCfg = PENSUM_SCEN_CONFIG.find(c => c.label === n);
              if (pensumCfg) {
                hist = produktHistorikk?.[pensumCfg.id];
              } else {
                // Sjekk referanseindeks
                const indeksCfg = INDEKS_CONFIG[n];
                if (indeksCfg) {
                  hist = DATAFEED_INDEKS_HISTORIKK?.[indeksCfg.feedKey];
                }
              }
              if (!hist?.data?.length) return;
              const maanedlig = byggMaanedssluttSerie(hist.data);
              const filtrert = maanedlig.filter(d => {
                const dato = parseHistorikkDato(d.dato);
                return dato && dato >= valgtPeriodeStart;
              });
              if (filtrert.length > 0) {
                const startVerdi = filtrert[0].verdi;
                serieMap[n] = filtrert.map(d => ({
                  dato: d.dato,
                  indeksert: startVerdi > 0 ? parseFloat((((d.verdi / startVerdi) - 1) * 100).toFixed(2)) : 0
                }));
              }
            });

            // Beregn vektet portefølje-serie fra pensumAllokering
            if (visPortefoljeScen) {
              const valgteProdIds = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
              const totalVekt = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;
              const produktSerier = {};
              valgteProdIds.forEach(id => {
                const hist = produktHistorikk?.[id];
                if (!hist?.data?.length) return;
                const maanedlig = byggMaanedssluttSerie(hist.data);
                const filtrert = maanedlig.filter(d => {
                  const dato = parseHistorikkDato(d.dato);
                  return dato && dato >= valgtPeriodeStart;
                });
                if (filtrert.length > 0) {
                  const startVerdi = filtrert[0].verdi;
                  produktSerier[id] = {};
                  filtrert.forEach(d => {
                    produktSerier[id][d.dato] = startVerdi > 0 ? ((d.verdi / startVerdi) - 1) * 100 : 0;
                  });
                }
              });
              // Bygg vektet porteføljeserie
              const portDatoer = new Set();
              Object.values(produktSerier).forEach(map => Object.keys(map).forEach(d => portDatoer.add(d)));
              const portSortert = Array.from(portDatoer).sort();
              const portSerie = [];
              portSortert.forEach(dato => {
                let vektetVerdi = 0; let totalProdVekt = 0;
                valgteProdIds.forEach(id => {
                  if (produktSerier[id]?.[dato] !== undefined) {
                    const allok = pensumAllokering.find(a => a.id === id);
                    if (allok) {
                      vektetVerdi += produktSerier[id][dato] * (allok.vekt / totalVekt);
                      totalProdVekt += allok.vekt / totalVekt;
                    }
                  }
                });
                if (totalProdVekt > 0) {
                  portSerie.push({ dato, indeksert: parseFloat((vektetVerdi / totalProdVekt).toFixed(2)) });
                }
              });
              if (portSerie.length > 0) {
                serieMap['Pensum-forslaget'] = portSerie;
              }
            }

            // External funds — build yearly series from annual returns (a15-a25), then filter by valgtPeriodeStart
            if (harEksterneFond) {
              const aar = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
              const aarKeys = { 2015: 'a15', 2016: 'a16', 2017: 'a17', 2018: 'a18', 2019: 'a19', 2020: 'a20', 2021: 'a21', 2022: 'a22', 2023: 'a23', 2024: 'a24', 2025: 'a25' };
              valgteFond.forEach(f => {
                let kumulativ = 100;
                const rawSerie = [{ dato: '2014-12-31', verdi: 100 }];
                aar.forEach(a => {
                  const ret = f[aarKeys[a]];
                  if (ret !== undefined) {
                    kumulativ *= (1 + ret / 100);
                    rawSerie.push({ dato: `${a}-12-31`, verdi: kumulativ });
                  }
                });
                // Filter by valgtPeriodeStart and convert to % from start
                const filtrert = rawSerie.filter(d => {
                  const parsed = parseHistorikkDato(d.dato);
                  return parsed && parsed >= valgtPeriodeStart;
                });
                if (filtrert.length > 1) {
                  const startV = filtrert[0].verdi;
                  serieMap[f.n] = filtrert.map(d => ({
                    dato: d.dato,
                    indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                  }));
                } else if (rawSerie.length > 1) {
                  // If period filter is too tight, show all available data
                  const startV = rawSerie[0].verdi;
                  serieMap[f.n] = rawSerie.map(d => ({
                    dato: d.dato,
                    indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                  }));
                }
              });
            }

            // Competitor portfolio — weighted annual returns from selected funds
            if (harKonkurrentPortefolje) {
              const aar = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
              const aarKeys = { 2015: 'a15', 2016: 'a16', 2017: 'a17', 2018: 'a18', 2019: 'a19', 2020: 'a20', 2021: 'a21', 2022: 'a22', 2023: 'a23', 2024: 'a24', 2025: 'a25' };
              let kumulativ = 100;
              const rawSerie = [{ dato: '2014-12-31', verdi: 100 }];
              aar.forEach(a => {
                let vektet = 0; let harV = false;
                valgteFond.forEach(f => {
                  const v = fondVekter[f.isin] || 0;
                  if (v > 0 && f[aarKeys[a]] !== undefined) {
                    vektet += f[aarKeys[a]] * (v / konkurrentTotalVekt);
                    harV = true;
                  }
                });
                if (harV) {
                  kumulativ *= (1 + vektet / 100);
                  rawSerie.push({ dato: `${a}-12-31`, verdi: kumulativ });
                }
              });
              const filtrert = rawSerie.filter(d => {
                const parsed = parseHistorikkDato(d.dato);
                return parsed && parsed >= valgtPeriodeStart;
              });
              if (filtrert.length > 1) {
                const startV = filtrert[0].verdi;
                serieMap['Ekstern portefølje'] = filtrert.map(d => ({
                  dato: d.dato,
                  indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                }));
              } else if (rawSerie.length > 1) {
                const startV = rawSerie[0].verdi;
                serieMap['Ekstern portefølje'] = rawSerie.map(d => ({
                  dato: d.dato,
                  indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                }));
              }
            }

            // Eksisterende portefølje — vektet avkastning basert på beløp fra kundekort
            if (harEksisterendePortefoljeChart) {
              const aar = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
              const aarKeys = { 2015: 'a15', 2016: 'a16', 2017: 'a17', 2018: 'a18', 2019: 'a19', 2020: 'a20', 2021: 'a21', 2022: 'a22', 2023: 'a23', 2024: 'a24', 2025: 'a25' };
              let kumulativ = 100;
              const rawSerie = [{ dato: '2014-12-31', verdi: 100 }];
              aar.forEach(a => {
                let vektet = 0; let harV = false;
                eksFondMedData.forEach(ef => {
                  const ms = eksFondLookup[ef.isin];
                  if (ms && ms[aarKeys[a]] !== undefined) {
                    vektet += ms[aarKeys[a]] * (ef.belop / eksTotalBelop);
                    harV = true;
                  }
                });
                if (harV) {
                  kumulativ *= (1 + vektet / 100);
                  rawSerie.push({ dato: `${a}-12-31`, verdi: kumulativ });
                }
              });
              const filtrert = rawSerie.filter(d => {
                const parsed = parseHistorikkDato(d.dato);
                return parsed && parsed >= valgtPeriodeStart;
              });
              if (filtrert.length > 1) {
                const startV = filtrert[0].verdi;
                serieMap['Eksisterende portefølje'] = filtrert.map(d => ({
                  dato: d.dato,
                  indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                }));
              } else if (rawSerie.length > 1) {
                const startV = rawSerie[0].verdi;
                serieMap['Eksisterende portefølje'] = rawSerie.map(d => ({
                  dato: d.dato,
                  indeksert: startV > 0 ? parseFloat((((d.verdi / startV) - 1) * 100).toFixed(2)) : 0
                }));
              }
            }

            // Slå sammen eksisterende + ekstern → "Nåværende portefølje"
            if (slaSammenPortefoljer && serieMap['Eksisterende portefølje'] && serieMap['Ekstern portefølje']) {
              const eksMap = {}; serieMap['Eksisterende portefølje'].forEach(p => { eksMap[p.dato] = p.indeksert; });
              const extMap = {}; serieMap['Ekstern portefølje'].forEach(p => { extMap[p.dato] = p.indeksert; });
              const eksBelop2 = eksTotalBelop;
              const extBelop = valgteFond.reduce((s, f) => s + (fondVekter[f.isin] || 0), 0); // bruker vekter som proxy-beløp
              // Normaliser: eks bruker faktisk beløp, ekstern bruker vekter som andel av et tilsvarende beløp
              const extNormBelop = eksBelop2; // anta lik størrelse så vektene bestemmer
              const totBelop = eksBelop2 + extNormBelop;
              const eksVekt = eksBelop2 / totBelop;
              const extVekt = extNormBelop / totBelop;
              const alleDatoer = new Set([...Object.keys(eksMap), ...Object.keys(extMap)]);
              const sammenslatt = [];
              Array.from(alleDatoer).sort().forEach(dato => {
                const eVal = eksMap[dato]; const xVal = extMap[dato];
                if (eVal !== undefined && xVal !== undefined) {
                  sammenslatt.push({ dato, indeksert: parseFloat((eVal * eksVekt + xVal * extVekt).toFixed(2)) });
                } else if (eVal !== undefined) {
                  sammenslatt.push({ dato, indeksert: eVal });
                } else if (xVal !== undefined) {
                  sammenslatt.push({ dato, indeksert: xVal });
                }
              });
              if (sammenslatt.length > 0) {
                serieMap['Nåværende portefølje'] = sammenslatt;
                delete serieMap['Eksisterende portefølje'];
                delete serieMap['Ekstern portefølje'];
              }
            }

            // Samlet portefølje — vektet gjennomsnitt av alle aktive porteføljer
            if (visSamletPortefolje) {
              const deler = []; // { serie: Map<dato, indeksert>, belop }
              if (serieMap['Pensum-forslaget']) {
                const m = {}; serieMap['Pensum-forslaget'].forEach(p => { m[p.dato] = p.indeksert; });
                deler.push({ map: m, belop: investertBelop || totalKapital });
              }
              if (serieMap['Eksisterende portefølje']) {
                const m = {}; serieMap['Eksisterende portefølje'].forEach(p => { m[p.dato] = p.indeksert; });
                const eksBelop = eksFondMedData.reduce((s, f) => s + f.belop, 0) + eksisterendePortefolje.aksjer.reduce((s, a) => s + a.belop, 0) + eksisterendePortefolje.kontanter;
                deler.push({ map: m, belop: eksBelop });
              }
              if (serieMap['Ekstern portefølje']) {
                const m = {}; serieMap['Ekstern portefølje'].forEach(p => { m[p.dato] = p.indeksert; });
                deler.push({ map: m, belop: investertBelop || totalKapital });
              }
              if (deler.length >= 2) {
                const samletTotal = deler.reduce((s, d) => s + d.belop, 0);
                const alleDatoerSamlet = new Set();
                deler.forEach(d => Object.keys(d.map).forEach(dato => alleDatoerSamlet.add(dato)));
                const samlet = [];
                Array.from(alleDatoerSamlet).sort().forEach(dato => {
                  let vektetSum = 0; let vektSum = 0;
                  deler.forEach(d => {
                    if (d.map[dato] !== undefined) {
                      const vekt = d.belop / samletTotal;
                      vektetSum += d.map[dato] * vekt;
                      vektSum += vekt;
                    }
                  });
                  if (vektSum > 0) samlet.push({ dato, indeksert: parseFloat((vektetSum / vektSum).toFixed(2)) });
                });
                if (samlet.length > 0) serieMap['Samlet portefølje'] = samlet;
              }
            }

            // Samle alle unike datoer
            const alleDatoer = new Set();
            Object.values(serieMap).forEach(serie => serie.forEach(d => alleDatoer.add(d.dato)));
            const sorterteDatoer = Array.from(alleDatoer).sort();

            // Bygg datapunkter
            return sorterteDatoer.map(dato => {
              const punkt = { dato };
              Object.entries(serieMap).forEach(([n, serie]) => {
                const match = serie.find(d => d.dato === dato);
                if (match) punkt[n] = match.indeksert;
              });
              return punkt;
            });
          };

          const sammenligningsData = byggSammenligningsdata();
          // Build list of all series names for chart
          const visbareFondNavn = (valgteFond.length > 0 && !skjulEnkeltfond) ? valgteFond.map(f => f.n) : [];
          const erSammenslatt = slaSammenPortefoljer && harEksisterendePortefoljeChart && visEksisterendeIChart && harKonkurrentPortefolje;
          const konkNavn = harKonkurrentPortefolje && !erSammenslatt ? ['Ekstern portefølje'] : [];
          const eksNavn = harEksisterendePortefoljeChart && visEksisterendeIChart && !erSammenslatt ? ['Eksisterende portefølje'] : [];
          const sammenslattNavn = erSammenslatt ? ['Nåværende portefølje'] : [];
          const antallAktivePortefoljer = [visPortefoljeScen, (harEksisterendePortefoljeChart && visEksisterendeIChart) || erSammenslatt, harKonkurrentPortefolje && !erSammenslatt].filter(Boolean).length + (erSammenslatt ? 1 : 0);
          const samletNavn = visSamletPortefolje && antallAktivePortefoljer >= 2 ? ['Samlet portefølje'] : [];
          const alleSammenligningsNavn = [...(visPortefoljeScen ? ['Pensum-forslaget'] : []), ...eksNavn, ...sammenslattNavn, ...samletNavn, ...valgtePensumScen, ...valgteIndekserScen, ...visbareFondNavn, ...konkNavn];

          // Color function for merged chart
          const getLineFarge = (name) => {
            if (name === 'Pensum-forslaget') return PENSUM_COLORS.navy;
            if (name === 'Eksisterende portefølje') return '#D97706';
            if (name === 'Nåværende portefølje') return '#D97706';
            if (name === 'Samlet portefølje') return '#7C3AED';
            if (name === 'Ekstern portefølje') return '#059669';
            const pensumCfg = PENSUM_SCEN_CONFIG.find(c => c.label === name);
            if (pensumCfg) return PENSUM_AARLIG[name]?.farge || '#333';
            const indeksCfg = INDEKS_CONFIG[name];
            if (indeksCfg) return REFERANSE_DATA[name]?.farge || '#666';
            // External fund
            const fondIdx = valgteFond.findIndex(f => f.n === name);
            if (fondIdx >= 0) return FOND_FARGER[fondIdx % FOND_FARGER.length];
            return '#999';
          };

          // Helper functions for secondary tabs (periodeavkastning, kalenderår, sektor, land, detaljer)
          const beregnPensumPeriodeAvk = (produktId, periodeKey) => {
            const hist = produktHistorikk?.[produktId];
            if (!hist?.data?.length) return null;
            const now = RAPPORT_DATO_OBJEKT;
            let startDato;
            if (periodeKey === 'r1m') startDato = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            else if (periodeKey === 'r3m') startDato = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            else if (periodeKey === 'r6m') startDato = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            else if (periodeKey === 'rytd') startDato = new Date(now.getFullYear(), 0, 1);
            else if (periodeKey === 'r1y') startDato = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            else if (periodeKey === 'r3y') startDato = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            else if (periodeKey === 'r5y') startDato = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            else if (periodeKey === 'r10y') startDato = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
            else return null;
            const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
            const sluttVerdi = hist.data[hist.data.length - 1]?.verdi;
            if (!startVerdi || !sluttVerdi) return null;
            const totalReturn = ((sluttVerdi / startVerdi) - 1) * 100;
            if (periodeKey === 'r3y' || periodeKey === 'r5y' || periodeKey === 'r10y') {
              const years = periodeKey === 'r3y' ? 3 : periodeKey === 'r5y' ? 5 : 10;
              return parseFloat(((Math.pow(sluttVerdi / startVerdi, 1 / years) - 1) * 100).toFixed(2));
            }
            return parseFloat(totalReturn.toFixed(2));
          };

          const beregnIndeksPeriodeAvk = (feedKey, periodeKey) => {
            const indeks = DATAFEED_INDEKS_HISTORIKK?.[feedKey];
            if (!indeks?.data?.length) return null;
            const now = RAPPORT_DATO_OBJEKT;
            let startDato;
            if (periodeKey === 'r1m') startDato = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            else if (periodeKey === 'r3m') startDato = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            else if (periodeKey === 'r6m') startDato = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            else if (periodeKey === 'rytd') startDato = new Date(now.getFullYear(), 0, 1);
            else if (periodeKey === 'r1y') startDato = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            else if (periodeKey === 'r3y') startDato = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            else if (periodeKey === 'r5y') startDato = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            else if (periodeKey === 'r10y') startDato = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
            else return null;
            const startVerdi = finnStartVerdiVedPeriode(indeks.data, startDato);
            const sluttVerdi = indeks.data[indeks.data.length - 1]?.verdi;
            if (!startVerdi || !sluttVerdi) return null;
            const totalReturn = ((sluttVerdi / startVerdi) - 1) * 100;
            if (periodeKey === 'r3y' || periodeKey === 'r5y' || periodeKey === 'r10y') {
              const years = periodeKey === 'r3y' ? 3 : periodeKey === 'r5y' ? 5 : 10;
              return parseFloat(((Math.pow(sluttVerdi / startVerdi, 1 / years) - 1) * 100).toFixed(2));
            }
            return parseFloat(totalReturn.toFixed(2));
          };

          const beregnPortefoljeAvk = (periodeKey) => {
            const vektede = pensumAllokering.filter(a => a.vekt > 0);
            if (vektede.length === 0) return null;
            const totalVekt = vektede.reduce((s, a) => s + a.vekt, 0) || 1;
            let vektetAvk = 0; let harData = false;
            vektede.forEach(a => {
              const avk = beregnPensumPeriodeAvk(a.id, periodeKey);
              if (avk !== null) { vektetAvk += avk * (a.vekt / totalVekt); harData = true; }
            });
            return harData ? parseFloat(vektetAvk.toFixed(2)) : null;
          };

          const pensumValgte = visPensumIFondComp.map(id => {
            const p = pensumProdListe.find(pr => pr.id === id);
            return p ? { id, navn: p.navn, farge: PENSUM_FOND_FARGER[id] || '#999' } : null;
          }).filter(Boolean);
          const harPortefolje = visPortefoljeScen && pensumAllokering.some(a => a.vekt > 0);

          const harNoeAVise = valgteFond.length > 0 || pensumValgte.length > 0 || harPortefolje;
          const harFondEllerKonk = valgteFond.length > 0 || harKonkurrentPortefolje || harEksisterendePortefoljeChart;
          const harNoeAViseMedKonk = harNoeAVise || harKonkurrentPortefolje || harEksisterendePortefoljeChart;

          // Beregn vektet periodeavkastning for eksisterende portefølje
          const beregnEksisterendeAvk = (periodeKey) => {
            if (!harEksisterendePortefoljeChart) return null;
            let vektet = 0; let harData = false;
            eksFondMedData.forEach(ef => {
              const ms = eksFondLookup[ef.isin];
              if (ms && ms[periodeKey] !== undefined) {
                vektet += ms[periodeKey] * (ef.belop / eksTotalBelop);
                harData = true;
              }
            });
            return harData ? parseFloat(vektet.toFixed(2)) : null;
          };

          const beregnKonkurrentAvk = (periodeKey) => {
            if (!harKonkurrentPortefolje) return null;
            let vektet = 0; let harData = false;
            valgteFond.forEach(f => {
              const v = fondVekter[f.isin] || 0;
              if (v > 0 && f[periodeKey] !== undefined) {
                vektet += f[periodeKey] * (v / konkurrentTotalVekt);
                harData = true;
              }
            });
            return harData ? parseFloat(vektet.toFixed(2)) : null;
          };

          const byggAvkastningsdata = () => {
            if (!harNoeAVise && valgteIndekserScen.length === 0) return [];
            const perioder = [
              { key: 'r1m', label: '1 mnd' }, { key: 'r3m', label: '3 mnd' },
              { key: 'r6m', label: '6 mnd' }, { key: 'rytd', label: 'YTD' },
              { key: 'r1y', label: '1 år' }, { key: 'r3y', label: '3 år p.a.' },
              { key: 'r5y', label: '5 år p.a.' }, { key: 'r10y', label: '10 år p.a.' },
            ];
            return perioder.map(p => {
              const punkt = { periode: p.label };
              valgteFond.forEach((f) => {
                if (f[p.key] !== undefined) punkt[f.n] = parseFloat(f[p.key].toFixed(2));
              });
              pensumValgte.forEach(({ id, navn }) => {
                const avk = beregnPensumPeriodeAvk(id, p.key);
                if (avk !== null) punkt[navn] = avk;
              });
              valgteIndekserScen.forEach(indeksNavn => {
                const cfg = INDEKS_CONFIG[indeksNavn];
                if (cfg) {
                  const avk = beregnIndeksPeriodeAvk(cfg.feedKey, p.key);
                  if (avk !== null) punkt[indeksNavn] = avk;
                }
              });
              if (harPortefolje) {
                const avk = beregnPortefoljeAvk(p.key);
                if (avk !== null) punkt['Pensum-forslaget'] = avk;
              }
              if (harEksisterendePortefoljeChart) {
                const avk = beregnEksisterendeAvk(p.key);
                if (avk !== null) punkt['Eksisterende portefølje'] = avk;
              }
              return punkt;
            });
          };

          const byggAvkastningsdataMedKonk = () => {
            const data = byggAvkastningsdata();
            if (harKonkurrentPortefolje) {
              const periodeKeys = ['r1m', 'r3m', 'r6m', 'rytd', 'r1y', 'r3y', 'r5y', 'r10y'];
              data.forEach((punkt, i) => {
                const avk = beregnKonkurrentAvk(periodeKeys[i]);
                if (avk !== null) punkt['Ekstern portefølje'] = avk;
              });
            }
            // Slå sammen eks + ekstern → Nåværende i bar chart
            if (erSammenslatt) {
              data.forEach(punkt => {
                const eksV = punkt['Eksisterende portefølje'];
                const extV = punkt['Ekstern portefølje'];
                if (eksV != null && extV != null) {
                  punkt['Nåværende portefølje'] = parseFloat(((eksV + extV) / 2).toFixed(2));
                } else if (eksV != null) {
                  punkt['Nåværende portefølje'] = eksV;
                } else if (extV != null) {
                  punkt['Nåværende portefølje'] = extV;
                }
                delete punkt['Eksisterende portefølje'];
                delete punkt['Ekstern portefølje'];
              });
            }
            // Samlet portefølje — vektet gjennomsnitt av aktive porteføljer
            if (visSamletPortefolje && antallAktivePortefoljerTab >= 2) {
              data.forEach(punkt => {
                const deler = [];
                if (punkt['Pensum-forslaget'] != null && harPortefolje) {
                  deler.push({ avk: punkt['Pensum-forslaget'], belop: investertBelop || totalKapital });
                }
                const eksKey = erSammenslatt ? 'Nåværende portefølje' : 'Eksisterende portefølje';
                if (punkt[eksKey] != null && (harEksisterendePortefoljeChart && visEksisterendeIChart || erSammenslatt)) {
                  deler.push({ avk: punkt[eksKey], belop: eksTotalBelop });
                }
                if (!erSammenslatt && punkt['Ekstern portefølje'] != null && harKonkurrentPortefolje) {
                  deler.push({ avk: punkt['Ekstern portefølje'], belop: investertBelop || totalKapital });
                }
                if (deler.length >= 2) {
                  const totalBelop = deler.reduce((s, d) => s + d.belop, 0);
                  punkt['Samlet portefølje'] = parseFloat((deler.reduce((s, d) => s + d.avk * (d.belop / totalBelop), 0)).toFixed(2));
                }
              });
            }
            return data;
          };

          const byggAarsdata = () => {
            if (!harNoeAVise && valgteIndekserScen.length === 0) return [];
            const aar = [
              { key: 'a19', label: '2019' }, { key: 'a20', label: '2020' },
              { key: 'a21', label: '2021' }, { key: 'a22', label: '2022' },
              { key: 'a23', label: '2023' }, { key: 'a24', label: '2024' },
              { key: 'a25', label: '2025' },
            ];
            const pensumAarMap = { a22: 'aar2022', a23: 'aar2023', a24: 'aar2024', a25: 'aar2025' };
            return aar.map(a => {
              const punkt = { periode: a.label };
              valgteFond.forEach(f => {
                if (f[a.key] !== undefined) punkt[f.n] = parseFloat(f[a.key].toFixed(2));
              });
              const pensumFelt = pensumAarMap[a.key];
              if (pensumFelt) {
                pensumValgte.forEach(({ id, navn }) => {
                  const p = pensumProdListe.find(pr => pr.id === id);
                  const v = p ? hentAarsverdiForProdukt(p, pensumFelt, Number(a.label)) : null;
                  if (Number.isFinite(v)) punkt[navn] = parseFloat(v.toFixed(2));
                });
                if (harPortefolje) {
                  const vektede = pensumAllokering.filter(al => al.vekt > 0);
                  const totalVekt = vektede.reduce((s, al) => s + al.vekt, 0) || 1;
                  let vektet = 0; let harV = false;
                  vektede.forEach(al => {
                    const pp = pensumProdListe.find(pr => pr.id === al.id);
                    const v = pp ? hentAarsverdiForProdukt(pp, pensumFelt, Number(a.label)) : null;
                    if (Number.isFinite(v)) { vektet += v * (al.vekt / totalVekt); harV = true; }
                  });
                  if (harV) punkt['Pensum-forslaget'] = parseFloat(vektet.toFixed(2));
                }
              }
              // Indeksavkastninger
              valgteIndekserScen.forEach(indeksNavn => {
                const rd = REFERANSE_DATA[indeksNavn];
                if (rd?.data?.[Number(a.label)] !== null && rd?.data?.[Number(a.label)] !== undefined) {
                  punkt[indeksNavn] = rd.data[Number(a.label)];
                }
              });
              return punkt;
            });
          };

          const byggAarsdataMedKonk = () => {
            const data = byggAarsdata();
            if (harKonkurrentPortefolje) {
              const aarKeys = ['a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25'];
              data.forEach((punkt, i) => {
                let vektet = 0; let harV = false;
                valgteFond.forEach(f => {
                  const v = fondVekter[f.isin] || 0;
                  if (v > 0 && f[aarKeys[i]] !== undefined) {
                    vektet += f[aarKeys[i]] * (v / konkurrentTotalVekt);
                    harV = true;
                  }
                });
                if (harV) punkt['Ekstern portefølje'] = parseFloat(vektet.toFixed(2));
              });
            }
            // Eksisterende portefølje årlig avkastning
            if (harEksisterendePortefoljeChart) {
              const aarKeys = ['a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25'];
              data.forEach((punkt, i) => {
                let vektet = 0; let harV = false;
                eksFondMedData.forEach(ef => {
                  const ms = eksFondLookup[ef.isin];
                  if (ms && ms[aarKeys[i]] !== undefined) {
                    vektet += ms[aarKeys[i]] * (ef.belop / eksTotalBelop);
                    harV = true;
                  }
                });
                if (harV) punkt['Eksisterende portefølje'] = parseFloat(vektet.toFixed(2));
              });
            }
            // Slå sammen eks + ekstern → Nåværende i kalenderår
            if (erSammenslatt) {
              data.forEach(punkt => {
                const eksV = punkt['Eksisterende portefølje'];
                const extV = punkt['Ekstern portefølje'];
                if (eksV != null && extV != null) {
                  punkt['Nåværende portefølje'] = parseFloat(((eksV + extV) / 2).toFixed(2));
                } else if (eksV != null) {
                  punkt['Nåværende portefølje'] = eksV;
                } else if (extV != null) {
                  punkt['Nåværende portefølje'] = extV;
                }
                delete punkt['Eksisterende portefølje'];
                delete punkt['Ekstern portefølje'];
              });
            }
            // Samlet portefølje — vektet gjennomsnitt kalenderår
            if (visSamletPortefolje && antallAktivePortefoljerTab >= 2) {
              data.forEach(punkt => {
                const deler = [];
                if (punkt['Pensum-forslaget'] != null && harPortefolje) {
                  deler.push({ avk: punkt['Pensum-forslaget'], belop: investertBelop || totalKapital });
                }
                const eksKey2 = erSammenslatt ? 'Nåværende portefølje' : 'Eksisterende portefølje';
                if (punkt[eksKey2] != null && (harEksisterendePortefoljeChart && visEksisterendeIChart || erSammenslatt)) {
                  deler.push({ avk: punkt[eksKey2], belop: eksTotalBelop });
                }
                if (!erSammenslatt && punkt['Ekstern portefølje'] != null && harKonkurrentPortefolje) {
                  deler.push({ avk: punkt['Ekstern portefølje'], belop: investertBelop || totalKapital });
                }
                if (deler.length >= 2) {
                  const totalBelop = deler.reduce((s, d) => s + d.belop, 0);
                  punkt['Samlet portefølje'] = parseFloat((deler.reduce((s, d) => s + d.avk * (d.belop / totalBelop), 0)).toFixed(2));
                }
              });
            }
            return data;
          };

          // Mapping fra Pensum-sektornavn til Morningstar-felt
          const PENSUM_SEKTOR_MAP = { 'Technology': 'sTech', 'Financial Services': 'sFin', 'Healthcare': 'sHlt', 'Industrials': 'sInd', 'Consumer Cyclical': 'sCyc', 'Consumer Defensive': 'sDef', 'Energy': 'sEng', 'Communication Services': 'sComm', 'Basic Materials': 'sMat', 'Real Estate': 'sRE', 'Utilities': 'sUtil' };
          const PENSUM_REGION_MAP = { 'United States': 'cUS', 'United Kingdom': 'cUK', 'Japan': 'cJP', 'Germany': 'cDE', 'France': 'cFR', 'Norway': 'cNO', 'Sweden': 'cSE', 'Denmark': 'cDK', 'China': 'cCN' };

          // Beregn vektet Pensum-portefølje sektor/region fra produkteksponering
          const beregnPensumVektetEksponering = (type) => {
            // Vekt skaleres mot produktene som har data for typen (som i aggregert eksponering),
            // så rentefond uten land-/sektordata ikke trekker andelene ned.
            const vektede = pensumAllokering.filter(a => a.vekt > 0 && (type === 'sektor' ? produktEksponering?.[a.id]?.sektorer : produktEksponering?.[a.id]?.regioner));
            if (vektede.length === 0) return null;
            const totalVekt = vektede.reduce((s, a) => s + a.vekt, 0) || 1;
            const samlet = {};
            vektede.forEach(a => {
              const eksp = produktEksponering?.[a.id];
              const data = type === 'sektor' ? eksp?.sektorer : eksp?.regioner;
              if (!data) return;
              data.forEach(d => {
                const msKey = type === 'sektor' ? PENSUM_SEKTOR_MAP[d.navn] : PENSUM_REGION_MAP[d.navn];
                if (msKey) {
                  samlet[msKey] = (samlet[msKey] || 0) + d.vekt * (a.vekt / totalVekt);
                }
              });
            });
            return Object.keys(samlet).length > 0 ? samlet : null;
          };

          // Beregn vektet eksisterende portefølje sektor/region fra Morningstar-data
          const beregnEksisterendeEksponering = (keys) => {
            if (!harEksisterendePortefoljeChart) return null;
            const samlet = {};
            eksFondMedData.forEach(ef => {
              const ms = eksFondLookup[ef.isin];
              if (!ms) return;
              keys.forEach(k => {
                if (ms[k] && ms[k] > 0) {
                  samlet[k] = (samlet[k] || 0) + ms[k] * (ef.belop / eksTotalBelop);
                }
              });
            });
            return Object.keys(samlet).length > 0 ? samlet : null;
          };

          const byggSektordata = () => {
            const sektorer = [
              { key: 'sTech', label: 'Teknologi' }, { key: 'sFin', label: 'Finans' },
              { key: 'sHlt', label: 'Helse' }, { key: 'sInd', label: 'Industri' },
              { key: 'sCyc', label: 'Syklisk konsum' }, { key: 'sDef', label: 'Defensivt konsum' },
              { key: 'sEng', label: 'Energi' }, { key: 'sComm', label: 'Kommunikasjon' },
              { key: 'sMat', label: 'Materialer' }, { key: 'sRE', label: 'Eiendom' },
              { key: 'sUtil', label: 'Kraftforsyning' },
            ];
            const fondMedSektordata = valgteFond.filter(f =>
              f.sTech || f.sFin || f.sHlt || f.sInd || f.sCyc || f.sDef || f.sEng || f.sComm || f.sMat || f.sRE || f.sUtil
            );
            const pensumSektorer = beregnPensumVektetEksponering('sektor');
            const eksSektorer = beregnEksisterendeEksponering(sektorer.map(s => s.key));
            if (fondMedSektordata.length === 0 && !pensumSektorer && !eksSektorer) return [];
            const konkSektorer = harKonkurrentPortefolje ? (() => {
              const samlet = {};
              valgteFond.forEach(f => {
                const v = fondVekter[f.isin] || 0;
                if (v <= 0) return;
                sektorer.forEach(s => { if (f[s.key] && f[s.key] > 0) samlet[s.key] = (samlet[s.key] || 0) + f[s.key] * (v / konkurrentTotalVekt); });
              });
              return Object.keys(samlet).length > 0 ? samlet : null;
            })() : null;
            return sektorer.map(s => {
              const punkt = { sektor: s.label };
              if (pensumSektorer?.[s.key]) punkt['Pensum-forslaget'] = parseFloat(pensumSektorer[s.key].toFixed(1));
              if (eksSektorer?.[s.key]) punkt['Eksisterende portefølje'] = parseFloat(eksSektorer[s.key].toFixed(1));
              if (konkSektorer?.[s.key]) punkt['Ekstern portefølje'] = parseFloat(konkSektorer[s.key].toFixed(1));
              fondMedSektordata.forEach(f => {
                const val = f[s.key];
                if (val !== undefined && val !== null && !isNaN(val)) punkt[f.n] = parseFloat(val.toFixed(1));
              });
              // Merge eks + ekstern → Nåværende
              if (erSammenslatt) {
                const eV = punkt['Eksisterende portefølje']; const xV = punkt['Ekstern portefølje'];
                if (eV != null || xV != null) punkt['Nåværende portefølje'] = parseFloat((((eV || 0) + (xV || 0)) / ((eV != null ? 1 : 0) + (xV != null ? 1 : 0))).toFixed(1));
                delete punkt['Eksisterende portefølje']; delete punkt['Ekstern portefølje'];
              }
              // Samlet portefølje sektor
              if (visSamletPortefolje && antallAktivePortefoljerTab >= 2) {
                const deler = [];
                if (punkt['Pensum-forslaget'] != null && harPortefolje) deler.push({ v: punkt['Pensum-forslaget'], b: investertBelop || totalKapital });
                const eksKeyS = erSammenslatt ? 'Nåværende portefølje' : 'Eksisterende portefølje';
                if (punkt[eksKeyS] != null) deler.push({ v: punkt[eksKeyS], b: eksTotalBelop });
                if (!erSammenslatt && punkt['Ekstern portefølje'] != null && harKonkurrentPortefolje) deler.push({ v: punkt['Ekstern portefølje'], b: investertBelop || totalKapital });
                if (deler.length >= 2) {
                  const tot = deler.reduce((s, d) => s + d.b, 0);
                  punkt['Samlet portefølje'] = parseFloat((deler.reduce((s, d) => s + d.v * (d.b / tot), 0)).toFixed(1));
                }
              }
              return punkt;
            }).filter(p => Object.keys(p).length > 1);
          };

          const byggRegiondata = () => {
            const regioner = [
              { key: 'cUS', label: 'USA' }, { key: 'cUK', label: 'Storbritannia' },
              { key: 'cJP', label: 'Japan' }, { key: 'cDE', label: 'Tyskland' },
              { key: 'cFR', label: 'Frankrike' }, { key: 'cNO', label: 'Norge' },
              { key: 'cSE', label: 'Sverige' }, { key: 'cDK', label: 'Danmark' },
              { key: 'cCN', label: 'Kina' },
            ];
            const fondMedRegiondata = valgteFond.filter(f =>
              f.cUS || f.cUK || f.cJP || f.cDE || f.cFR || f.cNO || f.cSE || f.cDK || f.cCN
            );
            const pensumRegioner = beregnPensumVektetEksponering('region');
            const eksRegioner = beregnEksisterendeEksponering(regioner.map(r => r.key));
            if (fondMedRegiondata.length === 0 && !pensumRegioner && !eksRegioner) return [];
            const konkRegioner = harKonkurrentPortefolje ? (() => {
              const samlet = {};
              valgteFond.forEach(f => {
                const v = fondVekter[f.isin] || 0;
                if (v <= 0) return;
                regioner.forEach(r => { if (f[r.key] && f[r.key] > 0) samlet[r.key] = (samlet[r.key] || 0) + f[r.key] * (v / konkurrentTotalVekt); });
              });
              return Object.keys(samlet).length > 0 ? samlet : null;
            })() : null;
            const rader = regioner.map(r => {
              const punkt = { region: r.label };
              if (pensumRegioner?.[r.key]) punkt['Pensum-forslaget'] = parseFloat(pensumRegioner[r.key].toFixed(1));
              if (eksRegioner?.[r.key]) punkt['Eksisterende portefølje'] = parseFloat(eksRegioner[r.key].toFixed(1));
              if (konkRegioner?.[r.key]) punkt['Ekstern portefølje'] = parseFloat(konkRegioner[r.key].toFixed(1));
              fondMedRegiondata.forEach(f => {
                const val = f[r.key];
                if (val !== undefined && val !== null && !isNaN(val)) punkt[f.n] = parseFloat(val.toFixed(1));
              });
              // Merge eks + ekstern → Nåværende
              if (erSammenslatt) {
                const eV = punkt['Eksisterende portefølje']; const xV = punkt['Ekstern portefølje'];
                if (eV != null || xV != null) punkt['Nåværende portefølje'] = parseFloat((((eV || 0) + (xV || 0)) / ((eV != null ? 1 : 0) + (xV != null ? 1 : 0))).toFixed(1));
                delete punkt['Eksisterende portefølje']; delete punkt['Ekstern portefølje'];
              }
              // Samlet portefølje region
              if (visSamletPortefolje && antallAktivePortefoljerTab >= 2) {
                const deler = [];
                if (punkt['Pensum-forslaget'] != null && harPortefolje) deler.push({ v: punkt['Pensum-forslaget'], b: investertBelop || totalKapital });
                const eksKeyR = erSammenslatt ? 'Nåværende portefølje' : 'Eksisterende portefølje';
                if (punkt[eksKeyR] != null) deler.push({ v: punkt[eksKeyR], b: eksTotalBelop });
                if (!erSammenslatt && punkt['Ekstern portefølje'] != null && harKonkurrentPortefolje) deler.push({ v: punkt['Ekstern portefølje'], b: investertBelop || totalKapital });
                if (deler.length >= 2) {
                  const tot = deler.reduce((s, d) => s + d.b, 0);
                  punkt['Samlet portefølje'] = parseFloat((deler.reduce((s, d) => s + d.v * (d.b / tot), 0)).toFixed(1));
                }
              }
              return punkt;
            }).filter(p => Object.keys(p).length > 1);
            // Land utenfor de ni som Morningstar-dataene har felt for (f.eks. Singapore og Hellas
            // i Pensum Norge) samles i "Øvrige land", slik at hver serie summerer til 100 %.
            const serier = [...new Set(rader.flatMap(r => Object.keys(r).filter(k => k !== 'region')))];
            const ovrige = { region: 'Øvrige land' };
            serier.forEach(serie => {
              const sum = rader.reduce((a, r) => a + (Number(r[serie]) || 0), 0);
              if (sum > 0 && sum < 99.5) ovrige[serie] = parseFloat((100 - sum).toFixed(1));
            });
            return Object.keys(ovrige).length > 1 ? [...rader, ovrige] : rader;
          };

          // Secondary tab data
          const fondNavn = valgteFond.map(f => f.n);
          const pensumNavn = pensumValgte.map(p => p.navn);
          const portNavn = harPortefolje ? ['Pensum-forslaget'] : [];
          const eksNavnTab = harEksisterendePortefoljeChart && visEksisterendeIChart ? ['Eksisterende portefølje'] : [];
          const konkNavnTab = harKonkurrentPortefolje && !erSammenslatt ? ['Ekstern portefølje'] : [];
          const eksNavnTab2 = harEksisterendePortefoljeChart && visEksisterendeIChart && !erSammenslatt ? ['Eksisterende portefølje'] : [];
          const sammenslattNavnTab = erSammenslatt ? ['Nåværende portefølje'] : [];
          const antallAktivePortefoljerTab = [harPortefolje, (harEksisterendePortefoljeChart && visEksisterendeIChart) || erSammenslatt, harKonkurrentPortefolje && !erSammenslatt].filter(Boolean).length + (erSammenslatt ? 1 : 0);
          const samletNavnTab = visSamletPortefolje && antallAktivePortefoljerTab >= 2 ? ['Samlet portefølje'] : [];
          const visbareFondNavnTab = skjulEnkeltfond && (harKonkurrentPortefolje || harEksisterendePortefoljeChart) ? [] : fondNavn;
          const indeksNavnTab = [...valgteIndekserScen];
          const alleSerieNavnTab = [...portNavn, ...eksNavnTab2, ...sammenslattNavnTab, ...samletNavnTab, ...pensumNavn, ...indeksNavnTab, ...visbareFondNavnTab, ...konkNavnTab];
          const getSerieColor = (name, idx) => {
            if (name === 'Pensum-forslaget') return PENSUM_COLORS.navy;
            if (name === 'Eksisterende portefølje') return '#D97706';
            if (name === 'Nåværende portefølje') return '#D97706';
            if (name === 'Samlet portefølje') return '#7C3AED';
            if (name === 'Ekstern portefølje') return '#059669';
            const pensumMatch = pensumValgte.find(p => p.navn === name);
            if (pensumMatch) return pensumMatch.farge;
            const indeksCfgTab = INDEKS_CONFIG[name];
            if (indeksCfgTab) return indeksCfgTab.farge;
            return FOND_FARGER[idx % FOND_FARGER.length];
          };

          // Beregn nøkkeltall (risikometrikker) fra månedlige sammenligningsdata
          const byggNokkeltall = () => {
            if (sammenligningsData.length < 3) return [];
            return alleSerieNavnTab.map(navn => {
              // Hent verdier fra sammenligningsdata
              const verdier = sammenligningsData
                .map(d => d[navn])
                .filter(v => v !== undefined && v !== null);
              if (verdier.length < 3) return null;

              // Månedlige avkastninger i %. Verdiene er akkumulert avkastning fra start,
              // så avkastningen må regnes som forhold mellom nivåene, ikke differanse.
              const maanedligAvk = [];
              for (let i = 1; i < verdier.length; i++) {
                maanedligAvk.push(((100 + verdier[i]) / (100 + verdier[i - 1]) - 1) * 100);
              }
              if (maanedligAvk.length === 0) return null;

              // Total avkastning
              const totalAvk = verdier[verdier.length - 1];

              // Annualisert avkastning
              const antallAar = maanedligAvk.length / 12;
              const annualisert = antallAar >= 1
                ? ((Math.pow(1 + totalAvk / 100, 1 / antallAar) - 1) * 100)
                : totalAvk;

              // Volatilitet (annualisert standardavvik)
              const gjennomsnitt = maanedligAvk.reduce((s, v) => s + v, 0) / maanedligAvk.length;
              const varians = maanedligAvk.reduce((s, v) => s + Math.pow(v - gjennomsnitt, 2), 0) / maanedligAvk.length;
              const maanedligVol = Math.sqrt(varians);
              const annualVol = maanedligVol * Math.sqrt(12);

              const risikofriRente = RISIKOFRI_RENTE;
              const sharpe = annualVol > 0 ? (annualisert - risikofriRente) / annualVol : 0;

              // Max drawdown
              let maxDD = 0;
              let peak = verdier[0];
              for (let i = 1; i < verdier.length; i++) {
                if (verdier[i] > peak) peak = verdier[i];
                const dd = ((verdier[i] - peak) / (100 + peak)) * 100;
                if (dd < maxDD) maxDD = dd;
              }

              // Beste/verste måned
              const besteMaaned = Math.max(...maanedligAvk);
              const versteMaaned = Math.min(...maanedligAvk);

              return {
                navn,
                farge: getSerieColor(navn, alleSerieNavnTab.indexOf(navn)),
                totalAvk: parseFloat(totalAvk.toFixed(2)),
                annualisert: parseFloat(annualisert.toFixed(2)),
                volatilitet: parseFloat(annualVol.toFixed(2)),
                sharpe: parseFloat(sharpe.toFixed(2)),
                maxDrawdown: parseFloat(maxDD.toFixed(2)),
                besteMaaned: parseFloat(besteMaaned.toFixed(2)),
                versteMaaned: parseFloat(versteMaaned.toFixed(2)),
              };
            }).filter(Boolean);
          };

          const alleNavn2 = Object.keys(PENSUM_AARLIG);
          const alleIndeksNavn = Object.keys(REFERANSE_DATA);

          return (
            <div className="space-y-6 no-print">
              {/* ====== SAMMENLIGN FOND OG INDEKSER (bilde 3-style) ====== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5">
                  <h3 className="text-xl font-bold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Sammenlign fond og indekser</h3>
                  <p className="text-sm text-gray-500 mb-4">Historisk prosentvis avkastning fra startpunkt</p>

                  {/* Periodeknapper */}
                  <div className="flex items-center gap-2 mb-4">
                    {['1M','3M','6M','YTD','1Å','3Å','5Å','Maks'].map(p => {
                      const key = p === 'Maks' ? 'max' : p;
                      return (
                        <button key={p} onClick={() => setSammenligningPeriodeScen(key)}
                          className={"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors " + (sammenligningPeriodeScen === key ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                          style={sammenligningPeriodeScen === key ? { backgroundColor: PENSUM_COLORS.darkBlue } : {}}>
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Portefølje-toggles */}
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Porteføljer</div>
                    <button
                      onClick={() => setVisPortefoljeScen(prev => !prev)}
                      className={"flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all " + (visPortefoljeScen ? "text-white border-transparent" : "bg-white border-gray-200 hover:border-gray-400")}
                      style={visPortefoljeScen ? { backgroundColor: PENSUM_COLORS.navy, borderColor: PENSUM_COLORS.navy } : { color: PENSUM_COLORS.navy }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: visPortefoljeScen ? 'white' : PENSUM_COLORS.navy }}></span>
                      Pensum-forslaget
                    </button>
                    {harEksisterendePortefoljeChart && (
                      <button
                        onClick={() => setVisEksisterendeIChart(prev => !prev)}
                        className={"flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all " + (visEksisterendeIChart ? "text-white border-transparent" : "bg-white border-gray-200 hover:border-gray-400")}
                        style={visEksisterendeIChart ? { backgroundColor: '#D97706', borderColor: '#D97706' } : { color: '#D97706' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: visEksisterendeIChart ? 'white' : '#D97706' }}></span>
                        Eksisterende portefølje
                      </button>
                    )}
                    {valgteFond.some(f => (fondVekter[f.isin] || 0) > 0) && (
                      <button
                        onClick={() => setVisKonkurrentPortefolje(prev => !prev)}
                        className={"flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all " + (visKonkurrentPortefolje ? "text-white border-transparent" : "bg-white border-gray-200 hover:border-gray-400")}
                        style={visKonkurrentPortefolje ? { backgroundColor: '#059669', borderColor: '#059669' } : { color: '#059669' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: visKonkurrentPortefolje ? 'white' : '#059669' }}></span>
                        Ekstern portefølje
                      </button>
                    )}
                    {/* Samlet portefølje — vises når minst 2 porteføljer er aktive */}
                    {([visPortefoljeScen, harEksisterendePortefoljeChart && visEksisterendeIChart, harKonkurrentPortefolje].filter(Boolean).length >= 2) && (
                      <button
                        onClick={() => setVisSamletPortefolje(prev => !prev)}
                        className={"flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all " + (visSamletPortefolje ? "text-white border-transparent" : "bg-white border-gray-200 hover:border-gray-400")}
                        style={visSamletPortefolje ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' } : { color: '#7C3AED' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: visSamletPortefolje ? 'white' : '#7C3AED' }}></span>
                        Samlet portefølje
                      </button>
                    )}
                    {!harEksisterendePortefoljeChart && eksisterendePortefolje.fond.length === 0 && (
                      <span className="text-xs text-gray-400 italic">Registrer kundens eksisterende portefølje under Kundeinformasjon for å sammenligne</span>
                    )}
                  </div>

                  {/* Pensum-løsninger knapper */}
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pensums enkeltløsninger</div>
                    <div className="flex flex-wrap gap-2">
                      {alleNavn2.map(n => {
                        const aktiv = valgtePensumScen.includes(n);
                        return (
                          <button key={n}
                            onClick={() => setValgtePensumScen(prev => aktiv ? prev.filter(x => x !== n) : [...prev, n])}
                            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                            style={aktiv ? { backgroundColor: PENSUM_AARLIG[n]?.farge || '#333', borderColor: PENSUM_AARLIG[n]?.farge } : {}}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : PENSUM_AARLIG[n]?.farge || '#999' }}></span>
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Referanseindekser knapper */}
                  <div className="mb-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Referanseindekser</div>
                    <div className="flex flex-wrap gap-2">
                      {alleIndeksNavn.map(n => {
                        const aktiv = valgteIndekserScen.includes(n);
                        return (
                          <button key={n}
                            onClick={() => setValgteIndekserScen(prev => aktiv ? prev.filter(x => x !== n) : [...prev, n])}
                            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                            style={aktiv ? { backgroundColor: REFERANSE_DATA[n]?.farge || '#666', borderColor: REFERANSE_DATA[n]?.farge } : {}}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : REFERANSE_DATA[n]?.farge || '#999' }}></span>
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible Fondssammenligning section */}
                  <div className="mb-5">
                    <button
                      onClick={() => {
                        const nyVerdi = !visFondssammenligning;
                        setVisFondssammenligning(nyVerdi);
                        if (nyVerdi) lastEksterneFond();
                      }}
                      className={"flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all w-full justify-between " + (visFondssammenligning ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300")}
                      style={{ color: PENSUM_COLORS.darkBlue }}>
                      <span className="flex items-center gap-2">
                        <svg className={"w-4 h-4 transition-transform " + (visFondssammenligning ? "rotate-90" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        Fondssammenligning — legg til eksterne fond
                      </span>
                      {valgteFond.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">{valgteFond.length} fond valgt</span>
                      )}
                    </button>

                    {visFondssammenligning && (
                      <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4">
                        {/* Søk og filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 relative">
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                              type="text" ref={fondSokInputRef} defaultValue="" onChange={handleFondSokChange}
                              placeholder={eksterneFondLoading ? 'Laster fond...' : 'Søk på fondsnavn, ISIN eller forvalter...'}
                              disabled={eksterneFondLoading}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white"
                            />
                            {eksterneFondLoading && <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                          </div>
                          <select value={fondKategoriFilter} onChange={e => setFondKategoriFilter(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px]">
                            <option value="">Alle kategorier</option>
                            {kategorier.map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>

                        {/* Søkeresultater */}
                        {fondSokDebounced.length >= 2 && (
                          <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg bg-white">
                            {filtrerteFond.length === 0 ? (
                              <div className="p-4 text-sm text-gray-400 text-center">Ingen fond funnet</div>
                            ) : (
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Fond</th>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Kategori</th>
                                    <th className="py-2 px-3 text-right font-semibold text-gray-600">1 år</th>
                                    <th className="py-2 px-3 text-right font-semibold text-gray-600">3 år p.a.</th>
                                    <th className="py-2 px-3 text-right font-semibold text-gray-600">5 år p.a.</th>
                                    <th className="py-2 px-3 text-center font-semibold text-gray-600">Legg til</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filtrerteFond.map(f => {
                                    const alleredeValgt = valgteFond.some(v => v.isin === f.isin);
                                    return (
                                      <tr key={f.isin || f.n} className="border-t border-gray-50 hover:bg-blue-50/50">
                                        <td className="py-2 px-3">
                                          <div className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{f.n}</div>
                                          <div className="text-gray-400">{f.isin}</div>
                                        </td>
                                        <td className="py-2 px-3 text-gray-500">{f.cat}</td>
                                        <td className="py-2 px-3 text-right tabular-nums" style={{ color: f.r1y > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                                          {f.r1y !== undefined ? `${f.r1y > 0 ? '+' : ''}${f.r1y.toFixed(1).replace('.', ',')} %` : '\u2014'}
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums" style={{ color: f.r3y > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                                          {f.r3y !== undefined ? `${f.r3y > 0 ? '+' : ''}${f.r3y.toFixed(1).replace('.', ',')} %` : '\u2014'}
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums" style={{ color: f.r5y > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                                          {f.r5y !== undefined ? `${f.r5y > 0 ? '+' : ''}${f.r5y.toFixed(1).replace('.', ',')} %` : '\u2014'}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <button
                                            onClick={() => !alleredeValgt && valgteFond.length < 8 && setValgteFond(prev => [...prev, f])}
                                            disabled={alleredeValgt || valgteFond.length >= 8}
                                            className={"px-2 py-1 rounded text-xs font-semibold transition-colors " + (alleredeValgt ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100")}>
                                            {alleredeValgt ? 'Valgt' : '+ Legg til'}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {/* Valgte fond chips + konkurranseportefølje */}
                        {valgteFond.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Valgte fond ({valgteFond.length}/8)</div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {valgteFond.map((f, i) => (
                                <div key={f.isin || f.n} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: FOND_FARGER[i % FOND_FARGER.length] }}>
                                  <span className="w-2 h-2 rounded-full bg-white/50"></span>
                                  <span className="max-w-[200px] truncate">{f.n}</span>
                                  <button onClick={() => setValgteFond(prev => prev.filter(v => v.isin !== f.isin))}
                                    className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-white/80 hover:text-white">&times;</button>
                                </div>
                              ))}
                              <button onClick={() => { setValgteFond([]); setFondVekter({}); }} className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">
                                Fjern alle
                              </button>
                            </div>

                            {/* Eksisterende portefølje — fra kundekort */}
                            {harEksisterendePortefoljeChart && (
                              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#D97706' }}>Eksisterende portefølje{eksisterendePortefolje.kilde ? ` — ${eksisterendePortefolje.kilde}` : ''}</div>
                                    <p className="text-xs text-gray-500 mt-0.5">Fra kundeinformasjon. Vektet basert på beløp per fond.</p>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  {eksFondMedData.map(ef => {
                                    const andel = eksTotalBelop > 0 ? (ef.belop / eksTotalBelop * 100).toFixed(0) : 0;
                                    return (
                                      <div key={ef.id} className="flex items-center gap-2 text-xs">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#D97706' }}></span>
                                        <span className="flex-1 truncate text-gray-700">{ef.navn}</span>
                                        <span className="text-gray-400 w-10 text-right">{pst(andel)} %</span>
                                        <span className="text-gray-500 w-20 text-right">{formatCurrency(ef.belop)}</span>
                                      </div>
                                    );
                                  })}
                                  <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs font-semibold">
                                    <span className="text-gray-600">Totalt (fond m/ data)</span>
                                    <span style={{ color: '#D97706' }}>{formatCurrency(eksTotalBelop)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Slå sammen eksisterende + ekstern → Nåværende portefølje */}
                            {harEksisterendePortefoljeChart && harKonkurrentPortefolje && (
                              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-purple-200 bg-purple-50/50 cursor-pointer hover:bg-purple-50">
                                <input type="checkbox" checked={slaSammenPortefoljer} onChange={e => setSlaSammenPortefoljer(e.target.checked)}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <div>
                                  <span className="text-xs font-semibold text-purple-700">Slå sammen til «Nåværende portefølje»</span>
                                  <p className="text-[10px] text-gray-500 mt-0.5">Kombinerer eksisterende fond og eksterne fond til én felles porteføljelinje</p>
                                </div>
                              </label>
                            )}

                            {/* Bygg ekstern portefølje — sett vekter på fond */}
                            {valgteFond.length > 0 && (
                              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#059669' }}>Bygg ekstern portefølje</div>
                                    <p className="text-xs text-gray-500 mt-0.5">Sett vekter på fondene over for å bygge en sammenligningsportefølje</p>
                                  </div>
                                  <button
                                    onClick={() => setVisKonkurrentPortefolje(prev => !prev)}
                                    className={"px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all " + (visKonkurrentPortefolje ? "text-white border-transparent" : "border-emerald-300 hover:border-emerald-500")}
                                    style={visKonkurrentPortefolje ? { backgroundColor: '#059669', borderColor: '#059669' } : { color: '#059669' }}>
                                    {visKonkurrentPortefolje ? '✓ Aktiv' : 'Aktiver'}
                                  </button>
                                </div>
                                {visKonkurrentPortefolje && (
                                  <div className="space-y-2">
                                    {valgteFond.map((f, i) => (
                                      <div key={f.isin} className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: FOND_FARGER[i % FOND_FARGER.length] }}></span>
                                        <span className="text-xs text-gray-700 flex-1 truncate">{f.n}</span>
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number" min="0" max="100" step="5"
                                            value={fondVekter[f.isin] || ''}
                                            onChange={e => setFondVekter(prev => ({ ...prev, [f.isin]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
                                            placeholder="0"
                                            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded focus:ring-1 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                                          />
                                          <span className="text-xs text-gray-400">%</span>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                                      <span className="text-xs font-semibold text-gray-600">Total vekt:</span>
                                      <span className={"text-xs font-bold " + (Math.abs(valgteFond.reduce((s, f) => s + (fondVekter[f.isin] || 0), 0) - 100) < 1 ? 'text-green-600' : 'text-amber-600')}>
                                        {valgteFond.reduce((s, f) => s + (fondVekter[f.isin] || 0), 0)}%
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const perFond = Math.round(100 / valgteFond.length);
                                        const nyeVekter = {};
                                        valgteFond.forEach((f, i) => { nyeVekter[f.isin] = i === valgteFond.length - 1 ? 100 - perFond * (valgteFond.length - 1) : perFond; });
                                        setFondVekter(nyeVekter);
                                      }}
                                      className="text-xs text-emerald-700 hover:text-emerald-900 underline">
                                      Fordel likt
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={skjulEnkeltfond} onChange={e => setSkjulEnkeltfond(e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                              <span className="text-xs text-gray-600">Skjul enkeltfond i grafene (vis kun porteføljene)</span>
                            </label>
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          Kilde: Morningstar. Avkastning oppgitt i NOK. Data oppdatert per februar 2026. ~{eksterneFond?.length || 0} fond tilgjengelig.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Linjegraf (combined: Pensum + indekser + external funds + competitor) */}
                  {alleSammenligningsNavn.length > 0 && sammenligningsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart data={sammenligningsData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                          tickFormatter={(d) => { const p = parseHistorikkDato(d); if (!p) return ''; return `${String(p.getMonth()+1).padStart(2,'0')}/${String(p.getFullYear()).slice(2)}`; }}
                          interval={Math.max(1, Math.floor(sammenligningsData.length / 12))} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + ' %'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step, Math.ceil(dataMax / step) * step]; }} />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const sortert = [...payload].filter(p => p.value !== undefined && p.value !== null).sort((a, b) => b.value - a.value);
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-xs">
                              <div className="font-semibold text-gray-500 mb-1.5 pb-1.5 border-b border-gray-100">{formatHistorikkEtikett(label)}</div>
                              {sortert.map(p => (
                                <div key={p.name} className="flex items-center gap-2 py-0.5">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}></span>
                                  <span className="text-gray-600 flex-1">{p.name}</span>
                                  <span className={"font-semibold tabular-nums ml-3 " + (p.value >= 0 ? 'text-green-700' : 'text-red-600')}>
                                    {p.value >= 0 ? '+' : ''}{pst(p.value.toFixed(1).replace('.', ','))} %
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                        <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" />
                        {alleSammenligningsNavn.map(n => {
                          const erPortefolje = n === 'Pensum-forslaget' || n === 'Samlet portefølje';
                          const erEks = n === 'Eksisterende portefølje';
                          const erKonk = n === 'Ekstern portefølje';
                          const erIndeks = !!REFERANSE_DATA[n];
                          const farge = getLineFarge(n);
                          return (
                            <Line key={n} type="monotone" dataKey={n} stroke={farge}
                              strokeWidth={erPortefolje || erEks || erKonk ? 3 : erIndeks ? 1.5 : 2} dot={false} activeDot={{ r: erPortefolje || erEks ? 5 : 4 }}
                              strokeDasharray={erIndeks ? '4 3' : (erEks ? '6 3' : undefined)} connectNulls />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                      Velg fond og/eller indekser for å se sammenligning
                    </div>
                  )}

                  {/* Secondary tabs — visible when any comparison data is active */}
                  {(harFondEllerKonk || harNoeAVise || valgteIndekserScen.length > 0) && (() => {
                    const avkData = fondSammenligningVisning === 'avkastning' ? byggAvkastningsdataMedKonk() : null;
                    const aarsData = fondSammenligningVisning === 'kalenderaar' ? byggAarsdataMedKonk() : null;
                    const nokkeltallData = fondSammenligningVisning === 'nokkeltall' ? byggNokkeltall() : null;
                    const sektorData = fondSammenligningVisning === 'sektor' ? byggSektordata() : null;
                    const regionData = fondSammenligningVisning === 'region' ? byggRegiondata() : null;
                    return (
                      <div className="mt-6 pt-5 border-t border-gray-100">
                        <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1">
                          {[
                            { key: 'avkastning', label: 'Periodeavkastning' },
                            { key: 'kalenderaar', label: 'Kalenderår' },
                            { key: 'nokkeltall', label: 'Nøkkeltall' },
                            ...((valgteFond.length > 0 || harPortefolje || harEksisterendePortefoljeChart) ? [
                              { key: 'sektor', label: 'Sektorfordeling' },
                              { key: 'region', label: 'Landfordeling' },
                            ] : []),
                            ...(valgteFond.length > 0 ? [
                              { key: 'detaljer', label: 'Fondsdetaljer' },
                            ] : []),
                          ].map(v => (
                            <button key={v.key} onClick={() => setFondSammenligningVisning(v.key)}
                              className={"flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors " + (fondSammenligningVisning === v.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                              {v.label}
                            </button>
                          ))}
                        </div>

                        {/* Periodeavkastning bar chart */}
                        {fondSammenligningVisning === 'avkastning' && avkData && (
                          <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={avkData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }} barCategoryGap="30%" barGap={3}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="periode" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${pst(v)} %`} />
                              <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const sortert = [...payload].filter(p => p.value !== undefined && p.value !== null).sort((a, b) => b.value - a.value);
                                return (
                                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-xs">
                                    <div className="font-semibold text-gray-500 mb-1.5 pb-1.5 border-b border-gray-100">{label}</div>
                                    {sortert.map(p => (
                                      <div key={p.name} className="flex items-center gap-2 py-0.5">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill || p.color }}></span>
                                        <span className="text-gray-600 flex-1">{p.name}</span>
                                        <span className={"font-semibold tabular-nums ml-3 " + (p.value >= 0 ? 'text-green-700' : 'text-red-600')}>
                                          {p.value >= 0 ? '+' : ''}{pst(p.value.toFixed(2).replace('.', ','))} %
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }} />
                              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                              <ReferenceLine y={0} stroke="#9CA3AF" />
                              {alleSerieNavnTab.map((n, i) => (
                                <Bar key={n} dataKey={n} fill={getSerieColor(n, i)} radius={[3, 3, 0, 0]} maxBarSize={28} stroke="#fff" strokeWidth={1} label={({ x, y, width, value }) => {
                                  if (value === undefined || value === null) return null;
                                  return <text x={x + width / 2} y={y - 4} fill="#4B5563" textAnchor="middle" fontSize={8} fontWeight={600}>{value >= 0 ? '+' : ''}{value.toFixed(1).replace('.', ',')} %</text>;
                                }} />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        )}

                        {/* Kalenderårsavkastning */}
                        {fondSammenligningVisning === 'kalenderaar' && aarsData && (
                          <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={aarsData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }} barCategoryGap="25%" barGap={3}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="periode" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${pst(v)} %`} />
                              <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const sortert = [...payload].filter(p => p.value !== undefined && p.value !== null).sort((a, b) => b.value - a.value);
                                return (
                                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-xs">
                                    <div className="font-semibold text-gray-500 mb-1.5 pb-1.5 border-b border-gray-100">{label}</div>
                                    {sortert.map(p => (
                                      <div key={p.name} className="flex items-center gap-2 py-0.5">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill || p.color }}></span>
                                        <span className="text-gray-600 flex-1">{p.name}</span>
                                        <span className={"font-semibold tabular-nums ml-3 " + (p.value >= 0 ? 'text-green-700' : 'text-red-600')}>
                                          {p.value >= 0 ? '+' : ''}{pst(p.value.toFixed(2).replace('.', ','))} %
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }} />
                              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                              <ReferenceLine y={0} stroke="#9CA3AF" />
                              {alleSerieNavnTab.map((n, i) => (
                                <Bar key={n} dataKey={n} fill={getSerieColor(n, i)} radius={[3, 3, 0, 0]} maxBarSize={28} stroke="#fff" strokeWidth={1} label={({ x, y, width, value }) => {
                                  if (value === undefined || value === null) return null;
                                  return <text x={x + width / 2} y={y - 4} fill="#4B5563" textAnchor="middle" fontSize={8} fontWeight={600}>{value >= 0 ? '+' : ''}{value.toFixed(1).replace('.', ',')} %</text>;
                                }} />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        )}

                        {/* Nøkkeltall — risikometrikker */}
                        {fondSammenligningVisning === 'nokkeltall' && nokkeltallData && nokkeltallData.length > 0 && (() => {
                          const metrikker = [
                            { key: 'totalAvk', label: 'Total avkastning', suffix: '%', desc: 'Indeksert avkastning i valgt periode' },
                            { key: 'annualisert', label: 'Annualisert avk.', suffix: ' % p.a.', desc: 'Geometrisk gjennomsnittlig årlig avkastning' },
                            { key: 'volatilitet', label: 'Volatilitet', suffix: '%', desc: 'Annualisert standardavvik for månedlig avkastning' },
                            { key: 'sharpe', label: 'Sharpe ratio', suffix: '', desc: 'Risikojustert avkastning (rf = 3%)' },
                            { key: 'maxDrawdown', label: 'Maks nedgang', suffix: '%', desc: 'Største fall fra topp til bunn' },
                            { key: 'besteMaaned', label: 'Beste måned', suffix: 'pp', desc: 'Høyeste månedlige endring' },
                            { key: 'versteMaaned', label: 'Verste måned', suffix: 'pp', desc: 'Laveste månedlige endring' },
                          ];
                          // Find best value per metric for highlighting
                          const bestVerdier = {};
                          metrikker.forEach(m => {
                            const vals = nokkeltallData.map(d => d[m.key]).filter(v => v !== null);
                            if (m.key === 'maxDrawdown' || m.key === 'versteMaaned') {
                              bestVerdier[m.key] = Math.max(...vals); // Closest to 0 is best
                            } else {
                              bestVerdier[m.key] = Math.max(...vals);
                            }
                          });
                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                                    <th className="py-3 px-4 text-left text-white font-semibold sticky left-0 z-10 min-w-[160px]" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Metrikk</th>
                                    {nokkeltallData.map(d => (
                                      <th key={d.navn} className="py-3 px-3 text-center font-semibold min-w-[100px]" style={{ color: 'white' }}>
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.farge }}></span>
                                          <span className="max-w-[120px] truncate" title={d.navn}>{d.navn}</span>
                                        </div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {metrikker.map((m, mIdx) => (
                                    <tr key={m.key} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                                      <td className={"py-3 px-4 font-medium sticky left-0 z-10 " + (mIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50')} style={{ color: PENSUM_COLORS.darkBlue }}>
                                        <div>{m.label}</div>
                                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">{m.desc}</div>
                                      </td>
                                      {nokkeltallData.map(d => {
                                        const val = d[m.key];
                                        const erBest = val === bestVerdier[m.key] && nokkeltallData.length > 1;
                                        const erNegativ = val < 0;
                                        return (
                                          <td key={d.navn} className="py-3 px-3 text-center tabular-nums">
                                            <span className={
                                              "inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-semibold " +
                                              (erBest ? "ring-2 ring-offset-1 " : "") +
                                              (m.key === 'sharpe'
                                                ? (val >= 1 ? 'bg-green-50 text-green-700' : val >= 0.5 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600')
                                                : m.key === 'maxDrawdown' || m.key === 'versteMaaned'
                                                  ? (val >= -5 ? 'bg-green-50 text-green-700' : val >= -15 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600')
                                                  : (erNegativ ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'))
                                            } style={erBest ? { ringColor: d.farge, '--tw-ring-color': d.farge } : {}}>
                                              {m.key === 'sharpe' ? val.toFixed(2).replace('.', ',') : (val >= 0 && m.key !== 'maxDrawdown' ? '+' : '') + val.toFixed(1).replace('.', ',') + m.suffix}
                                            </span>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-3 text-[10px] text-gray-400 px-1">
                                Beregnet fra månedlige datapunkter i valgt periode. Sharpe ratio bruker risikofri rente på {RISIKOFRI_RENTE_TEKST}. Volatilitet er annualisert standardavvik.
                              </div>
                            </div>
                          );
                        })()}

                        {/* Sektorfordeling */}
                        {fondSammenligningVisning === 'sektor' && sektorData && sektorData.length > 0 && (() => {
                          // Hent kun serienavn som finnes i dataene (ekskluderer porteføljer/indekser uten sektordata)
                          const sektorSerier = [...new Set(sektorData.flatMap(d => Object.keys(d).filter(k => k !== 'sektor')))];
                          return (
                            <ResponsiveContainer width="100%" height={Math.max(300, sektorData.length * 40)}>
                              <BarChart data={sektorData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${pst(v)} %`} />
                                <YAxis type="category" dataKey="sektor" tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                                <Tooltip content={({ active, payload, label }) => {
                                  if (!active || !payload?.length) return null;
                                  const sortert = [...payload].filter(p => p.value !== undefined && p.value !== null).sort((a, b) => b.value - a.value);
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-xs">
                                      <div className="font-semibold text-gray-500 mb-1.5 pb-1.5 border-b border-gray-100">{label}</div>
                                      {sortert.map(p => (
                                        <div key={p.name} className="flex items-center gap-2 py-0.5">
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill || p.color }}></span>
                                          <span className="text-gray-600 flex-1">{p.name}</span>
                                          <span className="font-semibold tabular-nums ml-3 text-gray-800">{p.value.toFixed(1).replace('.', ',')} %</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                                {sektorSerier.map((n, i) => {
                                  const fondIdx = valgteFond.findIndex(f => f.n === n);
                                  return <Bar key={n} dataKey={n} fill={fondIdx >= 0 ? FOND_FARGER[fondIdx % FOND_FARGER.length] : getSerieColor(n, i)} radius={[0, 3, 3, 0]} maxBarSize={20} />;
                                })}
                              </BarChart>
                            </ResponsiveContainer>
                          );
                        })()}

                        {/* Landfordeling */}
                        {fondSammenligningVisning === 'region' && regionData && regionData.length > 0 && (() => {
                          const regionSerier = [...new Set(regionData.flatMap(d => Object.keys(d).filter(k => k !== 'region')))];
                          return (
                            <ResponsiveContainer width="100%" height={Math.max(300, regionData.length * 40)}>
                              <BarChart data={regionData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${pst(v)} %`} />
                                <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                                <Tooltip content={({ active, payload, label }) => {
                                  if (!active || !payload?.length) return null;
                                  const sortert = [...payload].filter(p => p.value !== undefined && p.value !== null).sort((a, b) => b.value - a.value);
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-xs">
                                      <div className="font-semibold text-gray-500 mb-1.5 pb-1.5 border-b border-gray-100">{label}</div>
                                      {sortert.map(p => (
                                        <div key={p.name} className="flex items-center gap-2 py-0.5">
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill || p.color }}></span>
                                          <span className="text-gray-600 flex-1">{p.name}</span>
                                          <span className="font-semibold tabular-nums ml-3 text-gray-800">{p.value.toFixed(1).replace('.', ',')} %</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                                {regionSerier.map((n, i) => {
                                  const fondIdx = valgteFond.findIndex(f => f.n === n);
                                  return <Bar key={n} dataKey={n} fill={fondIdx >= 0 ? FOND_FARGER[fondIdx % FOND_FARGER.length] : getSerieColor(n, i)} radius={[0, 3, 3, 0]} maxBarSize={20} />;
                                })}
                              </BarChart>
                            </ResponsiveContainer>
                          );
                        })()}

                        {/* Fondsdetaljer tabell */}
                        {fondSammenligningVisning === 'detaljer' && valgteFond.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10 min-w-[180px]">Fond</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Kategori</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Valuta</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">ISIN</th>
                                  <th className="py-2.5 px-3 text-right font-semibold text-gray-600">AUM (USD)</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Oppstart</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Referanseindeks</th>
                                  <th className="py-2.5 px-3 text-left font-semibold text-gray-600">SFDR</th>
                                  <th className="py-2.5 px-3 text-right font-semibold text-gray-600">Std.avvik 3 år</th>
                                  <th className="py-2.5 px-3 text-right font-semibold text-gray-600">Stil</th>
                                </tr>
                              </thead>
                              <tbody>
                                {valgteFond.map((f, i) => (
                                  <tr key={f.isin || f.n} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className={"py-2 px-3 font-medium sticky left-0 z-10 " + (i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: FOND_FARGER[i % FOND_FARGER.length] }}></span>
                                        <span style={{ color: PENSUM_COLORS.darkBlue }}>{f.n}</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-gray-600">{f.cat || '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-600">{f.cur || '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-500 font-mono">{f.isin || '\u2014'}</td>
                                    <td className="py-2 px-3 text-right text-gray-600 tabular-nums">{f.aum ? `$${(f.aum / 1e6).toFixed(0)}M` : '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-600">{f.inc || '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-500 max-w-[200px] truncate" title={f.bench}>{f.bench || '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-600">{f.sfdr?.replace('SFDR Product', '').replace('EET ', '').trim() || '\u2014'}</td>
                                    <td className="py-2 px-3 text-right text-gray-600 tabular-nums">{f.sd3y ? `${f.sd3y.toFixed(1).replace('.', ',')} %` : '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-600">
                                      {f.stVal || f.stCore || f.stGro ? (
                                        <div className="flex gap-1">
                                          {f.stVal ? <span className="text-[10px] px-1 py-0.5 rounded bg-blue-50 text-blue-600">V {f.stVal.toFixed(0).replace('.', ',')} %</span> : null}
                                          {f.stCore ? <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">C {f.stCore.toFixed(0).replace('.', ',')} %</span> : null}
                                          {f.stGro ? <span className="text-[10px] px-1 py-0.5 rounded bg-green-50 text-green-600">G {f.stGro.toFixed(0).replace('.', ',')} %</span> : null}
                                        </div>
                                      ) : '\u2014'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ====== ÅRSAVKASTNING PENSUM (heatmap-tabell, bilde 2-style) ====== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <h3 className="text-lg font-semibold text-white">Årsavkastning</h3>
                  <p className="text-blue-300 text-sm mt-0.5">Kalenderårsavkastning for alle Pensum-løsninger (2026 = YTD per {RAPPORT_DATO})</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left font-semibold text-gray-600 w-40 sticky left-0 bg-gray-50 z-10">Produkt</th>
                        {AAR_KOLONNER.map(a => <th key={a} className="py-3 px-2 text-center font-semibold text-gray-600 min-w-[56px]">{a === RAPPORT_AAR_TALL ? `${a} YTD` : a}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(PENSUM_AARLIG).map(([navn, info], idx) => (
                        <tr key={navn} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className={"py-2 px-4 font-medium sticky left-0 z-10 " + (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')} style={{ color: PENSUM_COLORS.darkBlue }}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.farge }}></span>
                              {navn}
                            </div>
                          </td>
                          {AAR_KOLONNER.map(aar => {
                            const v = info.data[aar];
                            return (
                              <td key={aar} className="py-1.5 px-1 text-center">
                                {v !== null && v !== undefined ? (
                                  <span className="inline-block px-1.5 py-1 rounded text-xs font-semibold min-w-[48px]"
                                    style={{ backgroundColor: heatmapFarge(v), color: textFarge(v) }}>
                                    {v >= 0 ? '+' : ''}{v.toFixed(1).replace('.', ',')} %
                                  </span>
                                ) : (
                                  <span className="text-gray-200">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ====== REFERANSEINDEKSER HEATMAP (bilde 1-style) ====== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <h3 className="text-lg font-semibold text-white">Referanseindekser</h3>
                  <p className="text-blue-300 text-sm mt-0.5">Kalenderårsavkastning for utvalgte indekser (2026 = YTD per {RAPPORT_DATO})</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left font-semibold text-gray-600 w-44 sticky left-0 bg-gray-50 z-10">Indeks</th>
                        {AAR_KOLONNER.map(a => <th key={a} className="py-3 px-2 text-center font-semibold text-gray-600 min-w-[56px]">{a === RAPPORT_AAR_TALL ? `${a} YTD` : a}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(REFERANSE_DATA).map(([navn, info], idx) => (
                        <tr key={navn} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className={"py-2 px-4 font-medium sticky left-0 z-10 " + (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')} style={{ color: PENSUM_COLORS.darkBlue }}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.farge }}></span>
                              {navn}
                            </div>
                          </td>
                          {AAR_KOLONNER.map(aar => {
                            const v = info.data[aar];
                            return (
                              <td key={aar} className="py-1.5 px-1 text-center">
                                {v !== null && v !== undefined ? (
                                  <span className="inline-block px-1.5 py-1 rounded text-xs font-semibold min-w-[48px]"
                                    style={{ backgroundColor: heatmapFarge(v), color: textFarge(v) }}>
                                    {v >= 0 ? '+' : ''}{v.toFixed(1).replace('.', ',')} %
                                  </span>
                                ) : (
                                  <span className="text-gray-200">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                  Historisk avkastning er ingen garanti for fremtidig avkastning. Tall er oppdatert til og med {RAPPORT_DATO}. 2026 er delvis år (YTD). Alle indekser er oppgitt i NOK.
                </div>
              </div>

              {/* ====== ANALYSE DASHBOARD (integrert) ====== */}
              {(() => {
                const dashPeriodeFilter = {
                  '1y': periodeStartDato(1),
                  '3y': periodeStartDato(3),
                  '5y': periodeStartDato(5),
                  'max': new Date(2015, 0, 1)
                };
                const dashStartDato = dashPeriodeFilter[dashboardPeriode];
                const produktFarger2 = {
                  'global-core-active': PENSUM_COLORS.navy, 'global-edge': PENSUM_COLORS.lightBlue, 'basis': PENSUM_COLORS.salmon,
                  'global-hoyrente': PENSUM_COLORS.teal, 'nordisk-hoyrente': PENSUM_COLORS.purple,
                  'norge-a': PENSUM_COLORS.red, 'energy-a': PENSUM_COLORS.gold, 'banking-d': PENSUM_COLORS.midBlue, 'financial-d': PENSUM_COLORS.gray
                };
                const produktNavn2 = {
                  'global-core-active': 'Global Core Active', 'global-edge': 'Global Edge', 'basis': 'Basis',
                  'global-hoyrente': 'Global Høyrente', 'nordisk-hoyrente': 'Nordisk Høyrente',
                  'norge-a': 'Norge A', 'energy-a': 'Global Energy A', 'banking-d': 'Nordic Banking', 'financial-d': 'Financial Opp.'
                };
                const alleHistorikk2 = produktHistorikk;
                const allStatistikk = dashboardProdukter.map(id => {
                  const stat = beregnProduktStatistikk(alleHistorikk2[id], dashStartDato);
                  return stat ? { ...stat, id } : null;
                }).filter(Boolean);
                const ddDatoer = new Set();
                allStatistikk.forEach(s => s.drawdownSerie.forEach(d => ddDatoer.add(d.dato)));
                const ddData = Array.from(ddDatoer).sort().map(dato => {
                  const punkt = { dato };
                  allStatistikk.forEach(s => { const match = s.drawdownSerie.find(d => d.dato === dato); if (match) punkt[s.id] = match.dd; });
                  return punkt;
                });
                const dashChartDatoer = new Set();
                const dashProdMaps = {};
                dashboardProdukter.forEach(id => {
                  const hist = alleHistorikk2[id];
                  if (hist && hist.data) {
                    const dMap = new Map();
                    hist.data.forEach(d => { const parsed = parseHistorikkDato(d.dato); if (parsed && parsed >= dashStartDato) { dashChartDatoer.add(d.dato); dMap.set(d.dato, d.verdi); } });
                    dashProdMaps[id] = { dMap, startVerdi: finnStartVerdiVedPeriode(hist.data, dashStartDato) };
                  }
                });
                const dashChartData = Array.from(dashChartDatoer).sort().map(dato => {
                  const punkt = { dato };
                  dashboardProdukter.forEach(id => {
                    const pm = dashProdMaps[id];
                    if (pm) {
                      const verdi = pm.dMap.get(dato);
                      if (verdi !== undefined) {
                        punkt[id] = parseFloat((((verdi / pm.startVerdi) - 1) * 100).toFixed(2));
                      }
                    }
                  });
                  return punkt;
                });
                const alleProdukter2 = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...(pensumProdukter.eksterneFond || [])];
                const sortedBySharpe = [...allStatistikk].sort((a, b) => b.sharpe - a.sharpe);
                const sortedByAvk = [...allStatistikk].sort((a, b) => b.aarligAvkastning - a.aarligAvkastning);
                const sortedByVol = [...allStatistikk].sort((a, b) => a.standardavvik - b.standardavvik);

                // Korrelasjonsmatrise
                const korrHistorikk = {};
                dashboardProdukter.forEach(id => { if (alleHistorikk2[id]) korrHistorikk[id] = alleHistorikk2[id]; });
                const korrelasjon = beregnKorrelasjonsmatrise(korrHistorikk, dashStartDato);
                const korrFarge = (v) => {
                  if (v === null) return '#F3F4F6';
                  if (v >= 0.8) return PENSUM_COLORS.salmon;
                  if (v >= 0.5) return '#D4B8A8';
                  if (v >= 0.2) return '#E8D8CE';
                  if (v >= -0.2) return '#D6E8E8';
                  if (v >= -0.5) return '#7AADAD';
                  return PENSUM_COLORS.teal;
                };
                const korrTextFarge = (v) => {
                  if (v === null) return '#9CA3AF';
                  if (v >= 0.8 || v <= -0.5) return '#FFFFFF';
                  return PENSUM_COLORS.charcoal;
                };

                return (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Analyse Dashboard</h2>
                          <p className="text-sm text-gray-500 mt-1">Historisk utvikling, risikometrikk og korrelasjonsanalyse — Pensum Løsninger</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 mr-1">Periode:</span>
                          {['1y', '3y', '5y', 'max'].map(p => (
                            <button key={p} onClick={() => setDashboardPeriode(p)}
                              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors " + (dashboardPeriode === p ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                              style={dashboardPeriode === p ? { backgroundColor: PENSUM_COLORS.darkBlue } : {}}>
                              {p === '1y' ? '1 År' : p === '3y' ? '3 År' : p === '5y' ? '5 År' : 'Maks'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {alleProdukter2.map(p => {
                          const aktiv = dashboardProdukter.includes(p.id);
                          return (
                            <button key={p.id}
                              onClick={() => setDashboardProdukter(prev => aktiv ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                              style={aktiv ? { backgroundColor: produktFarger2[p.id] || PENSUM_COLORS.darkBlue } : {}}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : produktFarger2[p.id] || '#999' }}></span>
                              {p.navn.replace('Pensum ', '')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <h3 className="text-lg font-semibold text-white">Historisk utvikling (prosentvis avkastning)</h3>
                        <span className="text-xs text-blue-200 bg-blue-900 px-2 py-1 rounded">Pensum Løsninger</span>
                      </div>
                      <div className="p-6">
                        {dashChartData.length > 0 && dashboardProdukter.length > 0 ? (
                          <ResponsiveContainer width="100%" height={380}>
                            <LineChart data={dashChartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="dato" tick={{ fontSize: 10, fill: "#6B7280" }}
                                tickFormatter={(d) => { const p = parseHistorikkDato(d); if (!p) return ''; const m = p.getMonth()+1; const day = p.getDate(); if (day <= 3 && (m === 1 || m === 7)) return `${String(m).padStart(2,'0')}/${String(p.getFullYear()).slice(2)}`; return ''; }}
                                interval={20} />
                              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(1).replace('.', ',') + ' %'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step, Math.ceil(dataMax / step) * step]; }} />
                              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                                labelFormatter={(d) => formatHistorikkEtikett(d)}
                                formatter={(v, name) => [v.toFixed(1).replace('.', ',') + ' %', produktNavn2[name] || name]} />
                              <Legend verticalAlign="bottom" height={36} formatter={(v) => produktNavn2[v] || v} />
                              <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" />
                              {dashboardProdukter.filter(id => alleHistorikk2[id]).map(id => (
                                <Line key={id} type="monotone" dataKey={id} stroke={produktFarger2[id] || "#999"} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-gray-400">Velg produkter for å se utvikling</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <h3 className="text-lg font-semibold text-white">Nøkkeltall — risiko og avkastning</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: "#F8FAFC" }}>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Produkt</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Avk. p.a.</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Siden oppstart</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Volatilitet</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Sharpe</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Maks DD</th>
                              <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Total avk.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...allStatistikk].sort((a, b) => b.aarligAvkastning - a.aarligAvkastning).map((s, idx) => (
                              <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="py-3 px-4 font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: produktFarger2[s.id] || "#999" }}></span>
                                    {produktNavn2[s.id] || s.id}
                                  </div>
                                </td>
                                <td className={"py-3 px-3 text-right font-semibold " + (s.aarligAvkastning >= 0 ? "text-green-600" : "text-red-600")}>
                                  {s.aarligAvkastning >= 0 ? "+" : ""}{s.aarligAvkastning.toFixed(2).replace('.', ',')} %
                                </td>
                                <td className={"py-3 px-3 text-right " + (erGyldigTall(s.avkSidenOppstart) ? (s.avkSidenOppstart >= 0 ? "text-green-600" : "text-red-600") : "text-gray-400")}>
                                  {erGyldigTall(s.avkSidenOppstart) ? (s.avkSidenOppstart >= 0 ? "+" : "") + s.avkSidenOppstart.toFixed(2).replace('.', ',') + " % p.a." : "—"}
                                </td>
                                <td className="py-3 px-3 text-right text-gray-700">{s.standardavvik.toFixed(1).replace('.', ',')} %</td>
                                <td className="py-3 px-3 text-right">
                                  <span className={"font-bold px-2 py-0.5 rounded text-xs " + (s.sharpe >= 1 ? "bg-green-100 text-green-700" : s.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                                    {s.sharpe.toFixed(2).replace('.', ',')}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right text-red-600 font-medium">{s.maxDrawdown.toFixed(1).replace('.', ',')} %</td>
                                <td className={"py-3 px-3 text-right " + (s.totalAvkastning >= 0 ? "text-green-600" : "text-red-600")}>
                                  {s.totalAvkastning >= 0 ? "+" : ""}{s.totalAvkastning.toFixed(1).replace('.', ',')} %
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                        Sharpe beregnet med risikofri rente {RISIKOFRI_RENTE_TEKST}. Volatilitet = annualisert standardavvik (månedlig). Maks DD = størst kursfall fra topp til bunn. Siden oppstart = annualisert avkastning fra desember 2019.
                      </div>
                      <div className="p-4 border-t border-gray-100">{renderHistorikkDisclaimer()}</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <h3 className="text-lg font-semibold text-white">Drawdown-analyse — kursfall fra topp (%)</h3>
                      </div>
                      <div className="p-6">
                        {ddData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={ddData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="dato" tick={{ fontSize: 10, fill: "#6B7280" }}
                                tickFormatter={(d) => { const p = parseHistorikkDato(d); if (!p) return ''; const m = p.getMonth()+1; const day = p.getDate(); if (day <= 3 && (m === 1 || m === 7)) return `${String(m).padStart(2,'0')}/${String(p.getFullYear()).slice(2)}`; return ''; }}
                                interval={20} />
                              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(0).replace('.', ',') + " %"} domain={["dataMin - 2", 0]} />
                              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                                formatter={(v, name) => [v.toFixed(1).replace('.', ',') + " %", produktNavn2[name] || name]} />
                              <Legend verticalAlign="bottom" height={36} formatter={(v) => produktNavn2[v] || v} />
                              <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                              {allStatistikk.map(s => (
                                <Line key={s.id} type="monotone" dataKey={s.id} stroke={produktFarger2[s.id] || "#999"} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-48 flex items-center justify-center text-gray-400">Ingen data</div>
                        )}
                      </div>
                    </div>

                    {/* Korrelasjonsmatrise */}
                    {korrelasjon.labels.length >= 2 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                          <h3 className="text-lg font-semibold text-white">Korrelasjonsmatrise</h3>
                          <p className="text-blue-300 text-sm mt-0.5">Pearson-korrelasjon basert på månedlige avkastninger. Lavere korrelasjon = bedre diversifisering.</p>
                        </div>
                        <div className="overflow-x-auto p-4">
                          <table className="text-xs mx-auto">
                            <thead>
                              <tr>
                                <th className="p-2"></th>
                                {korrelasjon.labels.map(id => (
                                  <th key={id} className="p-2 text-center font-medium" style={{ color: PENSUM_COLORS.darkBlue, minWidth: '60px', maxWidth: '80px' }}>
                                    <span className="block truncate">{produktNavn2[id] || id}</span>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {korrelasjon.labels.map((idRow, i) => (
                                <tr key={idRow}>
                                  <td className="p-2 font-medium text-right pr-3 whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>
                                    {produktNavn2[idRow] || idRow}
                                  </td>
                                  {korrelasjon.labels.map((idCol, j) => {
                                    const v = korrelasjon.matrix[i]?.[j];
                                    return (
                                      <td key={idCol} className="p-1 text-center">
                                        <span className="inline-block w-14 py-1.5 rounded text-xs font-semibold"
                                          style={{ backgroundColor: i === j ? PENSUM_COLORS.darkBlue : korrFarge(v), color: i === j ? 'white' : korrTextFarge(v) }}>
                                          {v !== null ? v.toFixed(2).replace('.', ',') : '—'}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.teal }}></span> Lav (&lt;−0,2)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#D6E8E8' }}></span> Moderat (−0,2 – 0,2)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#E8D8CE' }}></span> Middels (0,2 – 0,5)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#D4B8A8' }}></span> Høy (0,5 – 0,8)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.salmon }}></span> Svært høy (&gt;0,8)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {allStatistikk.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#E8F0F0', borderColor: '#B8D4D4' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.teal }}>Beste Sharpe Ratio</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedBySharpe[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.teal }}>{sortedBySharpe[0].sharpe.toFixed(2).replace('.', ',')}</div>
                          <div className="text-xs mt-1" style={{ color: '#4A8A8A' }}>{sortedBySharpe[0].aarligAvkastning.toFixed(1).replace('.', ',')} % p.a. / {sortedBySharpe[0].standardavvik.toFixed(1).replace('.', ',')} % vol.</div>
                        </div>
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#E8F0F4', borderColor: '#B8D0DB' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.lightBlue }}>Høyest avkastning</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedByAvk[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.lightBlue }}>{sortedByAvk[0].aarligAvkastning.toFixed(2).replace('.', ',')} % p.a.</div>
                          <div className="text-xs mt-1" style={{ color: '#5A8DA5' }}>{sortedByAvk[0].sharpe.toFixed(2).replace('.', ',')} Sharpe / {sortedByAvk[0].standardavvik.toFixed(1).replace('.', ',')} % vol.</div>
                        </div>
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#FDF6F2', borderColor: '#E8CFC2' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.salmon }}>Lavest risiko</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedByVol[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.salmon }}>{sortedByVol[0].standardavvik.toFixed(1).replace('.', ',')} % vol.</div>
                          <div className="text-xs mt-1" style={{ color: '#B8917D' }}>{sortedByVol[0].aarligAvkastning.toFixed(1).replace('.', ',')} % p.a. / Sharpe: {sortedByVol[0].sharpe.toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <strong>Viktig informasjon:</strong> Historisk avkastning er ingen garanti for fremtidig avkastning. Sharpe Ratio er beregnet med risikofri rente på {RISIKOFRI_RENTE_TEKST} p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det størst relative kursfallet fra topp til bunn i den valgte perioden. Korrelasjonsmatrise viser samvariasjon mellom produkter — lav korrelasjon indikerer bedre diversifisering. Store deler av historikken før fondenes oppstart er estimert. Kilde: {DATAFEED_KILDE}.
                    </div>
                  </>
                );
              })()}

            </div>
          );
        })()}

        {activeTab === 'belaning' && (
          <div className="max-w-7xl mx-auto p-6">
            <PensumBelaning defaultPortfolioValue={investertBelop !== null ? investertBelop : totalKapital} />
          </div>
        )}

        {activeTab === 'rapport' && (
          <div className="gap-6" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr)' }} data-forslag-fane>
            <div className="no-print">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" style={{ position: 'sticky', top: 16 }}>
                <h3 className="text-base font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsforslag</h3>
                <p className="text-xs text-gray-500 mt-1">Det du ser her, er lysbildene som lastes ned. Tekst, tall og grafer kan redigeres i PowerPoint.</p>
                <button onClick={handleLastNedForslag} disabled={forslagLaster || !forslagForhandsvisning?.slides?.length}
                  className="mt-4 w-full py-3 px-4 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: PENSUM_COLORS.salmon }}>
                  {forslagLaster ? 'Lager presentasjonen …' : `Last ned PowerPoint (${forslagForhandsvisning?.slides?.length || 0} sider)`}
                </button>
                {forslagVarsler.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" data-forslag-varsler>
                    <div className="font-semibold mb-1">Sjekk før du sender</div>
                    <ul className="list-disc ml-4 space-y-1">{forslagVarsler.map((v) => <li key={v}>{v}</li>)}</ul>
                  </div>
                )}
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-5 mb-1">Rådgivers vurdering</div>
                <textarea value={forslagVurdering} onChange={(e) => setForslagVurdering(e.target.value.slice(0, 280))} rows={4} aria-label="Rådgivers vurdering"
                  placeholder="Skriv din egen vurdering (valgfritt). Tomt felt gir standardteksten."
                  className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-300" />
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-4">
                  <input type="checkbox" checked={visRadgiver2} onChange={(e) => setVisRadgiver2(e.target.checked)} />
                  Tilleggsrådgiver
                </label>
                {visRadgiver2 && (
                  <div className="mt-2 space-y-1.5" data-radgiver2>
                    {[['navn', 'Navn'], ['tittel', 'Tittel (f.eks. Investeringsrådgiver)'], ['telefon', 'Telefon'], ['epost', 'E-post']].map(([felt, hjelp]) => (
                      <input key={felt} type="text" value={radgiver2[felt]} placeholder={hjelp} aria-label={`Tilleggsrådgiver: ${hjelp}`}
                        onChange={(e) => setRadgiver2((prev) => ({ ...prev, [felt]: e.target.value.slice(0, 80) }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-300" />
                    ))}
                    <p className="text-[11px] text-gray-400">Vises på forsiden, under «Neste steg» og på kontaktsiden.</p>
                  </div>
                )}
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-4 mb-1">Sider</div>
                <div>
                  {FORSLAG_SIDER.filter((side) => !side.fast && !side.tillegg && (side.id !== 'totalbilde' || tilleggLinjer.length > 0) && (!['dagens', 'dagensmotny'].includes(side.id) || Boolean(dagensAnalyse))).map((side) => (
                    <label key={side.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                      <input type="checkbox" checked={forslagSider.includes(side.id)} onChange={(e) => setForslagSider((prev) => e.target.checked ? [...prev, side.id] : prev.filter((id) => id !== side.id))} />
                      {side.navn}
                    </label>
                  ))}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-4 mb-1">Tillegg: slik jobber Pensum</div>
                <div>
                  {FORSLAG_SIDER.filter((side) => side.tillegg).map((side) => (
                    <label key={side.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                      <input type="checkbox" checked={forslagSider.includes(side.id)} onChange={(e) => setForslagSider((prev) => e.target.checked ? [...prev, side.id] : prev.filter((id) => id !== side.id))} />
                      {side.navn}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Forside, korte trekk, neste steg, viktig informasjon og kontaktsiden er alltid med.</p>
              </div>
            </div>
            <div>
              {forslagForhandsvisning?.tom && <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-500">Porteføljen er tom. Velg produkter i porteføljebyggeren, så vises forslaget her.</div>}
              {forslagForhandsvisning?.feil && <div className="bg-white rounded-xl border border-red-200 p-8 text-sm text-red-700">Kunne ikke lage forhåndsvisningen: {forslagForhandsvisning.feil}</div>}
              <ForslagForhandsvisning slides={forslagForhandsvisning?.slides || []} />
            </div>
          </div>
        )}
        {activeTab === 'admin' && (
          <div className="space-y-6 no-print">
            {!erAdmin ? (
              /* Innlogging */
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-md mx-auto mt-12">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Admin-innlogging
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Logg inn for å administrere produktdata og avkastningsrater.</p>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Admin-passord" 
                      value={adminPassord} 
                      onChange={(e) => setAdminPassord(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') loggInnAdmin(); }}
                      className="w-full border border-gray-200 rounded-lg py-3 px-4"
                    />
                    {adminMelding && <p className="text-red-500 text-sm">{adminMelding}</p>}
                    <button 
                      onClick={loggInnAdmin}
                      className="w-full py-3 text-white rounded-lg font-medium" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                    >
                      Logg inn
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Admin-panel */
              <div className="space-y-6">
                {/* Header med logg ut */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Admin-panel</h2>
                  <button onClick={() => { setErAdmin(false); setAdminPassord(''); }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    Logg ut
                  </button>
                </div>

                {adminMelding && (
                  <div className={"p-4 rounded-lg " + (adminMelding.includes('Feil') || adminMelding.includes('feil') ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                    {adminMelding}
                  </div>
                )}

                {/* Last opp Excel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Oppdater produktdata fra Excel</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Last opp en Excel- eller CSV-fil (.xlsx/.xls/.csv) med oppdatert avkastningsdata for Pensum-produktene.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">Forventet format:</p>
                      <p className="text-xs text-blue-700">Kolonne A: Produkt-ID (f.eks. "globale-aksjer")</p>
                      <p className="text-xs text-blue-700">Kolonne B: 2026 (YTD)</p>
                      <p className="text-xs text-blue-700">Kolonne C: 2025</p>
                      <p className="text-xs text-blue-700">Kolonne D: 2024</p>
                      <p className="text-xs text-blue-700">Kolonne E: 2023</p>
                      <p className="text-xs text-blue-700">Kolonne F: 2022</p>
                      <p className="text-xs text-blue-700">Kolonne G: Årlig 3 år</p>
                      <p className="text-xs text-blue-700">Kolonne H: Risiko 3 år</p>
                      <p className="text-xs text-blue-700 mt-1">Tips: Du kan også bruke header-navn (id, 2026, 2025, 2024, 2023, 2022, aarlig3ar, risiko3ar) i vilkårlig kolonnerekkefølge.</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          <p className="text-sm text-gray-600">Klikk for å velge Excel/CSV-fil</p>
                          <p className="text-xs text-gray-400 mt-1">.xlsx / .xls / .csv</p>
                        </div>
                        <input type="file" accept=".xlsx,.xls,.csv,text/csv" className="hidden" onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            const XLSX = await import('xlsx');
                            const data = await file.arrayBuffer();
                            const workbook = XLSX.read(data);
                            const sheet = workbook.Sheets[workbook.SheetNames[0]];
                            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                            
                            // Parse og oppdater produktdata
                            const oppdaterteProdukter = { ...pensumProdukter };
                            let oppdatert = 0;
                            
                            const header = (json[0] || []).map((h) => String(h || '').toLowerCase().trim());
                            const harHeader = header.includes('id') || header.includes('produkt-id') || header.includes('produkt_id');

                            const finnKolonne = (muligeNavn, fallbackIndex) => {
                              for (const navn of muligeNavn) {
                                const idx = header.indexOf(navn);
                                if (idx >= 0) return idx;
                              }
                              return fallbackIndex;
                            };

                            const col = {
                              id: finnKolonne(['id', 'produkt-id', 'produkt_id'], 0),
                              aar2026: finnKolonne(['2026', '2026 ytd', '2026 (ytd)', 'feb 2026', '28.02.2026', 'aar2026'], 1),
                              aar2025: finnKolonne(['2025', 'aar2025'], 2),
                              aar2024: finnKolonne(['2024', 'aar2024'], 3),
                              aar2023: finnKolonne(['2023', 'aar2023'], 4),
                              aar2022: finnKolonne(['2022', 'aar2022'], 5),
                              aarlig3ar: finnKolonne(['aarlig3ar', 'årlig 3 år', 'aarlig 3 aar'], 6),
                              risiko3ar: finnKolonne(['risiko3ar', 'risiko 3 år', 'risiko 3 aar'], 7)
                            };

                            const idFraNavn = {};
                            ['enkeltfond', 'fondsportefoljer', 'alternative'].forEach((kategori) => {
                              (oppdaterteProdukter[kategori] || []).forEach((p) => {
                                idFraNavn[String(p.id || '').toLowerCase().trim()] = p.id;
                                idFraNavn[String(p.navn || '').toLowerCase().trim()] = p.id;
                                idFraNavn[String(p.navn || '').replace(/^pensum\s+/i, '').toLowerCase().trim()] = p.id;
                              });
                            });

                            const startRad = harHeader ? 1 : 0;
                            json.slice(startRad).forEach(row => {
                              const idVerdi = row[col.id];
                              if (!idVerdi) return;
                              const idRaa = idVerdi.toString().toLowerCase().trim();
                              const id = idFraNavn[idRaa] || idRaa;

                              const lesTall = (feltNavn) => {
                                const idx = col[feltNavn];
                                if (idx === undefined || idx < 0) return undefined;
                                const v = row[idx];
                                if (v === undefined || v === null || v === '') return null;
                                if (typeof v === 'number') return Number.isFinite(v) ? v : null;
                                let normalisert = String(v)
                                  .replace(/%/g, '')
                                  .replace(/\s+/g, '');
                                if (normalisert.includes(',') && normalisert.includes('.')) {
                                  normalisert = normalisert.replace(/\./g, '').replace(',', '.');
                                } else if (normalisert.includes(',')) {
                                  normalisert = normalisert.replace(',', '.');
                                }
                                const tall = parseFloat(normalisert);
                                return Number.isFinite(tall) ? tall : null;
                              };

                              ['enkeltfond', 'fondsportefoljer', 'alternative'].forEach(kategori => {
                                const idx = oppdaterteProdukter[kategori].findIndex(p => p.id === id);
                                if (idx >= 0) {
                                  const eksisterende = oppdaterteProdukter[kategori][idx];
                                  const neste = { ...eksisterende };
                                  ['aar2026','aar2025','aar2024','aar2023','aar2022','aarlig3ar','risiko3ar'].forEach((felt) => {
                                    const verdi = lesTall(felt);
                                    if (verdi !== undefined) neste[felt] = verdi;
                                  });
                                  oppdaterteProdukter[kategori][idx] = neste;
                                  oppdatert++;
                                }
                              });
                            });
                            
                            setPensumProdukter(oppdaterteProdukter);
                            
                            // Lagre til storage
                            await storageSet('pensum_admin_produkter', JSON.stringify(oppdaterteProdukter)); await storageSet('pensum_admin_produkter_rapportdato', RAPPORT_DATO);
                            
                            setAdminMelding('Oppdaterte ' + oppdatert + ' produkter fra importfilen (Excel/CSV).');
                          } catch (err) {
                            console.error(err);
                            setAdminMelding('Feil ved lesing av importfil (Excel/CSV): ' + err.message);
                          }
                          e.target.value = '';
                        }} />
                      </label>
                      <button 
                        onClick={() => {
                          // Eksporter mal
                          const header = ['id', '2026', '2025', '2024', '2023', '2022', 'aarlig3ar', 'risiko3ar'];
                          const rows = [header];
                          ['enkeltfond', 'fondsportefoljer', 'alternative'].forEach(kat => {
                            pensumProdukter[kat].forEach(p => {
                              rows.push([p.id, p.aar2026 || '', p.aar2025 || '', p.aar2024 || '', p.aar2023 || '', p.aar2022 || '', p.aarlig3ar || '', p.risiko3ar || '']);
                            });
                          });
                          const csv = rows.map(r => r.join(';')).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'pensum_produkter_mal.csv';
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Last ned mal (CSV)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Standard avkastningsrater */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Standard avkastningsrater</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-200">{avkastningsraterLaast ? 'Låst for rådgivere' : 'Redigerbar'}</span>
                      <button
                        onClick={async () => {
                          const nyVerdi = !avkastningsraterLaast;
                          setAvkastningsraterLaast(nyVerdi);
                          try {
                            await storageSet('pensum_admin_avkastningsrater_laast', JSON.stringify(nyVerdi));
                            setAdminMelding(nyVerdi ? 'Avkastningsrater er nå låst — rådgivere kan ikke endre dem.' : 'Avkastningsrater er nå ulåst — rådgivere kan redigere dem.');
                          } catch (err) {
                            setAdminMelding('Feil ved lagring av låsestatus: ' + err.message);
                          }
                        }}
                        className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (avkastningsraterLaast ? "bg-amber-500" : "bg-blue-400")}
                      >
                        <span className={"inline-block h-4 w-4 transform rounded-full bg-white transition-transform " + (avkastningsraterLaast ? "translate-x-6" : "translate-x-1")} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Disse ratene brukes i "Allokering & Prognose"-fanen for aktivaklassene.
                      Verdiene er avledet fra CMA-arket (vektet snitt av <code className="text-xs bg-gray-100 px-1 rounded">forventetAvkastning</code> per produkt).
                      Overstyringer per klasse markeres og kan tilbakestilles. Investment Grade beregnes som Høyrente − 2,5&nbsp;%.
                      {avkastningsraterLaast && <span className="ml-1 text-amber-600 font-medium">Ratene er låst og kan ikke endres av rådgivere.</span>}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: 'globaleAksjer', label: 'Globale Aksjer' },
                        { key: 'norskeAksjer', label: 'Norske Aksjer' },
                        { key: 'hoyrente', label: 'Høyrente' },
                        { key: 'investmentGrade', label: 'Investment Grade' },
                        { key: 'privateEquity', label: 'Private Equity' },
                        { key: 'eiendom', label: 'Eiendom' }
                      ].map(({ key, label }) => {
                        const erOverstyrt = Object.prototype.hasOwnProperty.call(avkastningsraterOverride, key);
                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                              <span>{label}</span>
                              {erOverstyrt && <span className="text-[10px] uppercase tracking-wide text-amber-600 font-semibold">Overstyrt</span>}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.5"
                                value={avkastningsrater[key]}
                                onChange={(e) => setAvkastningsrater(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                className={"w-full border rounded-lg py-2 px-3 text-right " + (erOverstyrt ? "border-amber-400 bg-amber-50" : "border-gray-200")}
                              />
                              <span className="text-gray-500">%</span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between gap-2">
                              <span>CMA: <strong>{formatPercent(cmaAvkastninger[key])}</strong></span>
                              {erOverstyrt && (
                                <button
                                  onClick={() => setAvkastningsraterOverride(prev => { const n = { ...prev }; delete n[key]; return n; })}
                                  className="text-amber-700 hover:text-amber-900 underline"
                                >Tilbakestill</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={async () => {
                          try {
                            await storageSet('pensum_admin_avkastningsrater', JSON.stringify(avkastningsraterOverride));
                            setAdminMelding('Avkastningsrater lagret!');
                          } catch (err) {
                            setAdminMelding('Feil ved lagring: ' + err.message);
                          }
                        }}
                        className="px-6 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                      >
                        Lagre avkastningsrater
                      </button>
                      <button
                        onClick={async () => {
                          setAvkastningsraterOverride({});
                          try {
                            await storageSet('pensum_admin_avkastningsrater', JSON.stringify({}));
                            setAdminMelding('Alle overstyringer fjernet — bruker CMA-verdier.');
                          } catch (err) {
                            setAdminMelding('Feil ved lagring: ' + err.message);
                          }
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Tilbakestill alle til CMA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rediger produkter manuelt */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Rediger produkter manuelt</h3>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="py-2 px-3 text-left">Produkt</th>
                          <th className="py-2 px-3 text-right">2026 YTD</th>
                          <th className="py-2 px-3 text-right">2025</th>
                          <th className="py-2 px-3 text-right">2024</th>
                          <th className="py-2 px-3 text-right">2023</th>
                          <th className="py-2 px-3 text-right">2022</th>
                          <th className="py-2 px-3 text-right">Årlig 3år</th>
                          <th className="py-2 px-3 text-right">Risiko 3år</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['enkeltfond', 'fondsportefoljer', 'alternative'].map(kategori => (
                          pensumProdukter[kategori].map((produkt, idx) => (
                            <tr key={produkt.id} className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{produkt.navn}</td>
                              {['aar2026', 'aar2025', 'aar2024', 'aar2023', 'aar2022', 'aarlig3ar', 'risiko3ar'].map(felt => (
                                <td key={felt} className="py-2 px-3">
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    value={produkt[felt] ?? ''} 
                                    onChange={(e) => {
                                      const nyVerdi = e.target.value === '' ? null : parseFloat(e.target.value);
                                      setPensumProdukter(prev => {
                                        const oppdatert = { ...prev };
                                        oppdatert[kategori][idx] = { ...oppdatert[kategori][idx], [felt]: nyVerdi };
                                        return oppdatert;
                                      });
                                    }}
                                    className="w-20 border border-gray-200 rounded py-1 px-2 text-right text-sm"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                    <button 
                      onClick={async () => {
                        try {
                          await storageSet('pensum_admin_produkter', JSON.stringify(pensumProdukter)); await storageSet('pensum_admin_produkter_rapportdato', RAPPORT_DATO);
                          setAdminMelding('Produktdata lagret!');
                        } catch (err) {
                          setAdminMelding('Feil ved lagring: ' + err.message);
                        }
                      }}
                      className="mt-4 px-6 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                    >
                      Lagre endringer
                    </button>
                  </div>
                </div>

                {/* Brukeradministrasjon */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.teal }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      Brukeradministrasjon
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Oversikt over registrerte brukere. Brukere opprettes via "Ny bruker"-dialogen og lagres på serveren.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          // Try API first, fallback to localStorage
                          let brukere = null;
                          try {
                            const resp = await fetch('/api/brukere', { headers: { 'x-admin-passord': adminPassord } });
                            if (resp.ok) brukere = await resp.json();
                          } catch (apiErr) {
                            console.log('API ikke tilgjengelig:', apiErr);
                          }
                          if (!brukere) {
                            const raw = await storageGet('pensum_brukere');
                            brukere = raw ? JSON.parse(raw) : {};
                          }
                          setAdminBrukere(brukere);
                        } catch (e) {
                          setAdminBrukere({});
                          setAdminMelding('Kunne ikke laste brukere: ' + e.message);
                        }
                      }}
                      className="mb-4 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: PENSUM_COLORS.teal }}
                    >
                      Last inn brukerliste
                    </button>
                    {adminBrukere && Object.keys(adminBrukere).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                              <th className="py-2 px-3 text-left font-medium">Navn</th>
                              <th className="py-2 px-3 text-left font-medium">E-post</th>
                              <th className="py-2 px-3 text-left font-medium">Opprettet</th>
                              <th className="py-2 px-3 text-center font-medium">Handlinger</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(adminBrukere).map((b) => (
                              <tr key={b.epost} className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{b.navn || '–'}</td>
                                <td className="py-2 px-3 text-gray-600">{b.epost}</td>
                                <td className="py-2 px-3 text-gray-500 text-xs">{b.opprettet ? new Date(b.opprettet).toLocaleDateString('nb-NO') : '–'}</td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={async () => {
                                      if (!confirm('Slette bruker ' + b.epost + '?')) return;
                                      // Try API first
                                      try {
                                        await fetch('/api/brukere', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json', 'x-admin-passord': adminPassord },
                                          body: JSON.stringify({ epost: b.epost })
                                        });
                                      } catch (apiErr) {
                                        console.log('API slett feilet:', apiErr);
                                      }
                                      // Fjern bare denne brukeren fra den lokale listen (som har PIN-ene).
                                      const lokalRaw = await storageGet('pensum_brukere');
                                      const lokal = lokalRaw ? JSON.parse(lokalRaw) : {};
                                      delete lokal[b.epost];
                                      await storageSet('pensum_brukere', JSON.stringify(lokal));
                                      const oppdatert = { ...adminBrukere };
                                      delete oppdatert[b.epost];
                                      setAdminBrukere(oppdatert);
                                      setAdminMelding('Bruker ' + b.epost + ' slettet.');
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                  >
                                    Slett
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-3 text-xs text-gray-500">
                          Totalt {Object.keys(adminBrukere).length} bruker{Object.keys(adminBrukere).length !== 1 ? 'e' : ''} registrert.
                        </div>
                      </div>
                    ) : adminBrukere ? (
                      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                        Ingen brukere registrert ennå. Brukere opprettes via "Ny bruker"-dialogen i kundeinformasjon-fanen.
                      </div>
                    ) : null}
                    {/* Opprett bruker manuelt */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Opprett ny bruker manuelt</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" placeholder="Navn" id="admin-ny-bruker-navn" className="border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                        <input type="email" placeholder="E-post" id="admin-ny-bruker-epost" className="border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                        <input type="text" placeholder="PIN (minst 4 tegn)" id="admin-ny-bruker-pin" className="border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                        <button
                          onClick={async () => {
                            const navn = document.getElementById('admin-ny-bruker-navn').value;
                            const epost = document.getElementById('admin-ny-bruker-epost').value.toLowerCase().trim();
                            const pin = document.getElementById('admin-ny-bruker-pin').value;
                            if (!navn || !epost || !epost.includes('@') || !pin || pin.length < 4) {
                              setAdminMelding('Fyll inn alle felt korrekt (navn, gyldig e-post, PIN minst 4 tegn).');
                              return;
                            }
                            let brukere = {};
                            try {
                              const raw = await storageGet('pensum_brukere');
                              if (raw) brukere = JSON.parse(raw);
                            } catch (e) {}
                            if (brukere[epost]) {
                              setAdminMelding('E-posten ' + epost + ' er allerede registrert.');
                              return;
                            }
                            brukere[epost] = { epost, pin, navn, opprettet: new Date().toISOString() };
                            await storageSet('pensum_brukere', JSON.stringify(brukere));
                            setAdminBrukere(brukere);
                            document.getElementById('admin-ny-bruker-navn').value = '';
                            document.getElementById('admin-ny-bruker-epost').value = '';
                            document.getElementById('admin-ny-bruker-pin').value = '';
                            setAdminMelding('Bruker ' + epost + ' opprettet.');
                          }}
                          className="py-2 px-4 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: PENSUM_COLORS.teal }}
                        >
                          Opprett bruker
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset til standard */}
                {/* Markedssyn-redigering */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.teal }}>
                    <h3 className="text-lg font-semibold text-white">Markedssyn og kontekst</h3>
                    <p className="text-xs text-white opacity-70 mt-1">Oppdater månedlig — vises i tilleggsmodulen «Markedssyn og kontekst»</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* AI-opplasting */}
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-5 hover:border-teal-300 transition-colors" style={{ backgroundColor: '#FAFBFC' }}>
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm font-medium text-gray-700 mb-1">Last opp slides fra forvaltningsavdelingen</p>
                        <p className="text-xs text-gray-400 mb-3">AI kondenserer innholdet til de tre feltene under. Støtter PNG, JPG, PDF (maks 2 filer).</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: PENSUM_COLORS.teal }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          {markedssynAnalyserer ? 'Analyserer...' : 'Velg filer og analyser'}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            className="hidden"
                            disabled={markedssynAnalyserer}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []).slice(0, 2);
                              if (files.length === 0) return;
                              setMarkedssynAnalyserer(true);
                              setAdminMelding('');
                              try {
                                const images = await Promise.all(files.map(async (file) => {
                                  const buf = await file.arrayBuffer();
                                  const base64 = btoa(new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ''));
                                  const mediaType = file.type === 'application/pdf' ? 'application/pdf' : (file.type || 'image/png');
                                  return { data: base64, mediaType };
                                }));
                                const resp = await fetch('/api/analyze-markedssyn', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ images }),
                                });
                                const result = await resp.json();
                                if (!resp.ok) throw new Error(result.error || 'Analyse feilet');
                                setMarkedssynData(prev => ({
                                  ...prev,
                                  makro: result.makro || prev.makro,
                                  risiko: result.risiko || prev.risiko,
                                  muligheter: result.muligheter || prev.muligheter,
                                }));
                                setAdminMelding('Markedssyn oppdatert fra slides. Gjennomgå og lagre.');
                              } catch (err) {
                                setAdminMelding('Feil: ' + err.message);
                              } finally {
                                setMarkedssynAnalyserer(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                      {markedssynAnalyserer && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm" style={{ color: PENSUM_COLORS.teal }}>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                          Analyserer slides med AI...
                        </div>
                      )}
                    </div>

                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">eller rediger manuelt</span></div></div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                      <input
                        type="text"
                        value={markedssynData.periode}
                        onChange={(e) => setMarkedssynData(prev => ({ ...prev, periode: e.target.value }))}
                        placeholder="mars 2026"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Makrobildet</label>
                      <textarea
                        value={markedssynData.makro}
                        onChange={(e) => setMarkedssynData(prev => ({ ...prev, makro: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risikobildet</label>
                      <textarea
                        value={markedssynData.risiko}
                        onChange={(e) => setMarkedssynData(prev => ({ ...prev, risiko: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mulighetsbilde</label>
                      <textarea
                        value={markedssynData.muligheter}
                        onChange={(e) => setMarkedssynData(prev => ({ ...prev, muligheter: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        await storageSet('pensum_admin_markedssyn', JSON.stringify(markedssynData));
                        setAdminMelding('Markedssyn lagret.');
                      }}
                      className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90"
                      style={{ backgroundColor: PENSUM_COLORS.teal }}
                    >
                      Lagre markedssyn
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.salmon }}>
                    <h3 className="text-lg font-semibold text-white">Tilbakestill data</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Tilbakestill alle produktdata og avkastningsrater til standardverdiene. Dette kan ikke angres.
                    </p>
                    <button 
                      onClick={async () => {
                        if (!confirm('Er du sikker på at du vil tilbakestille alle data til standardverdier?')) return;
                        setPensumProdukter(JSON.parse(JSON.stringify(defaultPensumProdukter)));
                        setAvkastningsraterOverride({});
                        setAvkastningsraterLaast(false);
                        try {
                          await storageDelete('pensum_admin_produkter'); await storageDelete('pensum_admin_produkter_rapportdato');
                          await storageDelete('pensum_admin_avkastningsrater');
                          await storageDelete('pensum_admin_avkastningsrater_laast');
                          await storageDelete('pensum_admin_pdf_mal');
                        } catch (e) {}
                        setAdminMelding('Data tilbakestilt til standardverdier.');
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    >
                      Tilbakestill alt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <LunaAssistant onUtfor={utforLunaMedAngre} context={lunaContext} />

      <footer className="mt-12 py-6 text-center border-t border-gray-200 bg-white no-print">
        <img src={PENSUM_LOGO} alt="Pensum" className="h-14 mx-auto mb-3" />
        <div className="text-xs text-gray-500">Frøyas gate 15, 0273 Oslo • (+47) 23 89 68 44 • pensumgroup.no</div>
      </footer>
    </div>
  );
}
