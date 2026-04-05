import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BarChart, Bar, ComposedChart, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DATAFEED_KILDE, DATAFEED_PRODUKT_HISTORIKK, DATAFEED_INDEKS_HISTORIKK } from '../data/pensumDatafeedHistorikk';
import { defaultPensumProdukter, defaultProduktEksponering, defaultProduktRapportMeta } from '../data/pensumDefaults';
import { ASSET_COLORS, ASSET_COLORS_LIGHT, CATEGORY_COLORS, DEFAULT_EIENDOM, DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_TEMPLATE_FILENAME, HISTORIKK_ARFELT, HISTORIKK_2026_YTD, PENSUM_COLORS, RAPPORT_DATO, RAPPORT_DATO_ISO, RAPPORT_DATO_OBJEKT, RAPPORT_MAANED, RISK_PROFILES, beregnAllokering, beregnProduktNokkeltall, beregnProduktStatistikk, beregnKorrelasjonsmatrise, byggMaanedssluttSerie, erGyldigTall, erPptTemplateFilnavn, finnStartVerdiVedPeriode, formatCurrency, formatDateEuro, formatHistorikkEtikett, formatNumber, formatPercent, inferPerioderPerAarFraHistorikk, oppdaterHistorikkTilRapportDato, parseHistorikkDato, skalerVekterTilHundreListe, fordelRestVektListe, validerSiderFormat } from '../lib/pensumCore';
import { AllokeringRow, CollapsibleSection, CurrencyInput, KategoriHeaderRow, SammenligningRow, StatCard } from './pensum/PensumFieldComponents';
import { LoginModal, RegisterModal } from './pensum/AuthModals';

const PENSUM_LOGO = 'data:image/webp;base64,UklGRrgYAABXRUJQVlA4WAoAAAAwAAAASwIAHQEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBIcQ0AAA3wn22bl2bb/s1VwT0dyFmB04GkAkkFYAVoBcYKDBUoFQQrCHYwqeCadMBVwb0Mc/ziRyJy/yAiHEqy2jYkjkvaA6NHkb5ALf4/Fv9l8V8W/2XxXxb/ZfFf/n+ELP7LJXqZkSRyavH/sbwli/8SJVuj+5Y6iPtWdWNnBsnyIbDGwPdXKtbG2a+6ng+2zeBsatZxXN8rOwu8e5SgH4QfN4muCvf0y3FM2V7uyuuTLwnSYSRfT+PTc3+gRxep40M1JzU2znr39P/duH7mXDztX6rjMYbrszo0z7kU+Th7ZemT/qmqyUapjbnsnvOe6WGTjLMs/Tg85c9mp3Mz0udzfngtbDxI+NSryC9r6PS87J7HH+t77cogCwxs8+2sMvHWyDtcl5dBe1hPeWC29c0l20TKmOmh7YnOLW9VN5vlsii7d7PMPI67lsKDC+iVzjAff7+dY8kP5Kd2+m+W+cDOnCWXajvXTCa/l5+CT53ngq8M0p44nA2/WMG3Oeab5+nCH+ZFu2ZqtvmJD/aZWL9SYb45LM+j3T3nk4qabb5nVzXjPHZnzfW2YtR0n2e6pWXOAdne5pzdWxZxH/Yvc86jTLnTaAQ995gqUEM1yqnFtdJ8H41cbRMhrNSSCQ2xs9HfAHi145SFCzBI/QBmTuMuWCZj332vRrf7JN2yunFFBD9j9EKWGyn0qxdiZtv3cMMYw8AhqnOCVIpVVThSWdj2JfUDmDmNITbSxiGxCLpNwkoHcEjN/cj6a2it2BGxjV97JFgo2TsDihsCHwEDOkjyXT2IJeqGSkqn5+ltywWpkUzfkK52OfT9PJaug3/jre+QyBM+Faanp1QJ5ye6j6Slb4K7vHYF2ufMNhGYUUgcyA6bO+HNU/SHneEIbDBhk/m7UqtEw5TqKgAlE8K1Gp6SOaerCqXMJtbKB+GhXibL+UjcLR7l6f1Tqe/6w0AGEoDqiPmyk4qBWxky97uNdY/8LG4Dx1NUvtaM/OufMVHt7gMybJ9INcjmpUynYURFCCsqd+9VLTCkMLuGwWCmn3Cpc8Sxjh2XSr1rUuTgK4XYPyG7DmUH4LE6CqfoPDj1fTs5T/pLAgcjoKZXG7gsEF9+6jIi9s116AIn0ha+BBzn6dmAH/ELaqH3qvRrroOf1lYmjQFpXNRrd4PPEDcq7MA5bMRMSmFzlUBGg+Q/HZoHEgGx8w2320N9wShtb3mXfzgdYa5+dkVvhQmv1tVXCmHeHJzDBvH0/FE9Rl1Wf5QyaGqk5yUP70kU3FQLppBCJGzayAu4LG8ObiCuD6emcej8uZlAp2f1KLp1PQ+o07nLbrfxT3RwLN8HPUXno1/YM0V7sIdecQaO8lMqIcPL3oTP5qJRmDzq3VCzC+EUnz9dW5i5kffbIxnSA9jlNyf0wUPmqwJEubr/Q5yZxbaB58/WUQEaB/3026lYbNE/+IabTJP3MjlqWDqchjx9Zs5llAfIp4c5ReHO+2igO1eupOPiWhz9fwQ3N/WAp0/OuWCqb1ASLXNId11SP/+fsAVH1sAQB57igw01aXMszHVO1/NfaCrsLQP/IN3DycAUtuDI3lzAEeHnGjZn5dMLGqSC90kqXFvr5wUc6VcEFUGItsrPIzOmaug+L6RQNCohZNvB/T2dTs4XXMT9DFMM8A8yAx3j+lYBBCnto2gSJuTy25ODTTXgo13mleE2gaUZowjmboie1V8ddlLmTraJbVpTQQtZksXb1Cx899g0PlfAix26zKFP12+z1PP1c2zR+R/kkAyRCpzYopOFJet6wXnkSfqC82NO3A82BuuS3aFdG8bri7PmYEkGI/JdP68Mt2n6TVZ+jeZqWIvAWkRrer6wYV2zOMb8jJH8FJ5P1E8O/jUeuLSQYFMriYc6AJeIjJGGZiEZ7hRvjB9xoLt5h3TGHB7UNjZABetLg04a+94rlY/6rC9UPVNR2on6Ee3xYigKk8TPeJoiPbTkcLw2khFQ3a3tNnpute2iMcmcZAy30/LFL0ph21pzziMic2vQhJ51xKfWM9KLb2yz35519nsSB+j2zDrvo09TdfqcIxfBqqJZ6Bqehn2Q20SdtUkFTcgZZxMsKJmHNmL1yIyzSabiHu42IaeScwSFXj4y17TZj359h+TaXHP1KFsNMs9MAcbhSHLtMMccZakUz2GG+e1tAhFJfnGEY+Wi/jiahfMErKWxhZMC+STHk23LWy7wH/hxeKrJKahIqRcyC/1bH94ZlLd3CoRXgZwH/VvtgMVJKHlsgKb2htp8Z0MaBKu9I236oYNdOOO1hkCgAVisQXnFipAAf1dBPmM2sRAU8KQRTianSmXYPcB9w9qvDlIgpFFso7ThIr9l/CxSal1QMALkmhypSuUFg3JTOgIErUKu1PbGFUN4kBuzLSuIQJMGEamdQLswxguGwKDTXSsIhHNYEQrgb5kfY7tG0ToyImjUvRnZL+L7nJbUfY5Uc7JKmU1SCoAQN/OOQSvlIJojAhNJqN0SjJQBSKRnBrVrxjXPO2l8APhJfB8hNNydUmadYGdHRgDqU4ipuQmYrFDG45UzyRu3CAQOqE38wyv2f49JHy5yjeJDAj9yUWQqCkbzCjS81zwQytnuZGRykEvfGDAkrKj1IsKJPAzg49jRtHJRShN8o2PzLtuCApC1idBYe28H9viqI9IInNrQptjvY1ptZCdG6eONZPMwSBwIqRv19qOzt19xoziqXBsftwhOJiJIwwPpYXmNUGziwyfliXXMDZ/ymFUNiVJFR3+JEsr5K5V4b6fXa9Seo7A9BAahFWkHCWHh5pZ2MBGwyWX30AoBbniO6xuUX1X/pK0jjc9WmITKLRE+t6r+swqCnSp4JpMkNqez7FJk1K1JOdbuzduqJKkbDPZ66Qbx63PfXnqUchiDn8mYxiqbtY5EkEJsoX4kkF4VFuQ++0R7RoLunKgy8BGZtRWqbmmOcrng1LGGmRWNsF2R0a74aRGihL3PMrrIW5tCC6hW7Y4YT2mU39wDkU5RYhy0L2OaQjU1jn/hNusPWJMzQISq9cpIKLZVGTd8glpG0VrtzvriBys/0LzLBoQtsxFy6+92udjbFO2tf4sQaff54muOh3jpfSwfkzFNcA8i/l2NMRcHinspEFBRveAUuydG0nGFki22cC2UqmLtf1jgR4L4X7ZjgQrDq7YvIB2SGWsQYFNt4ae9fjLj1VAF2LrbtzXHg5M2wR1RMSxiGuBIIG6Bamm7V0kaF++NDAjiow0q/XsZWIGFgpe2XOSdiPtl4NPXrKU57lJCODvO73yXCVUPqNNA+SxyWSwpaxA0SEBCCrURGM/XxeSlXPua42FdQnfkNFKzhhsbghR2JJx2V8dE6zw7XQVACEMgO+helAPhs3EgtnE6+1wLxu6WLpl09EhdwvkdcMlbqB4Q/xE+y7ms73DxBmkThxDbwafh3eSNFz3US7aox6cT1TUMjcEgqnUkashUSRrr8/0qB+InNvpTDg4QlRchtpXs8NH7YNaGOw39CX08cPF/1fpV8EHP2tDVNOGzoM1ONmvEsT300DB5C4wnqDkejuCbVJXNiLVq/co3yvEaCO9ITNfDnNX5IADSq+0YRsqurc96QmKHT7KGEFq6ZFJSE2euZoJwhloYbc8EdA3Wyljos2C2risH6La1FXpoXYKKoOb4/UU2Om+j/DzNNETurE1bxjGOpPba1DyQIcxAhM82I2QLV0tUg34n9CNcLFIIUe/eGhXLTSDbxc5lft9lwD2+S67yyej4dcvbYgLPq9GOBLMiD5IFMuBQNFF6j3z7gB0+r0iOcdsmZS9F6YkizuaFWN7gjQM648Hte1MbFp6N8u/0hlLHia9OH8ln3d2O24oU0yCSAMUZMflKpcIckIFbW2vlCL5FjQmSLpPWwWjujc3+k/g09j6iCRb6Y1HeR6CnbJr6X+mWfAnY2P76EgZh86XqnzAYSabhHCkUXg1ynTQk1CwQwa3ttenNf5qix2voyLN+dPHICIQeMVM9oBpzvzp1Tqfo1pbpes7XHNFvJLgz9OtQtYBpqNaW+azvtnHGpKALxQKh2ovEBH5/Te82tjGtqjB8KNeM2YTc3lApgloYPGs3rx96n9a3EGWNo3ukpEFom6qGuPe88cDiA7bmUNPowaVKLUlwjhT4Z2M8HRBuwAGh2otIfD+xP0bysY0fPhxd4iwK+1USikKis8qEYfiXlyhKtgp7G9EjZQxC8Sj5Pm88vyhKdGl6yaqmb3SxVlmtbLkFbtHU0HNIINiV6NjvuwAEGGEe52kOJ9LqmwTSVn8eB4mujtJvAEpTfpQqjRCCEIrwK505aI/XeJsgkrwj8XPftEGgItCjV+oLIsMdMTKBIUBH1KUNbUXP1VNI/EyxZM66uZLtDwyETxWE+UOH1TkwFhJAoC8WHAE5vJaH7HaiQEdPHoeak9LpxqfxfupboDZunRLICDtJ7wJWdvxLjBb/H4v/svgv/yUpi//iZh6pEnqbexiwyEk5zT1Su4zEMPukZrtNhrfC5/nzz9Pl4Qu2mHmOCR6s1OL/45eUxX9x0ZwkOzcnyeL/Y/FfFv9l8V8W/2XxXxb/5b+BZPFfFABWUDggUAkAADBKAJ0BKkwCHgE+USiSRiOioaEik1lQcAoJZ27hc95rWCB8gHX/n1b/l+2C0H6r+q+kNyn3FPF9DvT/ly83efT+weoT9SewF4s36Ue4P7L/cB+yvrJ/8P1Bf331AP8F/pPWe/3P/////wBfu37Df7OenT7J3978+D1AP//6gH//67/oB/APoA/P3v8FNZUsbDDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpILMe7rPT71lSxsMMUkGKSDFJBikf7iZ6fesqWNhhikgxSQYd6fyZdl2XZGrAo9wetrAcd56fesqWNhhikgth5uC7LkfVkJ0hFjllNQD7VCzsxyEa1J1vWt1p4blTjZadBK0DEND3Xeen3rKljYX1J1CY/qAfaozXxRTtbZhf2a2S+VZ2QYpIMUkGKEi7t5JtfExPJz48VazxHkT2sMNbvgLkFUsbDDFI/lIkrEcfx+VdC2ZxMbokT2orWHYU9phzVx+DyDCq70Fr54fHmykCNkF//4sh+UwEgju6KB0U5SFKEma4YJCwgk57YiWNoZZ0nBexkFAMA85KfSk271JDDDxSSn32E33yPwQ6nsdfEAReRjI0ogrZU57HX20FCbhY2ETznJkenfI/fZWNhhikgxSQYpIMOqa+79MobxkySAHeen3rKljYYYpIMUkGKSDDzlrfFQcd56fesqWNhhikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKR+gAAP79SkAAAAAAHZuwA2VaBRfArf/69s08t0BYXfxPfEXIGr5KHyi3EsvlB6OoXIwRp6WHLpRp3m0TjCBRw+4sV1RrwhnB4Wc61k/oIqlzPitE7dXqj+7AAASeVDZL4kPoqfFpSk6Wr0AG2R+4HOwxNvWLIX5U3tJTpTPkqMFjBYAvxIzaCsYQ42iTPavnTLwxfHNRiF7TabEySrMsYF83XE0SSizTAC45NJ+Gl1craUZ+JYLPottcGPhwBfLgZ8w/sTdcvSSTwpRV+DzYQpicELAW5F9Dp0Hn0RW+QxeysWg91fNzXcbmnxGcWlvaF/tLikguvwUBfQo7rZVI0utFQNHkr9Au6B60XhqQ44LkklEj0Jd4Tb82foFZLyi1Y24uJDfis80lonJ5eji4AyOa8TA+/CPNgInlzbBSYQUOybwxQ3pF6I6864sLUJo4IHrkcFyL/08hBtwwVP9xDGcfwFAxmvrT+Px75WsQZKzkUJ1h/RHeHCcq+5TV2JgK5PD9WCHhu5EF0WiOwvMzg57MY7VB71ne0aQCBIgTM3ShLVnk7PvMk0uWww9Hy/EPUnvSBLECGcNLZf7ivHIIYMDlSnmv1qYuKlTJsVabdAuMkd4AVDXULelTaNx4cDur7/hIzRnbAr2jvEUVSLvjMAXbAJ/CJOjlfhQ9fgjTDI+mBpOlfbPv/+rl+hnfUKncu8Avzus1k//1jDkTiR2IQ/GsBejGyxtZQqDb0NVIylJjCgwUwXfLPFhHaGHzrTbmFuxhw4gsvUlv9bY78co3B9c7qvbRmaoFDqPw7ZbPYABw4oyjr81Ns/Ioh5pk7kOd2FT1tvoNtrwAy6Qk6ekPET1B7uIsqyPExrcb9MU1hj6tMkf6afUhK+pME4UaBz8MpInFCG0ixATttQwXhYjqlQoqmRavsBC+HkaWe5UXti21OgrNI/Ugk8NYq6h3OcutLMYXLG8hPAZPwh8HhctUrtdwT8vnl5on7H/k9uVDO0+2MyhZ8Ns6www1BtUAN0pz+vFqABojLbfkojH7huP2NrtlQWLRoN+kiD9+NyBrG7PscXMN62uTHI6dOyEBDV5wZAYVYZNgNAzugAYgQoxf0ZZk165WN3M/OwodpbLeaPC4Fh0bBibCus2EkC+RhfaZ0FBkznAtRfpDBCVLLkCwOTXjAdlk4DB7JfmYaJdLoPT6E/oWsu5l5DN0s5acWMgnDDIup/qRQuYO+jurVOW+rxvT9PPc5jPVQMOZGowP7IO344lNqKsBTszdVVzPuVHugBT+5VSPvKv9rbRcKQBBZPZS2rJydTx5FRQZolKK4fqbEFSpyy1wXIKfsoRVxEF4dYGweDkXBjguscpGkgvP4wRwY+nPLO2c7X1SKZJf8zycLacv/8YBbcmj+heUQOqjMqDxI32mVRVnH6FS1wV3GbTEml9GiytPATjEU5Nn8+x3LA2DuBQpye9w80VOhivsU+n//WJD62+zF+kqlXDVgTpeEcLYTYbskebfyL9qabAhjW/NnILaE+i6jWAQQgxTFgdsoWWfBxN4HAcZ2fEtTqx7vc2yUVm0a0h8b1HoK5FinnF0uA6lFjnytzcWVoXsusX8fjvBmsDX18JfJmTxxY0cPpN7/WGCu5rmlsmE1danVxC93WZfbRlMv2Om3D22UR3Bt2x7GSTEJIEaM+mEa4YkmerlKQIiPOV61fRqnXwlFT1Zt750N4sft7WS8oSasSV3PEh39e6anKcCcOy6RFVnhYfiWp5BogzPM4CXLDZSD7gXsAKvU+9u1zov32aqGfGZxq927LBF/hAGNZD+znLaGRFJ/lRyl4nlcrbyqMFsxe3Yyv6VwACsFqwfbL5z3oau8O/rmfkvjY/cGKVpIxXLp6brXpjEHxiTHM/EAsnf7nlY5rkW17PE81Y7DD5Ba/S1MC4mbuAjHazGYhKqN8dvsxCFrekRLEoMQcsYcHdEVvOIuar2shAJ4ZHTs8sQv3uEzaq/D6pJw9Zmnp3Gjkx/8/Vmvv7mrR2BTrjKbf3uIt4w/vBm8c+vO8CNEXMh4H9NcEqzf5/BBElth44vKBJw55EZ4jF6QkLpQKXtZIojU6gSd/BY+xz3UsOG5nqKmeEorWfJdPJ8O9Ai/wgNc8WAKvKAF3QIpBDeyYdE2+YK+ysQcXPXVV6oXe9jsJ/zia3sqBjTNlg0hiLN4oVebht1TLyfB4oDgR71s/QbN8I8yq7e9ICua59FWOx2vdWlu/HxA+alQmvGLxUJXJlLr4n2N//6H1Ci5g76GoDF/vaAQkA3ZI/NnJUH/PcBjBCzVMAAAAAAAAAAAAAAAlRwDsfAiqDUYtQDTNhEFfdbUalHtktoRlfoKH9fa7d2xWkgAAAAAAAAAAAA';

export default function PensumPrognoseModell() {
  const [activeTab, setActiveTab] = useState('input');
  const [showPessimistic, setShowPessimistic] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [visLikviditetPensum, setVisLikviditetPensum] = useState(false);
  const [autoRebalanserAllokering, setAutoRebalanserAllokering] = useState(false);
  const [autoRebalanserPensum, setAutoRebalanserPensum] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ aksjer: false, renter: false });
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
  
  // Standardverdier: 10 mill totalt (8 mill likvid + 1 mill PE + 1 mill eiendom)
  const [aksjerKunde, setAksjerKunde] = useState(1000000);       // 1 mill
  const [aksjefondKunde, setAksjefondKunde] = useState(3000000); // 3 mill
  const [renterKunde, setRenterKunde] = useState(2000000);       // 2 mill
  const [kontanterKunde, setKontanterKunde] = useState(2000000); // 2 mill
  const [peFondKunde, setPeFondKunde] = useState(1000000);       // 1 mill
  const [unoterteAksjerKunde, setUnoterteAksjerKunde] = useState(0);
  const [shippingKunde, setShippingKunde] = useState(0);
  const [egenEiendomKunde, setEgenEiendomKunde] = useState(1000000); // 1 mill
  const [eiendomSyndikatKunde, setEiendomSyndikatKunde] = useState(0);
  const [eiendomFondKunde, setEiendomFondKunde] = useState(0);
  const [innskudd, setInnskudd] = useState(0);
  const [uttak, setUttak] = useState(0);
  
  // Allokering & Prognose - investert beløp og alternative investeringer
  const [investertBelop, setInvestertBelop] = useState(null); // null = bruk totalKapital fra kundeinformasjon
  // visAlternativeAllokering: null = auto (basert på om kunden har alt.inv.), true/false = manuelt satt
  const [visAlternativeAllokering, setVisAlternativeAllokering] = useState(null);
  
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [rapportPptxLoading, setRapportPptxLoading] = useState(false);
  const [rapportPptxProgress, setRapportPptxProgress] = useState('');
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfProduktValg, setPdfProduktValg] = useState([]);
  const [valgtePensumScen, setValgtePensumScen] = useState([]);
  const [valgteIndekserScen, setValgteIndekserScen] = useState(['MSCI World', 'Oslo Børs', 'Norske Statsobl.']);
  const [visPortefoljeScen, setVisPortefoljeScen] = useState(true);
  // Fondssammenligning
  const [eksterneFond, setEksterneFond] = useState(null);
  const [eksterneFondLoading, setEksterneFondLoading] = useState(false);
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
  const [visEksisterendePortefolje, setVisEksisterendePortefolje] = useState(false);
  const [eksPortFondSok, setEksPortFondSok] = useState('');
  const [eksPortFondResultater, setEksPortFondResultater] = useState([]);
  const [eksPortPasteModal, setEksPortPasteModal] = useState(false);
  const [eksPortPasteText, setEksPortPasteText] = useState('');

  // Valgfrie tilleggsmoduler for investeringsforslaget
  const [rapportModuler, setRapportModuler] = useState([
    // Standard-sider (alltid synlige, ikke fjernbare)
    { id: 'cover', label: 'Forside', standard: true, aktiv: true },
    { id: 'folgebrev', label: 'Personlig følgebrev', standard: true, aktiv: true },
    { id: 'utgangspunkt', label: 'Utgangspunkt og mandat', standard: true, aktiv: true },
    { id: 'byggesteiner', label: 'Hvordan porteføljen er bygget', standard: true, aktiv: true },
    { id: 'allokering', label: 'Allokering & sammensetning', standard: true, aktiv: true },
    { id: 'historisk', label: 'Historisk avkastning', standard: true, aktiv: true },
    { id: 'scenarioanalyse', label: 'Scenarioanalyse', standard: true, aktiv: true },
    { id: 'snapshot-5y', label: 'Snapshot — 5 år', standard: true, aktiv: true },
    { id: 'snapshot-drawdown', label: 'Snapshot — Nedsiderisiko', standard: true, aktiv: true },
    { id: 'eksponering', label: 'Aggregert eksponering', standard: true, aktiv: true },
    { id: 'faktaark', label: 'Faktaark per produkt', standard: true, aktiv: true },
    { id: 'honorarstruktur', label: 'Hvordan tar vi oss betalt?', standard: true, aktiv: false },
    { id: 'neste-steg', label: 'Neste steg', standard: true, aktiv: true },
    { id: 'disclaimer', label: 'Viktig informasjon', standard: true, aktiv: true },
  ]);
  const [tilleggsmoduler, setTilleggsmoduler] = useState([
    { id: 'beskatning', label: 'Beskatning av aksjer og fond', aktiv: false, posisjon: 'appendix' },
    { id: 'markedshistorikk', label: 'Aksjemarkedet – Historisk utvikling', aktiv: false, posisjon: 'appendix' },
    { id: 'om-oss', label: 'Om oss', aktiv: false, posisjon: 'appendix' },
    { id: 'kommunikasjon', label: 'Kommunikasjon & løpende oppdateringer', aktiv: false, posisjon: 'appendix' },
    { id: 'rapportering', label: 'Rapportering', aktiv: false, posisjon: 'appendix' },
    { id: 'markedssyn', label: 'Markedssyn og kontekst', aktiv: false, posisjon: 'etter-cover' },
    { id: 'snapshot-1y', label: 'Snapshot — 1 år', aktiv: false, posisjon: 'etter-snapshot' },
    { id: 'snapshot-3y', label: 'Snapshot — 3 år', aktiv: false, posisjon: 'etter-snapshot' },
    { id: 'verdiutvikling', label: 'Forventet verdiutvikling per produkt', aktiv: false, posisjon: 'foer-disclaimer' },
    { id: 'eksisterende-sammenligning', label: 'Sammenligning med eksisterende portefølje', aktiv: false, posisjon: 'etter-allokering' },
    { id: 'totalallokering', label: 'Totalallokering — før og etter', aktiv: false, posisjon: 'appendix' },
    { id: 'prognose-sammenligning', label: 'Prognoseoversikt — verdiutvikling', aktiv: false, posisjon: 'appendix' },
    { id: 'appendix-side', label: 'Appendix (skilleark)', aktiv: false, posisjon: 'appendix' },
  ]);
  const [visModulPanel, setVisModulPanel] = useState(false);

  // Helper to check if a standard rapport module is active
  const isStandardModulAktiv = useCallback((id) => {
    const modul = rapportModuler.find(m => m.id === id);
    if (modul) return modul.aktiv;
    // Also check tilleggsmoduler (for modules moved from standard to optional)
    const tillegg = tilleggsmoduler.find(m => m.id === id);
    return tillegg ? tillegg.aktiv : true;
  }, [rapportModuler, tilleggsmoduler]);

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

  // Posisjonsvalg for tilleggsmoduler
  const TILLEGGSMODUL_POSISJONER = [
    { value: 'etter-cover', label: 'Etter forside' },
    { value: 'etter-utgangspunkt', label: 'Etter utgangspunkt' },
    { value: 'etter-byggesteiner', label: 'Etter byggesteiner' },
    { value: 'etter-allokering', label: 'Etter allokering' },
    { value: 'etter-historisk', label: 'Etter historisk avkastning' },
    { value: 'etter-snapshot', label: 'Etter snapshot-graf(er)' },
    { value: 'etter-eksponering', label: 'Etter eksponering' },
    { value: 'etter-verdiutvikling', label: 'Etter verdiutvikling' },
    { value: 'etter-faktaark', label: 'Etter faktaark' },
    { value: 'appendix', label: 'Appendix (etter neste steg)' },
    { value: 'foer-disclaimer', label: 'Før disclaimer' },
  ];

  // Beskrivelser for tilleggsmoduler
  const TILLEGGSMODUL_BESKRIVELSER = {
    'beskatning': 'Oversikt over beskatning av aksjer og fond for privat eie, ASK og aksjeselskap',
    'markedshistorikk': 'MSCI AC World arsavkastning og intraarsfall siden 1988 — viser at markedet historisk har vaert positivt i 70% av arene',
    'om-oss': 'Presentasjon av Pensum — fire virksomhetsområder, nøkkeltall og forvaltningskapital',
    'kommunikasjon': 'Oversikt over Pensums kommunikasjonskanaler: investeringskommentar, månedsrapport, konferanse, podcast og TV',
    'rapportering': 'Pensums rapporteringsløsning med BankID-innlogging, porteføljeoversikt og skatterapportering',
    'honorarstruktur': 'Transparent honorarstruktur med priser for investeringsrådgivning og diskresjonær forvaltning',
    'folgebrev': 'Personlig brev til kunden med sammendrag av porteføljeforslaget og nøkkeltall',
    'markedssyn': 'Pensums markedssyn med makrobilde, risikobilde og mulighetsbilde — oppdateres månedlig',
    'neste-steg': 'Veien videre med steg-for-steg prosess og kontaktinfo for din rådgiver',
    'totalallokering': 'Visuell sammenligning av nåværende og foreslått aktivasammensetning — kakediagram, likvid/illikvid-fordeling og nøkkeltall',
    'prognose-sammenligning': 'Verdiutvikling over tid med forventet, pessimistisk og optimistisk scenario — inkl. sammenligning med alternativ profil',
    'appendix-side': 'Skilleark som markerer starten på appendix-delen — tilleggsmoduler plassert etter denne vises i appendix',
  };

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
  const [showPessimisticLosninger, setShowPessimisticLosninger] = useState(false);
  const [visPortefoljSnapshots, setVisPortefoljSnapshots] = useState(false);
  const [valgteProdukterHistorikk, setValgteProdukterHistorikk] = useState(['global-core-active', 'global-edge', 'basis']);
  
  // Valgt produkt for detaljvisning
  const [valgtProduktDetalj, setValgtProduktDetalj] = useState(null);
  
  const [pensumProdukter, setPensumProdukter] = useState(() => JSON.parse(JSON.stringify(defaultPensumProdukter)));
  
  // Admin-innstillinger
  const [adminPassord, setAdminPassord] = useState('');
  const [erAdmin, setErAdmin] = useState(false);
  const [adminMelding, setAdminMelding] = useState('');
  const [adminBrukere, setAdminBrukere] = useState(null);
  const ADMIN_PASSORD = 'pensum2024'; // Enkelt passord - kan endres

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
  const [pdfMalConfig, setPdfMalConfig] = useState({
    navn: 'Pensum standardmal 2026',
    filnavn: DEFAULT_TEMPLATE_FILENAME,
    filtype: '',
    filDataUrl: '',
    fasteSider: '1-5,14+',
    dynamiskeSider: '6-13',
    dynamiskBeskrivelse: 'Side 6: Allokering\nSide 7: Beløpsfordeling\nSide 8: Produkter 2026/2025\nSide 9: Produkter 2024/2023/2022\nSide 10: Avkastningsgraf\nSide 11: Risikomål\nSide 12: Månedstabell\nSide 13: Oppsummering'
  });

  const MAX_TEMPLATE_PAYLOAD_BYTES = 4.0 * 1024 * 1024;
  const stripTemplateBinaryForStorage = (config) => ({
    ...config,
    filDataUrl: ''
  });
  const erGyldigFasteSider = useMemo(() => validerSiderFormat(pdfMalConfig.fasteSider), [pdfMalConfig.fasteSider]);
  const erGyldigDynamiskeSider = useMemo(() => validerSiderFormat(pdfMalConfig.dynamiskeSider), [pdfMalConfig.dynamiskeSider]);
  const erKlarForLagringAvMal = useMemo(() => (
    Boolean(pdfMalConfig.navn.trim()) &&
    Boolean(pdfMalConfig.filnavn) &&
    erGyldigFasteSider &&
    erGyldigDynamiskeSider
  ), [pdfMalConfig, erGyldigFasteSider, erGyldigDynamiskeSider]);
  const malKreverOpplasting = useMemo(() => {
    const filnavn = String(pdfMalConfig?.filnavn || '').trim();
    if (!filnavn) return false;
    const erStandardmal = filnavn.toLowerCase() === DEFAULT_TEMPLATE_FILENAME.toLowerCase();
    if (erStandardmal) return false;
    if (!erPptTemplateFilnavn(filnavn)) return true;
    return !pdfMalConfig?.filDataUrl;
  }, [pdfMalConfig?.filnavn, pdfMalConfig?.filDataUrl]);
  
  // Standard avkastningsrater (kan endres av admin)
  const [avkastningsrater, setAvkastningsrater] = useState({
    globaleAksjer: 10,
    norskeAksjer: 11,
    hoyrente: 7.5,
    investmentGrade: 5,
    privateEquity: 15,
    eiendom: 8
  });
  const [avkastningsraterLaast, setAvkastningsraterLaast] = useState(false);

  // Last admin-data fra storage ved oppstart

  const beregnAarsavkastningFraHistorikk = useCallback((produktId, aar) => {
    const hist = produktHistorikk?.[produktId];
    const data = Array.isArray(hist?.data) ? hist.data : [];
    const sortert = data
      .filter((punkt) => erGyldigTall(punkt?.verdi) && parseHistorikkDato(punkt?.dato))
      .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
    if (sortert.length < 2) return null;

    const startDato = new Date(aar, 0, 1);
    const sluttDato = aar === 2026 ? RAPPORT_DATO_OBJEKT : new Date(aar, 11, 31);

    const startKandidat = sortert.filter((punkt) => parseHistorikkDato(punkt.dato) <= startDato).slice(-1)[0]
      || sortert.find((punkt) => parseHistorikkDato(punkt.dato) >= startDato);
    const sluttKandidat = sortert.filter((punkt) => {
      const dato = parseHistorikkDato(punkt.dato);
      return dato && dato >= startDato && dato <= sluttDato;
    }).slice(-1)[0];

    if (!startKandidat || !sluttKandidat || startKandidat === sluttKandidat || !erGyldigTall(startKandidat.verdi) || startKandidat.verdi === 0) return null;
    return ((sluttKandidat.verdi / startKandidat.verdi) - 1) * 100;
  }, [produktHistorikk]);

  const hentAarsverdiForProdukt = useCallback((produkt, felt, aar) => {
    if (erGyldigTall(produkt?.[felt])) return produkt[felt];
    return beregnAarsavkastningFraHistorikk(produkt?.id, aar);
  }, [beregnAarsavkastningFraHistorikk]);

  useEffect(() => {
    const lastAdminData = async () => {
      try {
        const raterValue = await storageGet('pensum_admin_avkastningsrater');
        if (raterValue) {
          setAvkastningsrater(JSON.parse(raterValue));
        }

        const produktValue = await storageGet('pensum_admin_produkter');
        if (produktValue) {
          setPensumProdukter(JSON.parse(produktValue));
        }

        const laastValue = await storageGet('pensum_admin_avkastningsrater_laast');
        if (laastValue) {
          setAvkastningsraterLaast(JSON.parse(laastValue));
        }

        const malValue = await storageGet('pensum_admin_pdf_mal');
        if (malValue) {
          const lagret = JSON.parse(malValue);
          setPdfMalConfig((prev) => ({
            ...prev,
            ...lagret,
            filnavn: erPptTemplateFilnavn(lagret?.filnavn) ? lagret.filnavn : DEFAULT_TEMPLATE_FILENAME,
            navn: lagret?.navn || 'Pensum standardmal 2026',
            fasteSider: lagret?.fasteSider || '1-5,14+',
            dynamiskeSider: lagret?.dynamiskeSider || '6-13',
            filDataUrl: ''
          }));
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
  const [brukBasis, setBrukBasis] = useState(false);

  // Porteføljeallokering for Pensum-produkter
  const [pensumAllokering, setPensumAllokering] = useState([
    { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 30, kategori: 'fondsportefoljer' },
    { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 20, kategori: 'fondsportefoljer' },
    { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 30, kategori: 'fondsportefoljer' },
    { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' }
  ]);

  // Standardporteføljer MED Basis
  const pensumStandardPortefoljerMedBasis = {
    'Defensiv': [
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 45, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 20, kategori: 'fondsportefoljer' },
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 10, kategori: 'fondsportefoljer' }
    ],
    'Moderat': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 15, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 10, kategori: 'fondsportefoljer' }
    ],
    'Dynamisk': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 15, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 20, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 15, kategori: 'fondsportefoljer' }
    ],
    'Offensiv': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 35, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 20, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 25, kategori: 'enkeltfond' },
      { id: 'energy-a', navn: 'Pensum Global Energy A', vekt: 20, kategori: 'enkeltfond' }
    ]
  };

  // Standardporteføljer UTEN Basis
  const pensumStandardPortefoljerUtenBasis = {
    'Defensiv': [
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 50, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 15, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 5, kategori: 'fondsportefoljer' }
    ],
    'Moderat': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 15, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 15, kategori: 'enkeltfond' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 10, kategori: 'fondsportefoljer' }
    ],
    'Dynamisk': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 35, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 20, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 25, kategori: 'enkeltfond' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 20, kategori: 'fondsportefoljer' }
    ],
    'Offensiv': [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', vekt: 40, kategori: 'fondsportefoljer' },
      { id: 'global-edge', navn: 'Pensum Global Edge', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' },
      { id: 'energy-a', navn: 'Pensum Global Energy A', vekt: 15, kategori: 'enkeltfond' }
    ]
  };

  // Velg riktig porteføljesett basert på brukBasis
  const pensumStandardPortefoljer = brukBasis ? pensumStandardPortefoljerMedBasis : pensumStandardPortefoljerUtenBasis;

  const [valgtPensumProfil, setValgtPensumProfil] = useState('Moderat');
  
  const velgPensumStandardPortefolje = (profil) => {
    setValgtPensumProfil(profil);
    setPensumAllokering(pensumStandardPortefoljer[profil]);
  };

  const leggTilPensumProdukt = (produkt, kategori) => {
    if (!pensumAllokering.find(p => p.id === produkt.id)) {
      setPensumAllokering(prev => [...prev, { id: produkt.id, navn: produkt.navn, vekt: 0, kategori }]);
    }
  };

  const fjernPensumProdukt = (id) => {
    setPensumAllokering(prev => prev.filter(p => p.id !== id));
  };

  const oppdaterPensumVekt = (id, nyVekt) => {
    setPensumAllokering(prev => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      if (!autoRebalanserPensum) {
        return prev.map(p => p.id === id ? { ...p, vekt: Math.max(0, Math.min(100, nyVekt)) } : p);
      }
      return fordelRestVektListe(prev, idx, nyVekt);
    });
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

  const aggregertPensumEksponering = useMemo(() => {
    const totalVekt = pensumAllokering.reduce((s, p) => s + (p.vekt || 0), 0) || 1;
    const lagAgg = (felt) => {
      const map = new Map();
      pensumAllokering.forEach((p) => {
        const data = produktEksponering?.[p.id]?.[felt];
        if (!Array.isArray(data) || p.vekt <= 0) return;
        const faktor = p.vekt / totalVekt;
        data.forEach((rad) => {
          const key = rad.navn;
          map.set(key, (map.get(key) || 0) + ((Number(rad.vekt) || 0) * faktor));
        });
      });
      return Array.from(map.entries())
        .map(([navn, vekt]) => ({ navn, vekt: Number(vekt.toFixed(1)) }))
        .sort((a, b) => b.vekt - a.vekt)
        .slice(0, 8);
    };
    return {
      sektorer: lagAgg('sektorer'),
      regioner: lagAgg('regioner')
    };
  }, [pensumAllokering, produktEksponering]);

  const valgtePensumProdukterMedEksponering = useMemo(() => {
    const produktMap = new Map([...(pensumProdukter?.enkeltfond || []), ...(pensumProdukter?.fondsportefoljer || []), ...(pensumProdukter?.alternative || [])]
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
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    const aarKolonner = HISTORIKK_ARFELT;
    const aarMapping = { aar2026: 2026, aar2025: 2025, aar2024: 2024, aar2023: 2023, aar2022: 2022 };
    const resultat = {};

    const beregnFraHistorikk = (produktId, aar) => {
      const hist = produktHistorikk?.[produktId];
      const data = Array.isArray(hist?.data) ? hist.data : [];
      const sortert = data
        .filter((punkt) => erGyldigTall(punkt?.verdi) && parseHistorikkDato(punkt?.dato))
        .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
      if (sortert.length < 2) return null;

      const startDato = new Date(aar, 0, 1);
      const sluttDato = aar === 2026 ? RAPPORT_DATO_OBJEKT : new Date(aar, 11, 31);

      const startKandidat = sortert.filter((punkt) => parseHistorikkDato(punkt.dato) <= startDato).slice(-1)[0]
        || sortert.find((punkt) => parseHistorikkDato(punkt.dato) >= startDato);
      const sluttKandidat = sortert.filter((punkt) => {
        const dato = parseHistorikkDato(punkt.dato);
        return dato && dato >= startDato && dato <= sluttDato;
      }).slice(-1)[0];

      if (!startKandidat || !sluttKandidat || startKandidat === sluttKandidat || !erGyldigTall(startKandidat.verdi) || startKandidat.verdi === 0) return null;
      return ((sluttKandidat.verdi / startKandidat.verdi) - 1) * 100;
    };

    aarKolonner.forEach((aarFelt) => {
      let vektetSum = 0;
      let totalVekt = 0;
      pensumAllokering.forEach((allok) => {
        const produkt = alleProdukt.find((p) => p.id === allok.id);
        if (!produkt || allok.vekt <= 0) return;

        let avkastning = erGyldigTall(produkt?.[aarFelt]) ? Number(produkt[aarFelt]) : null;
        if (!erGyldigTall(avkastning)) {
          avkastning = beregnFraHistorikk(produkt.id, aarMapping[aarFelt]);
        }
        if (!erGyldigTall(avkastning) && erGyldigTall(produkt?.forventetAvkastning)) {
          avkastning = Number(produkt.forventetAvkastning);
        }

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
  const pensumAktivafordeling = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    let aksjeVekt = 0;
    let renteVekt = 0;
    let alternativVekt = 0;
    let blandetVekt = 0;
    
    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        if (produkt.aktivatype === 'aksje') {
          aksjeVekt += allok.vekt;
        } else if (produkt.aktivatype === 'rente') {
          renteVekt += allok.vekt;
        } else if (produkt.aktivatype === 'alternativ') {
          alternativVekt += allok.vekt;
        } else if (produkt.aktivatype === 'blandet') {
          blandetVekt += allok.vekt;
        }
      }
    });
    
    return [
      { name: 'Aksjer', value: parseFloat(aksjeVekt.toFixed(1)), color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: parseFloat(renteVekt.toFixed(1)), color: PENSUM_COLORS.salmon },
      { name: 'Alternativer', value: parseFloat(alternativVekt.toFixed(1)), color: PENSUM_COLORS.teal },
      { name: 'Blandet', value: parseFloat(blandetVekt.toFixed(1)), color: PENSUM_COLORS.gold }
    ];
  }, [pensumAllokering, pensumProdukter]);

  // Beregn likviditetsfordeling
  const pensumLikviditet = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
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
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
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

  
  const valgtLosning = null; // Fjernet gammel state

  // Last lagrede kunder ved oppstart
  useEffect(() => {
    const lastKunder = async () => {
      if (radgiver) {
        const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
        let loaded = null;
        try {
          if (window.storage && window.storage.get) {
            const result = await window.storage.get(storageKey);
            if (result && result.value) loaded = result.value;
          }
        } catch (e) {
          console.log('window.storage not available:', e);
        }
        if (!loaded && typeof localStorage !== 'undefined') {
          try { loaded = localStorage.getItem(storageKey); } catch (e) { /* ignore */ }
        }
        setLagredeKunder(loaded ? JSON.parse(loaded) : []);
      }
    };
    lastKunder();
  }, [radgiver]);

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
    sistEndret: new Date().toISOString()
  }), [aktivKundeId, kundeNavn, kundeSelskap, radgiver, dato, risikoprofil, horisont, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, innskudd, uttak, allokering, scenarioParams, investeringsFormaal, likviditetsbehov]);

  // Last inn kundedata
  const lastKundeData = useCallback((data) => {
    setAktivKundeId(data.id);
    setKundeNavn(data.kundeNavn || '');
    setKundeSelskap(data.kundeSelskap || '');
    setDato(data.dato || new Date().toISOString().split('T')[0]);
    const profil = data.risikoprofil || 'Moderat';
    setRisikoprofil(profil);
    // Synkroniser til porteføljebygger ved innlasting av kunde
    setValgtPensumProfil(profil);
    if (pensumStandardPortefoljer[profil]) {
      setPensumAllokering(pensumStandardPortefoljer[profil]);
    }
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
          nyBruker = await resp.json();
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
        setTimeout(() => lagreKundeEtterAuth(), 100);
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

      // Try server API first
      try {
        const resp = await fetch('/api/brukere');
        if (resp.ok) {
          const brukere = await resp.json();
          brukerData = brukere[epostNormalisert] || null;
        }
      } catch (apiErr) {
        console.log('API ikke tilgjengelig, bruker lokal lagring:', apiErr);
      }

      // Fallback to local storage if API didn't find user
      if (!brukerData) {
        const brukereKey = 'pensum_brukere';
        let brukere = {};
        const raw = await storageGet(brukereKey);
        if (raw) brukere = JSON.parse(raw);
        brukerData = brukere[epostNormalisert] || null;
      }

      if (!brukerData) {
        setAuthFeilmelding('Fant ingen bruker med denne e-postadressen');
        return;
      }

      if (brukerData.pin !== loginPin) {
        setAuthFeilmelding('Feil PIN-kode');
        return;
      }

      await storageSet('pensum_aktiv_bruker', JSON.stringify(brukerData));

      setBruker(brukerData);
      setRadgiver(brukerData.navn);
      setVisLoginModal(false);

      // Hvis vi ventet på innlogging for å lagre, gjør det nå
      if (ventPaaRegistrering) {
        setVentPaaRegistrering(false);
        setTimeout(() => lagreKundeEtterAuth(), 100);
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
        body: JSON.stringify({ epost: bruker.epost, [felt]: verdi })
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
    if (!kundeNavn) {
      alert('Vennligst fyll inn kundenavn først');
      return;
    }
    
    const brukerNavn = bruker?.navn || radgiver;
    if (!brukerNavn) return;
    
    const storageKey = 'pensum_kunder_' + brukerNavn.toLowerCase().replace(/\s+/g, '_');
    const kundeData = getKundeData();
    
    let oppdatertListe;
    const eksisterendeIndex = lagredeKunder.findIndex(k => k.id === kundeData.id);
    if (eksisterendeIndex >= 0) {
      oppdatertListe = [...lagredeKunder];
      oppdatertListe[eksisterendeIndex] = kundeData;
    } else {
      oppdatertListe = [...lagredeKunder, kundeData];
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
      setLagringsStatus('Lagret!');
      setTimeout(() => setLagringsStatus(''), 2000);
    } else {
      alert('Automatisk lagring er ikke tilgjengelig. Bruk "Eksporter" for å lagre kunden som fil.');
    }
  }, [bruker, radgiver, kundeNavn, getKundeData, lagredeKunder]);

  // Lagre kunde (hovedfunksjon)
  const lagreKunde = useCallback(async () => {
    if (!kundeNavn) {
      alert('Vennligst fyll inn kundenavn først');
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
  }, [kundeNavn, bruker, lagreKundeEtterAuth]);

  // Slett kunde
  const slettKunde = useCallback(async (id) => {
    if (!confirm('Er du sikker på at du vil slette denne kunden?')) return;
    const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
    const oppdatertListe = lagredeKunder.filter(k => k.id !== id);
    
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
    setKundeNavn('');
    setDato(new Date().toISOString().split('T')[0]);
    setRisikoprofil('Moderat');
    setHorisont(10);
    setLocalHorisont('10');
    setAksjerKunde(0);
    setAksjefondKunde(0);
    setRenterKunde(0);
    setKontanterKunde(0);
    setPeFondKunde(0);
    setUnoterteAksjerKunde(0);
    setShippingKunde(0);
    setEgenEiendomKunde(0);
    setEiendomSyndikatKunde(0);
    setEiendomFondKunde(0);
    setInnskudd(0);
    setUttak(0);
    setAllokering(beregnAllokering(0, 0, 0, 'Moderat'));
    setInvesteringsFormaal('Utvikle finansiell formue');
    setLikviditetsbehov('Begrenset');
    setVisKundeliste(false);
    setActiveTab('input');
  }, []);

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
  
  // Sjekk om kunden har alternative investeringer
  const harAlternativeInvesteringer = illikvideTotal > 0;
  // Effektiv verdi for checkbox: bruker manuell verdi hvis satt, ellers basert på kundedata
  const effektivVisAlternative = visAlternativeAllokering !== null ? visAlternativeAllokering : harAlternativeInvesteringer;

  // Beregn prognose for Pensum-portefølje (må være etter totalKapital er definert)
  const pensumPrognose = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    const totalVekt = pensumAllokering.reduce((s, p) => s + (p.vekt || 0), 0) || 1;
    const produkterMedAvk = pensumAllokering.filter(a => a.vekt > 0).map(a => {
      const produkt = alleProdukt.find(p => p.id === a.id);
      const fAvk = produkt?.forventetAvkastning ?? produktRapportMeta?.[a.id]?.expectedReturn ?? 0;
      return { id: a.id, navn: a.navn, vektPct: a.vekt / totalVekt, avkastning: (erGyldigTall(fAvk) ? fAvk : 0) / 100 };
    });

    const kapital = investertBelop !== null ? investertBelop : totalKapital;
    const prognose = [];
    const verdier = {};
    produkterMedAvk.forEach(p => { verdier[p.id] = p.vektPct * kapital; });

    for (let i = 0; i <= horisont; i++) {
      const row = { year: new Date().getFullYear() + i };
      let total = 0;
      produkterMedAvk.forEach(p => {
        if (i > 0) verdier[p.id] = verdier[p.id] * (1 + p.avkastning);
        row[p.navn] = Math.round(verdier[p.id]);
        total += verdier[p.id];
      });
      row.verdi = Math.round(total);
      prognose.push(row);
    }
    return prognose;
  }, [pensumAllokering, pensumProdukter, produktRapportMeta, totalKapital, investertBelop, horisont, erGyldigTall]);

  const pensumProduktFarger = [PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green, PENSUM_COLORS.midBlue, PENSUM_COLORS.gray];
  const valgteProdukterForChart = pensumAllokering.filter(a => a.vekt > 0);

  // Render tilleggsmodul-innhold basert på id
  const renderTilleggsmodulInnhold = useCallback((modulId) => {
    switch (modulId) {
      case 'om-oss':
        return (
          <div data-rapport-slide="om-oss" className="space-y-6 page-break-before">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Om oss</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pensum har røtter tilbake til 2002 og har i dag fire ulike virksomhetsområder, hvor kjernen ligger innen forvaltningstjenester.
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { tittel: 'Helhetlig forvaltning', tekst: 'Skreddersydd og helhetlig rådgivning til institusjoner og «private banking» markedet.', farge: PENSUM_COLORS.darkBlue },
                { tittel: 'Forvaltning av enkeltprodukter', tekst: 'Forvaltning av aktivt forvaltede mandater, AIFer, UCITS fond, fondsporteføljer og eiendom.', farge: PENSUM_COLORS.darkBlue },
                { tittel: 'Corporate Finance', tekst: 'Rådgivning knyttet til M&A, verdivurderinger, kapitalstruktur og kapitalinnhenting.', farge: PENSUM_COLORS.lightBlue },
                { tittel: 'Regnskap', tekst: 'Autorisert regnskapsfører med tjenester mot Pensums kunder samt eksterne kunder.', farge: PENSUM_COLORS.lightBlue },
              ].map((boks, i) => (
                <div key={i} className="rounded-lg p-4 text-white text-sm" style={{ backgroundColor: boks.farge }}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2">{boks.tittel}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{boks.tekst}</p>
                </div>
              ))}
            </div>
            <div className="h-0.5 w-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { tittel: 'Antall ansatte', verdi: '39' },
                { tittel: 'Forvaltningskapital', verdi: 'NOK 12,3 Mrd' },
                { tittel: 'Årlig vekst forvaltningskapital', verdi: '29,1%' },
                { tittel: 'Årlig vekst inntekter', verdi: '22,1%' },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg p-4 text-center" style={{ backgroundColor: '#9CA3AF', color: 'white' }}>
                  <h4 className="font-bold text-[10px] uppercase tracking-wider mb-2">{stat.tittel}</h4>
                  <p className="text-2xl font-bold">{stat.verdi}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'kommunikasjon':
        return (
          <div data-rapport-slide="kommunikasjon" className="space-y-5 page-break-before">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Kommunikasjon & løpende oppdateringer</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pensum tilbyr løpende kommunikasjon og oppdateringer til sine kunder gjennom flere kanaler.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { tittel: 'Ukentlig Investeringskommentar', beskrivelse: 'Markedsoppdatering og investeringskommentarer sendt ut ukentlig til alle kunder.' },
                { tittel: 'Månedsrapport', beskrivelse: 'Detaljert månedlig rapport med porteføljeutvikling, markedsanalyse og utsikter.' },
                { tittel: 'Pensum Konferanse', beskrivelse: 'Årlig konferanse med foredragsholdere og nettverksmuligheter for Pensums kunder.' },
              ].map((kanal, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-24 rounded-md mb-3 flex items-center justify-center" style={{ backgroundColor: i === 0 ? PENSUM_COLORS.darkBlue : i === 1 ? PENSUM_COLORS.lightBlue : '#E5E7EB' }}>
                    <svg className="w-8 h-8 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />}
                      {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>{kanal.tittel}</h4>
                  <p className="text-xs text-gray-500">{kanal.beskrivelse}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { tittel: 'Pensumpodden', beskrivelse: 'Podcast med markedskommentarer og intervjuer med investeringseksperter.' },
                { tittel: 'Mediedekning', beskrivelse: 'Pensum er jevnlig omtalt i ledende finansmedier som DN, E24 og Finansavisen.' },
                { tittel: 'Økonomi-nyhetene', beskrivelse: 'Pensums eksperter bidrar regelmessig med kommentarer i TV og nettmedier.' },
                { tittel: 'Pensum TV', beskrivelse: 'Egenprodusert videoinnhold med markedsanalyser og investeringstemaer.' },
              ].map((kanal, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="h-16 rounded-md mb-2 flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-xs mb-0.5" style={{ color: PENSUM_COLORS.darkBlue }}>{kanal.tittel}</h4>
                  <p className="text-[10px] text-gray-500">{kanal.beskrivelse}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rapportering':
        return (
          <div data-rapport-slide="rapportering" className="space-y-5 page-break-before">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Rapportering</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                    <span>BankID innlogging på egen rapporteringsside med daglig utvikling av portefølje. Tilgang til alle kundeforhold på samme område dersom flere kundeforhold.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                    <span>Rapporterer både på portefølje i Pensum samt «eksterne» porteføljer. Gir en helhetlig oversikt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                    <span>Skatterapporering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                    <span>Sluttsedler og oversikt over alle hendelser i porteføljen.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-[10px] text-gray-500 mb-1">Markedsverdi</p>
                    <p className="text-sm font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Daglig oppdatert</p>
                  </div>
                  <div className="rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-[10px] text-gray-500 mb-1">Avkastning i kr</p>
                    <p className="text-sm font-bold" style={{ color: PENSUM_COLORS.teal }}>Løpende</p>
                  </div>
                  <div className="rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-[10px] text-gray-500 mb-1">Avkastning %</p>
                    <p className="text-sm font-bold" style={{ color: PENSUM_COLORS.teal }}>Løpende</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Rapporteringsfunksjoner</h4>
                  <div className="space-y-2">
                    {['Nettoavkastning', 'Transaksjoner', 'Allokering', 'Skatterapport', 'Sluttsedler'].map((funksjon, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: PENSUM_COLORS.teal }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-xs text-gray-600">{funksjon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'honorarstruktur':
        return (
          <div data-rapport-slide="honorarstruktur" className="space-y-5 page-break-before">
            <h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Hvordan tar vi oss betalt?</h2>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: '#F0F4F8' }}>
              Pensum ønsker å opptre som en transparent partner ovenfor sine kunder, også hva gjelder honorarstruktur. Vi mottar ingen betalinger fra tredjeparter og eventuelle returprovisjoner som vi mottar har uavkortet tilbake til våre kunder.
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Komponenter i vår honorarmodell:</h3>
              <ul className="space-y-1.5 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                  <span>Det er ingen implementeringshonorarer utover ordinære transaksjonskostnader.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                  <span>Årlig honorar for løpende forvaltning, depot, oppgjør, oppfølging og rapportering. Ved valg av tredjeparts forvaltere tilkommer underliggende forvaltningskostnad på det enkelte fond i tillegg.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                  <span>Ved investeringer i Pensum sine internt forvaltede fond, tilkommer ingen tjenestekostnad utover kostnadene i fondene.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>
                  <span>Utvalgte diskresjonære mandater og fond, forvaltet av Pensum, belaster performance fee basert på meravkastning mot relevant referanseindeks.</span>
                </li>
              </ul>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th colSpan={3} className="p-3 text-center font-bold text-sm tracking-wider text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>HONORARSTRUKTUR PENSUM*</th>
                  </tr>
                  <tr className="border-b-2" style={{ borderColor: PENSUM_COLORS.darkBlue }}>
                    <th className="p-2 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' }}>Beløp</th>
                    <th className="p-2 text-center font-semibold" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' }}>Investeringsrådgivning</th>
                    <th className="p-2 text-center font-semibold" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' }}>Diskresjonær forvaltning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { belop: 'NOK 1-5 millioner', rad: '1,25% (+mva)', disk: '1,25%' },
                    { belop: 'NOK 5-20 millioner', rad: '1,05% (+mva)', disk: '1,05%' },
                    { belop: 'NOK 20-100 millioner', rad: '0,90% (+mva)', disk: '0,90%' },
                    { belop: 'NOK 100 millioner +', rad: '0,75% (+mva)', disk: '0,75%' },
                  ].map((rad, i) => (
                    <tr key={i} className="border-t border-gray-200" style={{ backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                      <td className="p-2 text-xs" style={{ color: PENSUM_COLORS.darkBlue }}>{rad.belop}</td>
                      <td className="p-2 text-center text-xs text-gray-700">{rad.rad}</td>
                      <td className="p-2 text-center text-xs text-gray-700">{rad.disk}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300">
                    <td className="p-2 text-xs font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Performance fee</td>
                    <td className="p-2 text-center text-xs text-gray-400"></td>
                    <td className="p-2 text-center text-xs text-gray-700">20/80 over benchmark med «high watermark»</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th colSpan={2} className="p-2 text-center font-bold text-xs tracking-wider" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' }}>Transaksjonsavgifter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-2 text-xs" style={{ color: PENSUM_COLORS.darkBlue }}>Verdipapirfond</td>
                    <td className="p-2 text-center text-xs text-gray-700">0,15% (minimum NOK 1 000,- Maksimum NOK 10 000,-)</td>
                  </tr>
                  <tr className="border-t border-gray-200" style={{ backgroundColor: '#FAFBFC' }}>
                    <td className="p-2 text-xs" style={{ color: PENSUM_COLORS.darkBlue }}>Andre verdipapirer</td>
                    <td className="p-2 text-center text-xs text-gray-700">0,15% (minimum NOK 250,-)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-gray-400 italic mt-2">
              <p style={{ color: PENSUM_COLORS.salmon }}>* Mer detaljert informasjon rundt honorarer fås ved henvendelse hos Pensum</p>
              <p className="mt-1">Honorarstrukturen er presentert for informasjonsformål. Eventuelle kostnader og honorarer vil først gjelde dersom kundeforhold etableres og avtale inngås.</p>
            </div>
          </div>
        );

      case 'beskatning':
        return (
          <div data-rapport-slide="beskatning" className="space-y-4 page-break-before">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Beskatning av aksjer og fond i 2026</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left w-[120px]" style={{ backgroundColor: '#F8F9FA' }}></th>
                    <th colSpan={2} className="p-3 text-center font-bold text-sm tracking-wider" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F8F9FA' }}>PRIVAT EIE</th>
                    <th colSpan={2} className="p-3 text-center font-bold text-sm tracking-wider" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F8F9FA' }}>AKSJESPAREKONTO (ASK)</th>
                    <th colSpan={2} className="p-3 text-center font-bold text-sm tracking-wider" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F8F9FA' }}>AKSJESELSKAP</th>
                  </tr>
                  <tr>
                    <th className="p-2" style={{ backgroundColor: '#F8F9FA' }}></th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Gevinst/tap</th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.lightBlue }}>Formue*</th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Gevinst/tap</th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.lightBlue }}>Formue*</th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Gevinst/tap</th>
                    <th className="p-2 text-center text-xs font-semibold text-white rounded-t" style={{ backgroundColor: PENSUM_COLORS.lightBlue }}>Formue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-semibold text-xs" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F8F9FA' }}>Norske aksjer, EU/EOS aksjer, Aksjefond registrert i Norge/EU/EOS</td>
                    <td className="p-3 text-xs text-gray-700">37,84 % skatt pa gevinster etter fradrag for skjermingsrente**. Ikke fradrag for skjermingsrente ved tap</td>
                    <td className="p-3 text-xs text-gray-700">80% av markedsverdi beskattes med inntil 1,0%</td>
                    <td className="p-3 text-xs text-gray-700">Ingen lopende beskatning. Ved realisasjon av avtalen samme beskatning som aksjer i privat eie.</td>
                    <td className="p-3 text-xs text-gray-700">80% av markedsverdi beskattes med inntil 1,0%</td>
                    <td className="p-3 text-xs text-gray-700">Ikke skatt pa gevinst, ikke fradrag for tap. 3% av utbytter beskattes med 22% (3%x22%=0,66%)</td>
                    <td className="p-3 text-xs text-gray-700">Selskaper betaler ikke formuesskatt</td>
                  </tr>
                  <tr className="border-t border-gray-200" style={{ backgroundColor: '#FAFBFC' }}>
                    <td className="p-3 font-semibold text-xs" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F3F4F6' }}>Aksjer utenfor EU/EOS, Aksjefond registrert utenfor Norge/EU/EOS</td>
                    <td className="p-3 text-xs text-gray-700">Samme som over</td>
                    <td className="p-3 text-xs text-gray-700">Samme som over</td>
                    <td className="p-3 text-xs text-gray-500">Kan ikke benyttes pa ASK</td>
                    <td className="p-3 text-xs text-gray-500">Kan ikke benyttes pa ASK</td>
                    <td className="p-3 text-xs text-gray-700">22% skatt pa gevinster og utbytter, fradrag ved tap</td>
                    <td className="p-3 text-xs text-gray-700">Selskaper betaler ikke formuesskatt</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-semibold text-xs" style={{ color: PENSUM_COLORS.darkBlue, backgroundColor: '#F8F9FA' }}>Rentefond / Obligasjoner</td>
                    <td className="p-3 text-xs text-gray-700">22% skatt pa gevinster. Fradrag for tap</td>
                    <td className="p-3 text-xs text-gray-700">100% av markedsverdi beskattes med inntil 1,0%</td>
                    <td className="p-3 text-xs text-gray-500">Kan ikke benyttes pa ASK</td>
                    <td className="p-3 text-xs text-gray-500">Kan ikke benyttes pa ASK</td>
                    <td className="p-3 text-xs text-gray-700">22% skatt pa gevinster. Fradrag ved tap</td>
                    <td className="p-3 text-xs text-gray-700">Selskaper betaler ikke formuesskatt</td>
                  </tr>
                  <tr className="border-t-2 border-gray-300" style={{ backgroundColor: '#F3F4F6' }}>
                    <td className="p-3 font-semibold text-xs" style={{ color: PENSUM_COLORS.darkBlue }}>**) Skjermingsrente</td>
                    <td colSpan={2} className="p-3 text-xs text-gray-700">Ja. Ca 3,9 %</td>
                    <td colSpan={2} className="p-3 text-xs text-gray-700">Ja. Ca 3,9 %</td>
                    <td colSpan={2} className="p-3 text-xs text-gray-700">Nei</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-start text-[10px] text-gray-400 pt-2">
              <div>
                <p style={{ color: PENSUM_COLORS.salmon }}>*For formuer overstigende 20 millioner NOK er beskatningen 1,1 %.</p>
                <p style={{ color: PENSUM_COLORS.salmon }}>**) Basert pa estimat for renteniva et i 2025.</p>
              </div>
              <div className="text-right italic max-w-sm">
                <p>Informasjonen om beskatning er av generell karakter og utgjor ikke individuell skatteradgivning. Skatteregler kan endres og vil avhenge av kundens konkrete forhold.</p>
                <p className="mt-1">Kilder: Skattesatser 2025 - regjeringen.no / norgesbank.no</p>
              </div>
            </div>
          </div>
        );

      case 'markedshistorikk':
        return (
          <div data-rapport-slide="markedshistorikk" className="space-y-4 page-break-before">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Aksjemarkedet – Historisk utvikling</h2>
                <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[260px] text-right">Denne fremstillingen er generell og uavhengig av den illustrerte porteføljesammensetningen</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-bold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Arlig aksjeavkastning og fall gjennom aret</h3>
              <p className="text-[10px] text-gray-500 mb-4">MSCI AC World fall gjennom aret vs. kalenderarsavkastning. Til tross for gjennomsnittlige fall gjennom aret pa -15% (median: -11%), er den arlige avkastningen positiv i 26 av 37 (70%) ar</p>
              {(() => {
                const msciData = [
                  { aar: "'88", avk: 21, fall: -8 }, { aar: "'89", avk: 15, fall: -7 },
                  { aar: "'90", avk: -19, fall: -26 }, { aar: "'91", avk: 17, fall: -7 },
                  { aar: "'92", avk: -7, fall: -11 }, { aar: "'93", avk: 22, fall: -6 },
                  { aar: "'94", avk: 3, fall: -8 }, { aar: "'95", avk: 17, fall: -4 },
                  { aar: "'96", avk: 11, fall: -11 }, { aar: "'97", avk: 13, fall: -7 },
                  { aar: "'98", avk: 20, fall: -21 }, { aar: "'99", avk: 25, fall: -14 },
                  { aar: "'00", avk: -15, fall: -20 }, { aar: "'01", avk: -17, fall: -32 },
                  { aar: "'02", avk: -21, fall: -31 }, { aar: "'03", avk: 32, fall: -7 },
                  { aar: "'04", avk: 13, fall: -9 }, { aar: "'05", avk: 9, fall: -9 },
                  { aar: "'06", avk: 19, fall: -13 }, { aar: "'07", avk: 10, fall: -11 },
                  { aar: "'08", avk: -44, fall: -53 }, { aar: "'09", avk: 32, fall: -27 },
                  { aar: "'10", avk: 10, fall: -16 }, { aar: "'11", avk: -9, fall: -24 },
                  { aar: "'12", avk: 13, fall: -14 }, { aar: "'13", avk: 20.3, fall: -9 },
                  { aar: "'14", avk: 2.1, fall: -10 }, { aar: "'15", avk: -4, fall: -16 },
                  { aar: "'16", avk: 6, fall: -12 }, { aar: "'17", avk: 22, fall: -4 },
                  { aar: "'18", avk: -11, fall: -21 }, { aar: "'19", avk: 24, fall: -2 },
                  { aar: "'20", avk: 14, fall: -34 }, { aar: "'21", avk: 10, fall: -6 },
                  { aar: "'22", avk: -20, fall: -27 }, { aar: "'23", avk: 20, fall: -8.3 },
                  { aar: "'24", avk: 16, fall: -8.5 }, { aar: "'25*", avk: 17.1, fall: -16.3 },
                ];
                return (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={msciData} barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="aar" tick={{ fontSize: 9, fill: '#6B7280' }} interval={0} angle={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} domain={[-60, 40]} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const avkVal = payload.find(p => p.dataKey === 'avk');
                        const fallVal = payload.find(p => p.dataKey === 'fall');
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                            <div className="font-semibold text-gray-700 mb-1">{label}</div>
                            {avkVal && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#B0B0B0' }}></span><span>Arsavkastning:</span><span className={"font-bold " + (avkVal.value >= 0 ? 'text-green-700' : 'text-red-600')}>{avkVal.value}%</span></div>}
                            {fallVal && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2E5B5E' }}></span><span>Arsfall:</span><span className="font-bold text-red-600">{fallVal.value}%</span></div>}
                          </div>
                        );
                      }} />
                      <ReferenceLine y={0} stroke="#9CA3AF" />
                      <Bar dataKey="avk" name="Kalenderarsavkastning" fill="#B0B0B0" radius={[2, 2, 0, 0]} maxBarSize={22}>
                        {msciData.map((d, i) => (
                          <Cell key={i} fill={d.aar === "'25*" ? PENSUM_COLORS.teal : '#B0B0B0'} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="fall" name="Fall gjennom aret" stroke="#2E5B5E" strokeWidth={0} dot={{ r: 4, fill: '#2E5B5E', strokeWidth: 0 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="text-[10px] text-gray-400 leading-relaxed">
              <p>Kilde: FactSet, MSCI, J.P. Morgan Asset Management. Avkastningstallene er kursavkastning basert pa MSCI World-indeksen malt i amerikanske dollar. Intrarsfallet er det storste fallet fra topp til bunn i lopet av det aktuelle aret. Historisk avkastning er ingen palitelig indikator for navarende og fremtidige resultater. Dataene gjenspeiler sist tilgjengelige informasjon per 30.09.2025.</p>
            </div>
          </div>
        );

      case 'folgebrev': {
        const _effektivtBelop = investertBelop !== null ? investertBelop : totalKapital;
        const _antallProdukter = pensumAllokering.filter(a => a.vekt > 0).length;
        const _aksjeAndel = pensumAktivafordeling.find(a => a.name === 'Aksjer')?.value || 0;
        const _renteAndel = pensumAktivafordeling.find(a => a.name === 'Renter')?.value || 0;
        const _baseAvk = erGyldigTall(pensumForventetAvkastning) ? pensumForventetAvkastning : 8;
        // Yield calculation
        let _yieldSum = 0, _yieldTotal = 0;
        (pensumAllokering || []).forEach(a => {
          const p = Array.isArray(pensumProdukter) ? pensumProdukter.find(pp => pp.id === a.id) : null;
          const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
          if (erGyldigTall(y) && a.vekt > 0) { _yieldSum += y * a.vekt; _yieldTotal += a.vekt; }
        });
        const _vektetYield = _yieldTotal > 0 ? _yieldSum / _yieldTotal : 0;
        const _sluttverdi = Math.round(_effektivtBelop * Math.pow(1 + _baseAvk / 100, horisont));
        const _formatSluttverdi = (v) => v > 1000000 ? (v / 1000000).toFixed(1) + ' MNOK' : formatCurrency(v);
        return (
          <div data-rapport-slide="folgebrev" className="page-break-before" style={{ minHeight: '500px' }}>
            <div className="flex gap-8" style={{ minHeight: '480px' }}>
              {/* Left: Letter content */}
              <div className="flex-1 flex flex-col justify-between" style={{ minWidth: 0 }}>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold" style={{ color: PENSUM_COLORS.darkBlue, fontFamily: 'Georgia, serif' }}>Kjære {kundeNavn || kundeSelskap || 'Investor'},</h2>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Takk for en god samtale. Basert på dine mål, din risikotoleranse og den investeringshorisonten vi har diskutert, har vi satt sammen et porteføljeforslag som vi mener gir deg den beste balansen mellom vekst og stabilitet.
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Forslaget tar utgangspunkt i {formatCurrency(_effektivtBelop).replace('kr', '').trim()} kroner, en {(valgtPensumProfil || 'moderat').toLowerCase()} risikoprofil og en horisont på {horisont} år. Vi har bygget porteføljen rundt tre klare roller — en bred kjerne som driver langsiktig verdiskaping, en rentedel som stabiliserer og gir løpende kontantstrøm, og utvalgte satellitter som tilfører meravkastningspotensial.
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed">
                    På de neste sidene går vi gjennom selve porteføljekonstruksjonen, historisk utvikling, risikoprofil, og de enkelte produktene i detalj. Ikke nøl med å ta kontakt dersom du har spørsmål.
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {bruker?.bilde ? (
                      <img src={bruker.bilde} alt="" className="w-10 h-10 rounded-full object-cover border flex-shrink-0" style={{ borderColor: PENSUM_COLORS.teal }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                        <svg className="w-5 h-5" style={{ color: PENSUM_COLORS.darkBlue }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{radgiver || 'Rådgiver'}</p>
                      <p className="text-xs text-gray-500">{bruker?.tittel || 'Investeringsrådgiver'}, Pensum Asset Management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Om Pensum sidebar */}
              <div className="flex-shrink-0 flex items-center" style={{ width: '280px' }}>
                <div className="rounded-xl overflow-hidden w-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: PENSUM_COLORS.gold }}>Om Pensum</h4>
                    <p className="text-sm text-blue-100 leading-relaxed">
                      Rådgivning og forvaltning til private og institusjonelle kunder siden 2002.
                    </p>
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PENSUM_COLORS.gold }}>Forvaltningskapital</p>
                      <p className="text-white mt-1"><span className="text-2xl font-bold">NOK 12,3</span> <span className="text-sm text-blue-300">mrd</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PENSUM_COLORS.gold }}>Ansatte</p>
                        <p className="text-xl font-bold text-white mt-0.5">39</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PENSUM_COLORS.gold }}>Vekst AUM</p>
                        <p className="text-xl font-bold mt-0.5" style={{ color: PENSUM_COLORS.teal }}>29,1%</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Regulert av <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Finanstilsynet</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'markedssyn':
        return (
          <div data-rapport-slide="markedssyn" className="space-y-5 page-break-before">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Markedssyn og kontekst</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.teal }}></div>
              <p className="text-sm text-gray-500 italic mt-2">Hvorfor dette forslaget passer til dagens markedsbilde</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { tittel: 'Makrobildet', ikon: 'M4.5 12.75l6 6 9-13.5', tekst: markedssynData.makro },
                { tittel: 'Risikobildet', ikon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', tekst: markedssynData.risiko },
                { tittel: 'Mulighetsbilde', ikon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', tekst: markedssynData.muligheter },
              ].map((blokk, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
                      <svg className="w-4 h-4" style={{ color: PENSUM_COLORS.teal }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={blokk.ikon} /></svg>
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>{blokk.tittel}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{blokk.tekst}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic">Markedssynet reflekterer Pensums vurdering per {markedssynData.periode} og kan endres uten forvarsel.</p>
          </div>
        );

      case 'neste-steg':
        return (
          <div data-rapport-slide="neste-steg" className="page-break-before" style={{ backgroundColor: PENSUM_COLORS.darkBlue, borderRadius: '8px', padding: '32px' }}>
            {/* Header + CTA text */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white">Neste steg</h2>
              <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.teal }}></div>
              <p className="text-sm mt-3" style={{ color: '#94A3B8' }}>Vi ser frem til å ta neste steg sammen. Ta kontakt for en oppfølgingssamtale — vi tilpasser forslaget etter dine ønsker.</p>
            </div>

            {/* Steps (left) + Advisor card (right) */}
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-5">
                {[
                  { nr: '1', tittel: 'Gjennomgang av forslaget', tekst: 'Vi går gjennom porteføljeforslaget sammen og justerer allokering og produktvalg etter dine ønsker.' },
                  { nr: '2', tittel: 'Formaliteter og signering', tekst: 'Etter enighet signerer vi investeringsavtale og rådgivningsmandat. KYC fylles ut digitalt.' },
                  { nr: '3', tittel: 'Porteføljen implementeres', tekst: 'Vi setter opp porteføljen og gjennomfører alle transaksjoner. Du får tilgang til løpende rapportering.' },
                ].map((steg, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: PENSUM_COLORS.teal }}>
                      <span className="text-white font-bold text-sm">{steg.nr}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{steg.tittel}</h4>
                      <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{steg.tekst}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advisor card */}
              <div className="flex items-center">
                <div className="rounded-lg border p-5 text-center w-full" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  {bruker?.bilde ? (
                    <img src={bruker.bilde} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2" style={{ borderColor: PENSUM_COLORS.teal }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <svg className="w-7 h-7" style={{ color: PENSUM_COLORS.lightBlue }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: PENSUM_COLORS.teal }}>Din rådgiver</p>
                  <p className="text-white font-bold mt-1 text-sm">{radgiver || 'Rådgiver'}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{bruker?.tittel || 'Investeringsrådgiver'}</p>
                  {bruker?.telefon && <p className="text-xs text-white mt-2">{bruker.telefon}</p>}
                  {bruker?.epost && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{bruker.epost}</p>}
                </div>
              </div>
            </div>

            {/* Kontorer */}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: PENSUM_COLORS.teal }}>Kontaktdetaljer Pensum Asset Management</h3>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { by: 'Oslo', adresse: 'Frøyas gate 15', postnr: '0273 Oslo', tlf: '+47 23 89 68 44' },
                  { by: 'Fredrikstad', adresse: 'Storgaten 3', postnr: '1607 Fredrikstad', tlf: '+47 23 89 68 44' },
                  { by: 'Stavanger', adresse: 'Løkkeveien 107 (Smedvigkvartalet)', postnr: '4007 Stavanger', tlf: '+47 23 89 68 44' },
                ].map((kontor, i) => (
                  <div key={i} className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 className="text-white font-bold text-sm mb-1">{kontor.by}</h4>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{kontor.adresse}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{kontor.postnr}</p>
                    <p className="text-xs text-white mt-1">{kontor.tlf}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'eksisterende-sammenligning': {
        const eksFond = eksisterendePortefolje.fond;
        const eksAksjer = eksisterendePortefolje.aksjer;
        const eksKontanter = eksisterendePortefolje.kontanter;
        const sumFond = eksFond.reduce((s, f) => s + f.belop, 0);
        const sumAksjer = eksAksjer.reduce((s, a) => s + a.belop, 0);
        const eksTotal = sumFond + sumAksjer + eksKontanter;

        // Eksterne fond (fra sammenligningssiden) — inkluder i oversikten
        const harEksterneFondRapport = visKonkurrentPortefolje && valgteFond.length > 0 && valgteFond.some(f => (fondVekter[f.isin] || 0) > 0);
        const eksterneFondRapport = harEksterneFondRapport ? valgteFond.filter(f => (fondVekter[f.isin] || 0) > 0).map(f => ({
          navn: f.n, isin: f.isin, kategori: f.cat || '',
          vekt: fondVekter[f.isin] || 0,
          avk1y: f.r1y, avk3y: f.r3y, avk5y: f.r5y,
          volatilitet: f.sd3y,
        })) : [];
        const extTotalVekt = eksterneFondRapport.reduce((s, f) => s + f.vekt, 0) || 1;

        // Vis modulen når eksisterende ELLER eksterne fond har data
        const harEksisterendeData = eksTotal > 0;
        const harNoeNaaværendeData = harEksisterendeData || harEksterneFondRapport;

        // Vektede nøkkeltall for eksisterende portefølje (kun fond med data)
        const fondMedData = eksFond.filter(f => f.matchet && f.belop > 0);
        const fondTotalBelop = fondMedData.reduce((s, f) => s + f.belop, 0);
        const eksVektetAvk1y = fondTotalBelop > 0 ? fondMedData.reduce((s, f) => s + (f.avk1y || 0) * f.belop / fondTotalBelop, 0) : null;
        const eksVektetAvk3y = fondTotalBelop > 0 ? fondMedData.reduce((s, f) => s + (f.avk3y || 0) * f.belop / fondTotalBelop, 0) : null;
        const eksVektetAvk5y = fondTotalBelop > 0 ? fondMedData.reduce((s, f) => s + (f.avk5y || 0) * f.belop / fondTotalBelop, 0) : null;
        const eksVektetVolatilitet = fondTotalBelop > 0 ? fondMedData.reduce((s, f) => s + (f.volatilitet || 0) * f.belop / fondTotalBelop, 0) : null;

        // Pensum-forslag nøkkeltall
        const pensumBelop = investertBelop || totalKapital;
        const pensumAvk = pensumForventetAvkastning;
        const aksjeAndelPensum = (pensumAktivafordeling.find(a => a.name === 'Aksjer')?.value || 0) + (pensumAktivafordeling.find(a => a.name === 'Blandet')?.value || 0) * 0.6;
        const renteAndelPensum = (pensumAktivafordeling.find(a => a.name === 'Renter')?.value || 0) + (pensumAktivafordeling.find(a => a.name === 'Blandet')?.value || 0) * 0.4;
        const altAndelPensum = pensumAktivafordeling.find(a => a.name === 'Alternativer')?.value || 0;

        // Pensum historisk avkastning (vektet)
        const pensumHistAvk = beregnPensumHistorikk;

        // Pensum volatilitet (vektet)
        const alleProduktSammenl = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
        let pensumVektetVol = null;
        {
          let volSum = 0; let volVekt = 0;
          pensumAllokering.forEach(allok => {
            const produkt = alleProduktSammenl.find(p => p.id === allok.id);
            if (produkt && allok.vekt > 0) {
              const vol = produkt.volatilitet ?? produkt.stddev3y ?? produktRapportMeta?.[allok.id]?.stddev3y;
              if (erGyldigTall(vol)) { volSum += vol * allok.vekt; volVekt += allok.vekt; }
            }
          });
          if (volVekt > 0) pensumVektetVol = volSum / volVekt;
        }

        // Pensum vektet historisk avkastning (1y, 3y, 5y p.a.)
        // Fallback: beregn fra produktHistorikk når produktet mangler r1y/r3y/r5y felter
        let pensumVektetAvk1y = null, pensumVektetAvk3y = null, pensumVektetAvk5y = null;
        {
          const now = RAPPORT_DATO_OBJEKT;
          const beregnAvkFraHist = (produktId, years) => {
            const hist = produktHistorikk?.[produktId];
            if (!hist?.data?.length) return null;
            const startDato = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
            const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
            const sluttVerdi = hist.data[hist.data.length - 1]?.verdi;
            if (!startVerdi || !sluttVerdi) return null;
            if (years >= 3) return (Math.pow(sluttVerdi / startVerdi, 1 / years) - 1) * 100;
            return ((sluttVerdi / startVerdi) - 1) * 100;
          };
          let s1 = 0, s3 = 0, s5 = 0, w1 = 0, w3 = 0, w5 = 0;
          pensumAllokering.forEach(allok => {
            const produkt = alleProduktSammenl.find(p => p.id === allok.id);
            if (produkt && allok.vekt > 0) {
              let a1 = produkt.avk1y ?? produkt.r1y ?? produktRapportMeta?.[allok.id]?.r1y;
              let a3 = produkt.avk3y ?? produkt.r3y ?? produktRapportMeta?.[allok.id]?.r3y;
              let a5 = produkt.avk5y ?? produkt.r5y ?? produktRapportMeta?.[allok.id]?.r5y;
              // Fallback: beregn fra historikkdata
              if (!erGyldigTall(a1)) a1 = beregnAvkFraHist(allok.id, 1);
              if (!erGyldigTall(a3)) a3 = beregnAvkFraHist(allok.id, 3);
              if (!erGyldigTall(a5)) a5 = beregnAvkFraHist(allok.id, 5);
              if (erGyldigTall(a1)) { s1 += a1 * allok.vekt; w1 += allok.vekt; }
              if (erGyldigTall(a3)) { s3 += a3 * allok.vekt; w3 += allok.vekt; }
              if (erGyldigTall(a5)) { s5 += a5 * allok.vekt; w5 += allok.vekt; }
            }
          });
          if (w1 > 0) pensumVektetAvk1y = s1 / w1;
          if (w3 > 0) pensumVektetAvk3y = s3 / w3;
          if (w5 > 0) pensumVektetAvk5y = s5 / w5;
        }

        // Pensum volatilitet — fallback til beregning fra historikk
        {
          if (pensumVektetVol == null) {
            let volSum = 0; let volVekt = 0;
            pensumAllokering.forEach(allok => {
              const produkt = alleProduktSammenl.find(p => p.id === allok.id);
              if (produkt && allok.vekt > 0) {
                const hist = produktHistorikk?.[allok.id];
                if (hist?.data?.length >= 24) {
                  // Beregn annualisert standardavvik fra månedlige avkastninger
                  const maanedlig = [];
                  for (let i = 1; i < hist.data.length; i++) {
                    if (hist.data[i].verdi > 0 && hist.data[i - 1].verdi > 0) {
                      maanedlig.push((hist.data[i].verdi / hist.data[i - 1].verdi) - 1);
                    }
                  }
                  if (maanedlig.length >= 12) {
                    const snitt = maanedlig.reduce((s, v) => s + v, 0) / maanedlig.length;
                    const varians = maanedlig.reduce((s, v) => s + Math.pow(v - snitt, 2), 0) / (maanedlig.length - 1);
                    const stddev = Math.sqrt(varians) * Math.sqrt(12) * 100;
                    volSum += stddev * allok.vekt; volVekt += allok.vekt;
                  }
                }
              }
            });
            if (volVekt > 0) pensumVektetVol = volSum / volVekt;
          }
        }

        // Eksisterende fordeling (må beregnes FØR nåværende nøkkeltall)
        const eksFondAksje = eksFond.filter(f => f.kategori === 'aksje').reduce((s, f) => s + f.belop, 0);
        const eksFondRente = eksFond.filter(f => f.kategori === 'rente').reduce((s, f) => s + f.belop, 0);
        const eksFondBlandet = eksFond.filter(f => f.kategori === 'blandet').reduce((s, f) => s + f.belop, 0);
        const eksAksjeTotal = eksFondAksje + sumAksjer + eksFondBlandet * 0.6;
        const eksRenteTotal = eksFondRente + eksFondBlandet * 0.4;
        const eksAksjeAndel = eksTotal > 0 ? (eksAksjeTotal / eksTotal * 100) : 0;
        const eksRenteAndel = eksTotal > 0 ? (eksRenteTotal / eksTotal * 100) : 0;
        const eksKontantAndel = eksTotal > 0 ? (eksKontanter / eksTotal * 100) : 0;

        // Nåværende nøkkeltall — kombiner eksisterende + eksterne fond
        let naaVektetAvk1y = eksVektetAvk1y, naaVektetAvk3y = eksVektetAvk3y, naaVektetAvk5y = eksVektetAvk5y;
        let naaVektetVol = eksVektetVolatilitet;
        let naaAksjeAndel = eksAksjeAndel, naaRenteAndel = eksRenteAndel, naaKontantAndel = eksKontantAndel;
        let naaTotal = eksTotal;
        if (harEksterneFondRapport && !harEksisterendeData) {
          // Bare eksterne fond — bruk dem som "nåværende"
          let ea1 = 0, ea3 = 0, ea5 = 0, ev = 0, w1e = 0, w3e = 0, w5e = 0, wve = 0;
          eksterneFondRapport.forEach(f => {
            const w = f.vekt / extTotalVekt;
            if (erGyldigTall(f.avk1y)) { ea1 += f.avk1y * w; w1e += w; }
            if (erGyldigTall(f.avk3y)) { ea3 += f.avk3y * w; w3e += w; }
            if (erGyldigTall(f.avk5y)) { ea5 += f.avk5y * w; w5e += w; }
            if (erGyldigTall(f.volatilitet)) { ev += f.volatilitet * w; wve += w; }
          });
          naaVektetAvk1y = w1e > 0 ? ea1 / w1e : null;
          naaVektetAvk3y = w3e > 0 ? ea3 / w3e : null;
          naaVektetAvk5y = w5e > 0 ? ea5 / w5e : null;
          naaVektetVol = wve > 0 ? ev / wve : null;
          // Aksje/rente fordeling fra fondskategorier
          let extAksje = 0, extRente = 0;
          eksterneFondRapport.forEach(f => {
            const cat = f.kategori?.toLowerCase() || '';
            const w = f.vekt / extTotalVekt;
            if (cat.includes('fixed income') || cat.includes('bond') || cat.includes('money market')) extRente += w;
            else extAksje += w;
          });
          naaAksjeAndel = extAksje * 100;
          naaRenteAndel = extRente * 100;
          naaKontantAndel = 0;
          naaTotal = 0; // Ingen beløp for eksterne
        } else if (harEksterneFondRapport && harEksisterendeData) {
          // Begge — vekt begge together
          let ea1 = 0, ea3 = 0, ea5 = 0, ev = 0, w1e = 0, w3e = 0, w5e = 0, wve = 0;
          eksterneFondRapport.forEach(f => {
            const w = f.vekt / extTotalVekt;
            if (erGyldigTall(f.avk1y)) { ea1 += f.avk1y * w; w1e += w; }
            if (erGyldigTall(f.avk3y)) { ea3 += f.avk3y * w; w3e += w; }
            if (erGyldigTall(f.avk5y)) { ea5 += f.avk5y * w; w5e += w; }
            if (erGyldigTall(f.volatilitet)) { ev += f.volatilitet * w; wve += w; }
          });
          const extAvk1y = w1e > 0 ? ea1 / w1e : null;
          const extAvk3y = w3e > 0 ? ea3 / w3e : null;
          const extAvk5y = w5e > 0 ? ea5 / w5e : null;
          // Snitt av eks og ekstern
          if (extAvk1y != null && eksVektetAvk1y != null) naaVektetAvk1y = (eksVektetAvk1y + extAvk1y) / 2;
          else if (extAvk1y != null) naaVektetAvk1y = extAvk1y;
          if (extAvk3y != null && eksVektetAvk3y != null) naaVektetAvk3y = (eksVektetAvk3y + extAvk3y) / 2;
          else if (extAvk3y != null) naaVektetAvk3y = extAvk3y;
          if (extAvk5y != null && eksVektetAvk5y != null) naaVektetAvk5y = (eksVektetAvk5y + extAvk5y) / 2;
          else if (extAvk5y != null) naaVektetAvk5y = extAvk5y;
        }

        // Data for avkastnings-sammenligning bar chart
        const avkBarData = [
          { periode: '1 år', eksisterende: naaVektetAvk1y, pensum: pensumVektetAvk1y },
          { periode: '3 år p.a.', eksisterende: naaVektetAvk3y, pensum: pensumVektetAvk3y },
          { periode: '5 år p.a.', eksisterende: naaVektetAvk5y, pensum: pensumVektetAvk5y },
        ].filter(d => d.eksisterende != null || d.pensum != null);

        // Sektor/region sammenligning
        const pensumSektorer = aggregertPensumEksponering?.sektorer || [];
        const pensumRegioner = aggregertPensumEksponering?.regioner || [];

        // Bygg nåværende portefølje sektor/region eksponering fra Morningstar-data
        const SEKTOR_KEYS = [
          { key: 'sTech', label: 'Teknologi' }, { key: 'sFin', label: 'Finans' },
          { key: 'sHlt', label: 'Helse' }, { key: 'sInd', label: 'Industri' },
          { key: 'sCyc', label: 'Syklisk konsum' }, { key: 'sDef', label: 'Defensivt konsum' },
          { key: 'sEng', label: 'Energi' }, { key: 'sComm', label: 'Kommunikasjon' },
          { key: 'sMat', label: 'Materialer' }, { key: 'sRE', label: 'Eiendom' },
          { key: 'sUtil', label: 'Kraftforsyning' },
        ];
        const REGION_KEYS = [
          { key: 'cUS', label: 'USA' }, { key: 'cUK', label: 'Storbritannia' },
          { key: 'cJP', label: 'Japan' }, { key: 'cDE', label: 'Tyskland' },
          { key: 'cFR', label: 'Frankrike' }, { key: 'cNO', label: 'Norge' },
          { key: 'cSE', label: 'Sverige' }, { key: 'cDK', label: 'Danmark' },
          { key: 'cCN', label: 'Kina' },
        ];

        // Samle MS-data fra alle nåværende fond (eksisterende + eksterne)
        const naaSektorMap = {};
        const naaRegionMap = {};
        let naaTotalVektForEksp = 0;
        // Eksisterende fond — slå opp i Morningstar-listen
        eksFond.filter(f => f.matchet && f.belop > 0).forEach(f => {
          const ms = eksterneFond?.find(ef => ef.isin === f.isin);
          if (!ms) return;
          const vekt = harEksisterendeData ? (f.belop / (eksTotal || 1)) : 0;
          SEKTOR_KEYS.forEach(s => { if (ms[s.key] > 0) naaSektorMap[s.key] = (naaSektorMap[s.key] || 0) + ms[s.key] * vekt; });
          REGION_KEYS.forEach(r => { if (ms[r.key] > 0) naaRegionMap[r.key] = (naaRegionMap[r.key] || 0) + ms[r.key] * vekt; });
          naaTotalVektForEksp += vekt;
        });
        // Eksterne fond — har allerede Morningstar-data direkte
        eksterneFondRapport.forEach(f => {
          const ms = valgteFond.find(vf => vf.isin === f.isin);
          if (!ms) return;
          const vekt = f.vekt / extTotalVekt;
          const skalert = harEksisterendeData ? vekt * (1 - naaTotalVektForEksp) : vekt; // normaliser hvis begge finnes
          SEKTOR_KEYS.forEach(s => { if (ms[s.key] > 0) naaSektorMap[s.key] = (naaSektorMap[s.key] || 0) + ms[s.key] * (harEksisterendeData ? vekt * 0.5 : vekt); });
          REGION_KEYS.forEach(r => { if (ms[r.key] > 0) naaRegionMap[r.key] = (naaRegionMap[r.key] || 0) + ms[r.key] * (harEksisterendeData ? vekt * 0.5 : vekt); });
        });
        const naaSektorer = SEKTOR_KEYS
          .map(s => ({ navn: s.label, vekt: parseFloat((naaSektorMap[s.key] || 0).toFixed(1)) }))
          .filter(s => s.vekt > 0)
          .sort((a, b) => b.vekt - a.vekt)
          .slice(0, 6);
        const naaRegioner = REGION_KEYS
          .map(r => ({ navn: r.label, vekt: parseFloat((naaRegionMap[r.key] || 0).toFixed(1)) }))
          .filter(r => r.vekt > 0)
          .sort((a, b) => b.vekt - a.vekt)
          .slice(0, 6);

        // Bygg nåværende portefølje kategorioversikt (eksisterende + eksterne fond)
        const eksKategoriOversikt = {};
        eksFond.filter(f => f.matchet && f.belop > 0).forEach(f => {
          const cat = f.cat || f.geografi || '';
          if (!cat) return;
          eksKategoriOversikt[cat] = (eksKategoriOversikt[cat] || 0) + f.belop;
        });
        // Inkluder eksterne fond i kategorioversikten
        eksterneFondRapport.forEach(f => {
          const cat = f.kategori || '';
          if (!cat) return;
          eksKategoriOversikt[cat] = (eksKategoriOversikt[cat] || 0) + f.vekt; // bruker vekt som proxy
        });
        const eksKategoriTotal = Object.values(eksKategoriOversikt).reduce((s, v) => s + v, 0);
        const eksKategorier = Object.entries(eksKategoriOversikt)
          .map(([navn, belop]) => ({ navn, vekt: eksKategoriTotal > 0 ? parseFloat((belop / eksKategoriTotal * 100).toFixed(1)) : 0 }))
          .sort((a, b) => b.vekt - a.vekt)
          .slice(0, 6);

        const avkFargeInline = (v) => v == null ? '#9CA3AF' : v >= 0 ? '#059669' : '#DC2626';

        return (
          <div data-rapport-slide="eksisterende-sammenligning" className="page-break-before">
            <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>
              Sammenligning med eksisterende portefølje{eksisterendePortefolje.kilde ? ` (${eksisterendePortefolje.kilde})` : ''}
            </h2>

            {/* Row 1: Nøkkeltall (left 2 cols) + Bar chart (right) */}
            <div className="flex gap-4 mb-4">
              {/* Nåværende nøkkeltall */}
              {harNoeNaaværendeData && <div className="rounded-lg border p-3 flex-1" style={{ borderColor: '#CBD5E1' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#94A3B8' }}></div>
                  <h3 className="text-xs font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Nåværende{eksisterendePortefolje.kilde ? ` — ${eksisterendePortefolje.kilde}` : ''}</h3>
                </div>
                <div className="space-y-1">
                  {naaTotal > 0 && <div className="flex justify-between text-[10px]"><span className="text-gray-500">Total verdi</span><span className="font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(naaTotal)}</span></div>}
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Aksje / Rente</span><span className="font-medium">{naaAksjeAndel.toFixed(0)}% / {naaRenteAndel.toFixed(0)}%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Vol. (3 år)</span><span className="font-medium">{naaVektetVol != null ? naaVektetVol.toFixed(1) + '%' : '—'}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">1 år / 3 år / 5 år</span><span className="font-bold" style={{ color: avkFargeInline(naaVektetAvk1y) }}>{[naaVektetAvk1y, naaVektetAvk3y, naaVektetAvk5y].map(v => v != null ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—').join(' / ')}</span></div>
                </div>
              </div>}

              {/* Pensum nøkkeltall */}
              <div className="rounded-lg border p-3 flex-1" style={{ borderColor: PENSUM_COLORS.teal }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PENSUM_COLORS.teal }}></div>
                  <h3 className="text-xs font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum-forslaget</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Investert beløp</span><span className="font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(pensumBelop)}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Aksje / Rente</span><span className="font-medium">{aksjeAndelPensum.toFixed(0)}% / {renteAndelPensum.toFixed(0)}%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Vol. (3 år)</span><span className="font-medium">{pensumVektetVol != null ? pensumVektetVol.toFixed(1) + '%' : '—'}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">1 år / 3 år / 5 år</span><span className="font-bold" style={{ color: avkFargeInline(pensumVektetAvk1y) }}>{[pensumVektetAvk1y, pensumVektetAvk3y, pensumVektetAvk5y].map(v => v != null ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—').join(' / ')}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Forv. avk. p.a.</span><span className="font-bold" style={{ color: '#059669' }}>{pensumAvk ? pensumAvk.toFixed(1) + '%' : '—'}</span></div>
                </div>
              </div>

              {/* Bar chart */}
              {avkBarData.length > 0 && (
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={avkBarData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="periode" tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} />
                      <YAxis tickFormatter={(v) => (v >= 0 ? '+' : '') + v.toFixed(0) + '%'} tick={{ fontSize: 8, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip formatter={(v, name) => [(v >= 0 ? '+' : '') + v.toFixed(1) + '%', name === 'eksisterende' ? 'Nåværende' : 'Pensum']} contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                      <Legend iconType="circle" formatter={(v) => v === 'eksisterende' ? 'Nåværende' : 'Pensum'} wrapperStyle={{ fontSize: '9px' }} />
                      <Bar dataKey="eksisterende" fill="#94A3B8" radius={[3, 3, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="pensum" fill={PENSUM_COLORS.teal} radius={[3, 3, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Row 2: Aktivafordeling side by side */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {harNoeNaaværendeData && <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivafordeling — Nåværende</p>
                <div className="flex h-5 rounded-full overflow-hidden">
                  {naaAksjeAndel > 0 && <div style={{ width: naaAksjeAndel + '%', backgroundColor: PENSUM_COLORS.darkBlue }} className="flex items-center justify-center text-white text-[8px] font-medium">{naaAksjeAndel >= 15 ? 'Aksje ' + naaAksjeAndel.toFixed(0) + '%' : ''}</div>}
                  {naaRenteAndel > 0 && <div style={{ width: naaRenteAndel + '%', backgroundColor: PENSUM_COLORS.salmon }} className="flex items-center justify-center text-white text-[8px] font-medium">{naaRenteAndel >= 15 ? 'Rente ' + naaRenteAndel.toFixed(0) + '%' : ''}</div>}
                  {naaKontantAndel > 0 && <div style={{ width: naaKontantAndel + '%', backgroundColor: '#CBD5E1' }} className="flex items-center justify-center text-[8px] font-medium">{naaKontantAndel >= 15 ? 'Kont.' : ''}</div>}
                </div>
              </div>}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivafordeling — Pensum</p>
                <div className="flex h-5 rounded-full overflow-hidden">
                  {aksjeAndelPensum > 0 && <div style={{ width: aksjeAndelPensum + '%', backgroundColor: PENSUM_COLORS.darkBlue }} className="flex items-center justify-center text-white text-[8px] font-medium">{aksjeAndelPensum >= 15 ? 'Aksje ' + aksjeAndelPensum.toFixed(0) + '%' : ''}</div>}
                  {renteAndelPensum > 0 && <div style={{ width: renteAndelPensum + '%', backgroundColor: PENSUM_COLORS.salmon }} className="flex items-center justify-center text-white text-[8px] font-medium">{renteAndelPensum >= 15 ? 'Rente ' + renteAndelPensum.toFixed(0) + '%' : ''}</div>}
                  {altAndelPensum > 0 && <div style={{ width: altAndelPensum + '%', backgroundColor: PENSUM_COLORS.teal }} className="flex items-center justify-center text-white text-[8px] font-medium">{altAndelPensum >= 15 ? 'Alt.' : ''}</div>}
                </div>
              </div>
            </div>

            {/* Row 3: Eksponering — 4 columns */}
            {(pensumRegioner.length > 0 || naaRegioner.length > 0 || pensumSektorer.length > 0 || naaSektorer.length > 0) && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Eksponering — sammenligning</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { title: 'Nåv. — Regioner', data: naaRegioner, color: '#94A3B8' },
                    { title: 'Pensum — Regioner', data: pensumRegioner, color: PENSUM_COLORS.teal },
                    { title: 'Nåv. — Sektorer', data: naaSektorer, color: '#94A3B8' },
                    { title: 'Pensum — Sektorer', data: pensumSektorer, color: PENSUM_COLORS.salmon },
                  ].map(block => (
                    <div key={block.title}>
                      <p className="text-[9px] font-semibold text-gray-500 mb-1">{block.title}</p>
                      {block.data.length > 0 ? (
                        <div className="space-y-0.5">
                          {block.data.slice(0, 5).map((r, i) => (
                            <div key={i} className="flex items-center gap-1" style={{ lineHeight: '1.1' }}>
                              <div className="w-10 bg-gray-100 rounded-full overflow-hidden flex-shrink-0" style={{ height: '6px' }}>
                                <div className="h-full rounded-full" style={{ width: Math.min(r.vekt, 100) + '%', backgroundColor: block.color }}></div>
                              </div>
                              <span className="text-[9px] text-gray-600 flex-1 truncate">{r.navn}</span>
                              <span className="text-[9px] font-semibold w-8 text-right flex-shrink-0">{r.vekt}%</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-[9px] text-gray-400 italic">—</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 4: Fondstabell — kompakt */}
            {(eksFond.length > 0 || eksterneFondRapport.length > 0) && (
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Nåværende fondsbeholdning</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#F0F4F8' }}>
                      <th className="py-2 px-3 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Fond</th>
                      <th className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Beløp</th>
                      <th className="py-2 px-2 text-center font-medium text-gray-500">Andel</th>
                      <th className="py-2 px-2 text-center font-medium text-gray-500">Kategori</th>
                      <th className="py-2 px-2 text-right font-medium text-gray-500">Vol. 3å</th>
                      <th className="py-2 px-2 text-right font-medium text-gray-500">1 år</th>
                      <th className="py-2 px-2 text-right font-medium text-gray-500">3 år p.a.</th>
                      <th className="py-2 px-2 text-right font-medium text-gray-500">5 år p.a.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eksFond.map((f, idx) => (
                      <tr key={f.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-1.5 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{f.navn}</td>
                        <td className="py-1.5 px-2 text-right">{f.belop > 0 ? formatCurrency(f.belop) : '—'}</td>
                        <td className="py-1.5 px-2 text-center text-gray-500">{eksTotal > 0 && f.belop > 0 ? (f.belop / eksTotal * 100).toFixed(1) + '%' : '—'}</td>
                        <td className="py-1.5 px-2 text-center">{f.kategori === 'aksje' ? 'Aksje' : f.kategori === 'rente' ? 'Rente' : f.kategori === 'blandet' ? 'Blandet' : '—'}</td>
                        <td className="py-1.5 px-2 text-right text-gray-500">{f.volatilitet != null ? f.volatilitet.toFixed(1) + '%' : '—'}</td>
                        <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk1y) }}>{f.avk1y != null ? (f.avk1y >= 0 ? '+' : '') + f.avk1y.toFixed(1) + '%' : '—'}</td>
                        <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk3y) }}>{f.avk3y != null ? (f.avk3y >= 0 ? '+' : '') + f.avk3y.toFixed(1) + '%' : '—'}</td>
                        <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk5y) }}>{f.avk5y != null ? (f.avk5y >= 0 ? '+' : '') + f.avk5y.toFixed(1) + '%' : '—'}</td>
                      </tr>
                    ))}
                    {eksterneFondRapport.map((f, idx) => {
                      const fKat = f.kategori?.toLowerCase().includes('fixed income') || f.kategori?.toLowerCase().includes('bond') || f.kategori?.toLowerCase().includes('money market') ? 'Rente'
                        : f.kategori?.toLowerCase().includes('allocation') || f.kategori?.toLowerCase().includes('mixed') ? 'Blandet' : 'Aksje';
                      return (
                        <tr key={f.isin} className={(eksFond.length + idx) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="py-1.5 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{f.navn}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">—</td>
                          <td className="py-1.5 px-2 text-center text-gray-500">{(f.vekt / extTotalVekt * 100).toFixed(0)}%</td>
                          <td className="py-1.5 px-2 text-center">{fKat}</td>
                          <td className="py-1.5 px-2 text-right text-gray-500">{f.volatilitet != null ? f.volatilitet.toFixed(1) + '%' : '—'}</td>
                          <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk1y) }}>{f.avk1y != null ? (f.avk1y >= 0 ? '+' : '') + f.avk1y.toFixed(1) + '%' : '—'}</td>
                          <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk3y) }}>{f.avk3y != null ? (f.avk3y >= 0 ? '+' : '') + f.avk3y.toFixed(1) + '%' : '—'}</td>
                          <td className="py-1.5 px-2 text-right" style={{ color: avkFargeInline(f.avk5y) }}>{f.avk5y != null ? (f.avk5y >= 0 ? '+' : '') + f.avk5y.toFixed(1) + '%' : '—'}</td>
                        </tr>
                      );
                    })}
                    {eksAksjer.length > 0 && (
                      <tr className="bg-gray-50/50">
                        <td className="py-1.5 px-3 font-medium italic text-gray-500">Enkeltaksjer ({eksAksjer.map(a => a.navn).filter(Boolean).join(', ') || eksAksjer.length + ' poster'})</td>
                        <td className="py-1.5 px-2 text-right">{sumAksjer > 0 ? formatCurrency(sumAksjer) : '—'}</td>
                        <td className="py-1.5 px-2 text-center text-gray-500">{eksTotal > 0 && sumAksjer > 0 ? (sumAksjer / eksTotal * 100).toFixed(1) + '%' : '—'}</td>
                        <td className="py-1.5 px-2 text-center">Aksje</td>
                        <td colSpan={4} className="py-1.5 px-2 text-center text-gray-400 italic text-[10px]">Benchmarkes mot Oslo Børs</td>
                      </tr>
                    )}
                    {eksKontanter > 0 && (
                      <tr className="bg-gray-50/50">
                        <td className="py-1.5 px-3 font-medium text-gray-500">Kontanter</td>
                        <td className="py-1.5 px-2 text-right">{formatCurrency(eksKontanter)}</td>
                        <td className="py-1.5 px-2 text-center text-gray-500">{(eksKontantAndel).toFixed(1)}%</td>
                        <td className="py-1.5 px-2 text-center text-gray-400">—</td>
                        <td className="py-1.5 px-2 text-right text-gray-400">0%</td>
                        <td colSpan={3} className="py-1.5 px-2 text-center text-gray-400 italic text-[10px]">Null avkastning</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#F0F4F8' }}>
                      <td className="py-2 px-3 font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Totalt</td>
                      <td className="py-2 px-2 text-right font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(eksTotal)}</td>
                      <td className="py-2 px-2 text-center font-medium">100%</td>
                      <td></td>
                      <td className="py-2 px-2 text-right font-medium">{eksVektetVolatilitet != null ? eksVektetVolatilitet.toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-2 text-right font-medium" style={{ color: avkFargeInline(eksVektetAvk1y) }}>{eksVektetAvk1y != null ? (eksVektetAvk1y >= 0 ? '+' : '') + eksVektetAvk1y.toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-2 text-right font-medium" style={{ color: avkFargeInline(eksVektetAvk3y) }}>{eksVektetAvk3y != null ? (eksVektetAvk3y >= 0 ? '+' : '') + eksVektetAvk3y.toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-2 text-right font-bold" style={{ color: avkFargeInline(eksVektetAvk5y) }}>{eksVektetAvk5y != null ? (eksVektetAvk5y >= 0 ? '+' : '') + eksVektetAvk5y.toFixed(1) + '%' : '—'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="text-[10px] text-gray-400 italic">
              Sammenligningen er illustrativ. Avkastningstall er basert på fondenes historiske avkastning. Pensum-forslagets forventede avkastning er basert på forventede avkastningstall. Historisk avkastning er ingen garanti for fremtidig avkastning.
            </div>
          </div>
        );
      }

      case 'totalallokering': {
        const _allok = allokering || [];
        const _sammAllok = sammenligningAllokering || [];
        const _belop = effektivtInvestertBelop || totalKapital || 10000000;
        const harSammenligning = showComparison && _sammAllok.length > 0;

        // Category-level data for current
        const katCurrent = {};
        _allok.forEach(a => { if (a.vekt > 0) katCurrent[a.kategori] = (katCurrent[a.kategori] || 0) + a.vekt; });
        const katCurrentArr = Object.entries(katCurrent).map(([k, v]) => ({ name: k === 'aksjer' ? 'Aksjer' : k === 'renter' ? 'Renter' : k === 'privateMarkets' ? 'Private Equity' : k === 'eiendom' ? 'Eiendom' : k, value: parseFloat(v.toFixed(1)), color: k === 'aksjer' ? PENSUM_COLORS.darkBlue : k === 'renter' ? PENSUM_COLORS.salmon : k === 'privateMarkets' ? PENSUM_COLORS.teal : PENSUM_COLORS.gold }));

        // Category-level data for proposed
        const katProposed = {};
        _sammAllok.forEach(a => { if (a.vekt > 0) katProposed[a.kategori] = (katProposed[a.kategori] || 0) + a.vekt; });
        const katProposedArr = Object.entries(katProposed).map(([k, v]) => ({ name: k === 'aksjer' ? 'Aksjer' : k === 'renter' ? 'Renter' : k === 'privateMarkets' ? 'Private Equity' : k === 'eiendom' ? 'Eiendom' : k, value: parseFloat(v.toFixed(1)), color: k === 'aksjer' ? PENSUM_COLORS.darkBlue : k === 'renter' ? PENSUM_COLORS.salmon : k === 'privateMarkets' ? PENSUM_COLORS.teal : PENSUM_COLORS.gold }));

        // Likvid/illikvid
        const illikvCurrent = _allok.filter(a => a.kategori === 'privateMarkets' || a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0);
        const likvidCurrent = _allok.reduce((s, a) => s + a.vekt, 0) - illikvCurrent;
        const illikvProposed = _sammAllok.filter(a => a.kategori === 'privateMarkets' || a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0);
        const likvidProposed = _sammAllok.reduce((s, a) => s + a.vekt, 0) - illikvProposed;

        const renderPie = (data, label) => (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-center" style={{ color: PENSUM_COLORS.darkBlue }}>{label}</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" paddingAngle={2} cornerRadius={4}>
                  {data.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {data.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }}></div><span className="text-gray-600">{d.name}</span></div>
                  <span className="font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{d.value.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        );

        return (
          <div data-rapport-slide="totalallokering" className="page-break-before">
            <h2 className="text-xl font-bold mb-2 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Totalallokering — {harSammenligning ? 'før og etter' : 'oversikt'}</h2>
            <p className="text-xs text-gray-500 mb-5">Samlet aktivasammensetning {harSammenligning ? `for nåværende (${valgtPensumProfil}) og foreslått (${sammenligningProfil}) allokering` : `basert på ${valgtPensumProfil}-profil`}. Totalkapital: {formatCurrency(_belop)}.</p>

            {/* Pie charts: current vs proposed */}
            <div className={harSammenligning ? "grid grid-cols-2 gap-8 mb-6" : "grid grid-cols-1 gap-8 mb-6 max-w-sm mx-auto"}>
              {renderPie(katCurrentArr, harSammenligning ? `Nåværende — ${valgtPensumProfil}` : valgtPensumProfil)}
              {harSammenligning && renderPie(katProposedArr, `Foreslått — ${sammenligningProfil}`)}
            </div>

            {/* Likviditet & Aktivafordeling — side by side pie charts */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet & aktivafordeling</h4>
              <div className={harSammenligning ? "grid grid-cols-2 gap-5" : "grid grid-cols-1 gap-5 max-w-lg"}>
                {/* Nåværende */}
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-500 mb-2 text-center">{harSammenligning ? `Nåværende — ${valgtPensumProfil}` : valgtPensumProfil}</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                          <Pie data={[{ name: 'Likvid', value: likvidCurrent, color: PENSUM_COLORS.darkBlue }, { name: 'Illikvid', value: illikvCurrent, color: PENSUM_COLORS.gold }].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" paddingAngle={2}>
                            {[{ color: PENSUM_COLORS.darkBlue }, { color: PENSUM_COLORS.gold }].map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => v.toFixed(0) + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-3 text-[9px]">
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>Likvid {likvidCurrent.toFixed(0)}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: PENSUM_COLORS.gold }}></span>Illikvid {illikvCurrent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                          <Pie data={katCurrentArr} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" paddingAngle={2}>
                            {katCurrentArr.map((e) => <Cell key={e.name} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => v.toFixed(0) + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9px]">
                        {katCurrentArr.map(d => <span key={d.name}><span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ backgroundColor: d.color }}></span>{d.name} {d.value.toFixed(0)}%</span>)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Foreslått */}
                {harSammenligning && <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-500 mb-2 text-center">Foreslått — {sammenligningProfil}</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                          <Pie data={[{ name: 'Likvid', value: likvidProposed, color: PENSUM_COLORS.darkBlue }, { name: 'Illikvid', value: illikvProposed, color: PENSUM_COLORS.gold }].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" paddingAngle={2}>
                            {[{ color: PENSUM_COLORS.darkBlue }, { color: PENSUM_COLORS.gold }].map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => v.toFixed(0) + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-3 text-[9px]">
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></span>Likvid {likvidProposed.toFixed(0)}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: PENSUM_COLORS.gold }}></span>Illikvid {illikvProposed.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                          <Pie data={katProposedArr} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" paddingAngle={2}>
                            {katProposedArr.map((e) => <Cell key={e.name} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => v.toFixed(0) + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9px]">
                        {katProposedArr.map(d => <span key={d.name}><span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ backgroundColor: d.color }}></span>{d.name} {d.value.toFixed(0)}%</span>)}
                      </div>
                    </div>
                  </div>
                </div>}
              </div>
            </div>

            {/* Rebalansering info */}
            {rebalanseringAktiv && rebalanseringer.length > 0 && (
              <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-xs font-semibold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Årlig rebalansering</p>
                {rebalanseringer.map((reb, i) => (
                  <p key={i} className="text-xs text-gray-600">{reb.prosentPerAar}% av {reb.fraAktiva} selges årlig og reinvesteres i {reb.tilAktiva}</p>
                ))}
              </div>
            )}

            {/* Key metrics comparison table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F0F4F8' }}>
                    <th className="py-2.5 px-4 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Nøkkeltall</th>
                    <th className="py-2.5 px-4 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{harSammenligning ? 'Nåværende' : 'Portefølje'}</th>
                    {harSammenligning && <th className="py-2.5 px-4 text-right font-semibold" style={{ color: PENSUM_COLORS.teal }}>Foreslått</th>}
                    {harSammenligning && <th className="py-2.5 px-4 text-right font-semibold text-gray-400">Endring</th>}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Forventet avkastning p.a.', curr: vektetAvkastning, prop: sammenligningAvkastning, fmt: v => v.toFixed(1) + '%' },
                    { label: 'Aksjeandel', curr: _allok.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0), prop: _sammAllok.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0), fmt: v => v.toFixed(0) + '%' },
                    { label: 'Renteandel', curr: _allok.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0), prop: _sammAllok.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0), fmt: v => v.toFixed(0) + '%' },
                    { label: 'Eiendomsandel', curr: _allok.filter(a => a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0), prop: _sammAllok.filter(a => a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0), fmt: v => v.toFixed(0) + '%' },
                    { label: 'Likvid andel', curr: likvidCurrent, prop: likvidProposed, fmt: v => v.toFixed(0) + '%' },
                    { label: 'Sluttverdi (' + horisont + ' år)', curr: verdiutvikling?.[verdiutvikling?.length - 1]?.total, prop: sammenligningVerdiutvikling?.[sammenligningVerdiutvikling?.length - 1]?.total, fmt: v => v ? formatCurrency(Math.round(v)) : '—' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 text-sm text-gray-600">{row.label}</td>
                      <td className="py-2 px-4 text-right text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{row.fmt(row.curr)}</td>
                      {harSammenligning && <td className="py-2 px-4 text-right text-sm font-semibold" style={{ color: PENSUM_COLORS.teal }}>{row.fmt(row.prop)}</td>}
                      {harSammenligning && <td className="py-2 px-4 text-right text-xs" style={{ color: typeof row.curr === 'number' && typeof row.prop === 'number' ? (row.prop > row.curr ? '#059669' : row.prop < row.curr ? '#DC2626' : '#9CA3AF') : '#9CA3AF' }}>{typeof row.curr === 'number' && typeof row.prop === 'number' ? (row.prop > row.curr ? '+' : '') + (row.prop - row.curr).toFixed(1) + (row.label.includes('%') || row.label.includes('andel') ? 'pp' : '') : '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'prognose-sammenligning': {
        const _belop2 = effektivtInvestertBelop || totalKapital || 10000000;
        const harSammenl2 = showComparison && sammenligningVerdiutvikling?.length > 0;
        const _verd = verdiutvikling || [];
        const _sammVerd = sammenligningVerdiutvikling || [];
        const _scenario = scenarioData || [];

        // Build combined chart data
        const chartRows = _verd.map((row, idx) => {
          const r = { year: row.year, forventet: row.total };
          if (_scenario[idx]) {
            r.pessimistisk = _scenario[idx].pessimistisk;
            r.optimistisk = _scenario[idx].optimistisk;
          }
          if (harSammenl2 && _sammVerd[idx]) r.alternativ = _sammVerd[idx].total;
          return r;
        });

        const sluttForventet = _verd[_verd.length - 1]?.total || _belop2;
        const sluttAlternativ = harSammenl2 ? (_sammVerd[_sammVerd.length - 1]?.total || _belop2) : null;
        const differanse = harSammenl2 ? sluttAlternativ - sluttForventet : null;

        return (
          <div data-rapport-slide="prognose-sammenligning" className="page-break-before">
            <h2 className="text-xl font-bold mb-2 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Prognoseoversikt — verdiutvikling</h2>
            <p className="text-xs text-gray-500 mb-5">Forventet verdiutvikling over {horisont} år basert på modellert avkastning.{harSammenl2 ? ` Sammenligner ${valgtPensumProfil} (nåværende) med ${sammenligningProfil} (foreslått).` : ''} Startkapital: {formatCurrency(_belop2)}.{nettoKontantstrom ? ` Årlig netto kontantstrøm: ${formatCurrency(nettoKontantstrom)}.` : ''}</p>

            {/* Summary cards */}
            <div className={harSammenl2 ? "grid grid-cols-4 gap-4 mb-5" : "grid grid-cols-3 gap-4 mb-5"}>
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F0F4F8' }}>
                <p className="text-[10px] text-gray-500 uppercase">Startkapital</p>
                <p className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(_belop2)}</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F0F4F8' }}>
                <p className="text-[10px] text-gray-500 uppercase">Sluttverdi ({valgtPensumProfil})</p>
                <p className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(Math.round(sluttForventet))}</p>
              </div>
              {harSammenl2 && <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F0FDF4' }}>
                <p className="text-[10px] text-gray-500 uppercase">Sluttverdi ({sammenligningProfil})</p>
                <p className="text-lg font-bold" style={{ color: PENSUM_COLORS.teal }}>{formatCurrency(Math.round(sluttAlternativ))}</p>
              </div>}
              {harSammenl2 ? (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: differanse >= 0 ? '#F0FDF4' : '#FEF2F2' }}>
                  <p className="text-[10px] text-gray-500 uppercase">Differanse</p>
                  <p className="text-lg font-bold" style={{ color: differanse >= 0 ? '#059669' : '#DC2626' }}>{differanse >= 0 ? '+' : ''}{formatCurrency(Math.round(differanse))}</p>
                </div>
              ) : (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F0F4F8' }}>
                  <p className="text-[10px] text-gray-500 uppercase">Forv. avkastning p.a.</p>
                  <p className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{vektetAvkastning.toFixed(1)}%</p>
                </div>
              )}
            </div>

            {/* Projection chart */}
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5 mb-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet utvikling over {horisont} år</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartRows} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} tick={{ fontSize: 10, fill: '#6B7280' }} width={50} />
                  <Tooltip formatter={(v) => formatCurrency(Math.round(v))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {_scenario.length > 0 && <Area type="monotone" dataKey="optimistisk" stroke={PENSUM_COLORS.teal} fill={PENSUM_COLORS.teal} fillOpacity={0.08} strokeDasharray="5 5" strokeWidth={1.5} name="Optimistisk" />}
                  <Area type="monotone" dataKey="forventet" stroke={PENSUM_COLORS.darkBlue} fill={PENSUM_COLORS.darkBlue} fillOpacity={0.1} strokeWidth={2.5} name={harSammenl2 ? `${valgtPensumProfil} (nåværende)` : 'Forventet'} />
                  {harSammenl2 && <Area type="monotone" dataKey="alternativ" stroke={PENSUM_COLORS.teal} fill={PENSUM_COLORS.teal} fillOpacity={0.05} strokeWidth={2} strokeDasharray="8 4" name={`${sammenligningProfil} (foreslått)`} />}
                  {_scenario.length > 0 && showPessimistic && <Area type="monotone" dataKey="pessimistisk" stroke="#DC2626" fill="#DC2626" fillOpacity={0.05} strokeDasharray="5 5" strokeWidth={1.5} name="Pessimistisk" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[10px] text-gray-400 italic">Prognosene er modellbaserte illustrasjoner basert på forventede avkastningstall. Faktisk avkastning vil kunne avvike vesentlig. Historisk avkastning er ingen garanti for fremtidig avkastning.</p>
          </div>
        );
      }

      case 'appendix-side':
        return (
          <div data-rapport-slide="appendix-side" className="page-break-before flex items-center justify-center" style={{ minHeight: '300px', backgroundColor: PENSUM_COLORS.darkBlue, borderRadius: '8px' }}>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: PENSUM_COLORS.salmon }}>Tilleggsinformasjon</div>
              <h2 className="text-4xl font-bold text-white">Appendix</h2>
              <div className="h-0.5 w-20 mx-auto mt-4" style={{ backgroundColor: PENSUM_COLORS.teal }}></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bruker, radgiver, kundeNavn, kundeSelskap, valgtPensumProfil, horisont, investertBelop, totalKapital, pensumForventetAvkastning, pensumAktivafordeling, pensumAllokering, pensumProdukter, produktRapportMeta, pensumPrognose, markedssynData, eksisterendePortefolje, beregnPensumHistorikk, aggregertPensumEksponering, produktHistorikk, valgteFond, fondVekter, visKonkurrentPortefolje, slaSammenPortefoljer, eksterneFond, allokering, sammenligningAllokering, showComparison, sammenligningProfil, showPessimistic]);

  // Render alle aktive tilleggsmoduler for en gitt posisjon
  const renderTilleggsmodulerVedPosisjon = useCallback((posisjon) => {
    const aktiveModuler = tilleggsmoduler.filter(m => m.aktiv && m.posisjon === posisjon);
    if (aktiveModuler.length === 0) return null;
    return aktiveModuler.map(m => (
      <React.Fragment key={m.id}>
        {renderTilleggsmodulInnhold(m.id)}
      </React.Fragment>
    ));
  }, [tilleggsmoduler, renderTilleggsmodulInnhold]);

  const oppdaterSammenligningProfil = useCallback((nyProfil) => {
    setSammenligningProfil(nyProfil);
    setSammenligningAllokering(beregnAllokering(likvideTotal, peTotal, eiendomTotal, nyProfil));
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
    setAllokering(beregnAllokering(likvideTotal, brukPE, brukEiendom, profil));
    // Synkroniser til porteføljebygger
    if (nyProfil && pensumStandardPortefoljer[profil]) {
      setValgtPensumProfil(profil);
      setPensumAllokering(pensumStandardPortefoljer[profil]);
    }
  }, [likvideTotal, peTotal, eiendomTotal, risikoprofil, effektivVisAlternative, pensumStandardPortefoljer]);

  // Oppdater allokering automatisk når checkbox for alternative endres
  useEffect(() => {
    const brukPE = effektivVisAlternative ? peTotal : 0;
    const brukEiendom = effektivVisAlternative ? eiendomTotal : 0;
    setAllokering(beregnAllokering(likvideTotal, brukPE, brukEiendom, risikoprofil));
  }, [effektivVisAlternative]);

  const kategorierData = useMemo(() => {
    const effektivBelop = investertBelop !== null ? investertBelop : totalKapital;
    const cats = ['aksjer', 'renter', 'privateMarkets', 'eiendom'];
    const names = { aksjer: 'Aksjer', renter: 'Renter', privateMarkets: 'Private Equity', eiendom: 'Eiendom' };
    return cats.map(cat => {
      const items = allokering.filter(a => a.kategori === cat);
      const totalVekt = items.reduce((s, a) => s + a.vekt, 0);
      const vektetAvk = totalVekt > 0 ? items.reduce((s, a) => s + a.vekt * a.avkastning, 0) / totalVekt : 0;
      return { kategori: cat, navn: names[cat], vekt: totalVekt, avkastning: vektetAvk, items, belop: (totalVekt / 100) * effektivBelop };
    }).filter(c => c.items.length > 0);
  }, [allokering, totalKapital, investertBelop]);

  const pieData = useMemo(() => {
    const data = [];
    kategorierData.forEach(cat => {
      if (cat.vekt > 0) {
        if (expandedCategories[cat.kategori] && cat.items.length > 1) {
          cat.items.filter(i => i.vekt > 0).forEach(item => data.push({ name: item.navn, value: item.vekt }));
        } else {
          data.push({ name: cat.navn, value: cat.vekt });
        }
      }
    });
    return data;
  }, [kategorierData, expandedCategories]);

  const sammenligningPieData = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0).map(a => ({ name: a.navn, value: a.vekt })), [sammenligningAllokering]);
  const vektetAvkastning = useMemo(() => allokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [allokering]);
  const sammenligningAvkastning = useMemo(() => sammenligningAllokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [sammenligningAllokering]);
  const totalVekt = useMemo(() => allokering.reduce((s, a) => s + a.vekt, 0), [allokering]);
  const aktiveAktiva = useMemo(() => allokering.filter(a => a.vekt > 0), [allokering]);
  const sammenligningAktiva = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0), [sammenligningAllokering]);

  // Effektivt investert beløp (bruker manuelt beløp hvis satt, ellers totalKapital)
  const effektivtInvestertBelop = investertBelop !== null ? investertBelop : totalKapital;

  // Likvid vs Illikvid beregning (PE og Eiendom er illikvide)
  const likviditetData = useMemo(() => {
    const illikvideKategorier = ['privateMarkets', 'eiendom'];
    const illikvidVekt = allokering.filter(a => illikvideKategorier.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
    const likvidVekt = totalVekt - illikvidVekt;
    return [
      { name: 'Likvid', value: likvidVekt, belop: (likvidVekt / 100) * effektivtInvestertBelop },
      { name: 'Illikvid', value: illikvidVekt, belop: (illikvidVekt / 100) * effektivtInvestertBelop }
    ];
  }, [allokering, totalVekt, effektivtInvestertBelop]);

  // Aktiva-fordeling (aksjer, renter, PE, eiendom)
  const renterAksjerData = useMemo(() => {
    const aksjerVekt = allokering.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0);
    const renterVekt = allokering.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0);
    const peVekt = allokering.filter(a => a.kategori === 'privateMarkets').reduce((s, a) => s + a.vekt, 0);
    const eiendomVekt = allokering.filter(a => a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0);
    return [
      { name: 'Aksjer', value: aksjerVekt, color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: renterVekt, color: PENSUM_COLORS.salmon },
      { name: 'Private Equity', value: peVekt, color: PENSUM_COLORS.teal },
      { name: 'Eiendom', value: eiendomVekt, color: PENSUM_COLORS.gold }
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
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i, kontantstrom: i === 0 ? 0 : nettoKontantstrom };
      
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
            // Apply all rebalansering rules
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
            const nyVerdi = (prevValue - salgTotal + kjopTotal + (originalAsset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
            row[asset.navn] = Math.max(0, nyVerdi);
          } else {
            const prev = prevRow[asset.navn] || 0;
            row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
          }
        }
      });
      row.total = aktiveAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      row.allokeringSnapshot = gjeldendAllokering.map(a => ({ navn: a.navn, vekt: row.total > 0 ? (row[a.navn] / row.total) * 100 : 0 }));

      data.push(row);
    }
    return data;
  }, [aktiveAktiva, effektivtInvestertBelop, nettoKontantstrom, horisont, rebalanseringAktiv, rebalanseringer]);

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

  const kombinertVerdiutvikling = useMemo(() => {
    if (!showComparison) return verdiutvikling;
    return verdiutvikling.map((row, idx) => ({ ...row, total_alt: sammenligningVerdiutvikling[idx]?.total || 0 }));
  }, [verdiutvikling, sammenligningVerdiutvikling, showComparison]);

  const scenarioData = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    // For "forventet" bruker vi verdiutviklingen direkte for konsistens
    // For optimistisk/pessimistisk bruker vi vektet avkastning +/- justering
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      // Forventet = samme som verdiutvikling (sum av individuelle aktivaklasser)
      row.forventet = verdiutvikling[i]?.total || effektivtInvestertBelop;
      // Pessimistisk og optimistisk beregnes med justerte rater
      if (i === 0) {
        row.pessimistisk = effektivtInvestertBelop;
        row.optimistisk = effektivtInvestertBelop;
      } else {
        row.pessimistisk = (data[i-1].pessimistisk + nettoKontantstrom) * (1 + scenarioParams.pessimistisk / 100);
        row.optimistisk = (data[i-1].optimistisk + nettoKontantstrom) * (1 + scenarioParams.optimistisk / 100);
      }
      // Sammenligning (alternativ profil)
      if (showComparison && sammenligningVerdiutvikling[i]) {
        row.sammenligning = sammenligningVerdiutvikling[i].total;
      }
      data.push(row);
    }
    return data;
  }, [effektivtInvestertBelop, nettoKontantstrom, verdiutvikling, scenarioParams, horisont, showComparison, sammenligningVerdiutvikling]);

  const updateAllokeringVekt = useCallback((index, newVekt) => {
    setAllokering(prev => {
      if (!autoRebalanserAllokering) {
        const updated = [...prev];
        updated[index] = { ...updated[index], vekt: Math.max(0, Math.min(100, Number(newVekt) || 0)) };
        return updated;
      }
      return fordelRestVektListe(prev, index, newVekt);
    });
  }, [autoRebalanserAllokering]);

  const updateAllokeringBelop = useCallback((index, newBelop) => {
    setAllokering(prev => {
      const updated = [...prev];
      const newVekt = effektivtInvestertBelop > 0 ? (newBelop / effektivtInvestertBelop) * 100 : 0;
      updated[index] = { ...updated[index], vekt: parseFloat(newVekt.toFixed(1)) };
      return updated;
    });
  }, [effektivtInvestertBelop]);

  const updateAllokeringAvkastning = useCallback((index, avk) => {
    setAllokering(prev => { const u = [...prev]; u[index] = { ...u[index], avkastning: parseFloat(avk) || 0 }; return u; });
  }, []);

  const normaliserAllokeringTil100 = useCallback(() => {
    setAllokering((prev) => skalerVekterTilHundreListe(prev));
  }, []);

  const toggleCategory = (cat) => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }));
  const toggleKundeKategori = (cat) => setExpandedKundeKategorier(p => ({ ...p, [cat]: !p[cat] }));

  const generateReportHTML = () => {
    const sluttverdi = verdiutvikling[verdiutvikling.length - 1]?.total || 0;
    const forventetSluttverdi = scenarioData[scenarioData.length - 1]?.forventet || 0;
    const optimistiskSluttverdi = scenarioData[scenarioData.length - 1]?.optimistisk || 0;

    const alleProduktHTML = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    const produktFargerHTML = [PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green, PENSUM_COLORS.midBlue, PENSUM_COLORS.gray];
    const produktNavnRapport = {
      'global-core-active': 'Global Core Active', 'global-edge': 'Global Edge', 'basis': 'Basis',
      'global-hoyrente': 'Global Høyrente', 'nordisk-hoyrente': 'Nordisk Høyrente',
      'norge-a': 'Norge A', 'energy-a': 'Global Energy A', 'banking-d': 'Nordic Banking', 'financial-d': 'Financial Opp.'
    };
    const start1y = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1);
    const start3y = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1);
    const start5y = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1);

    // Vektet yield
    let yieldSumHTML = 0, yieldTotalHTML = 0;
    pensumAllokering.forEach(a => {
      const p = alleProduktHTML.find(pp => pp.id === a.id);
      const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
      if (erGyldigTall(y) && a.vekt > 0) { yieldSumHTML += y * a.vekt; yieldTotalHTML += a.vekt; }
    });
    const vektetYieldHTML = yieldTotalHTML > 0 ? yieldSumHTML / yieldTotalHTML : 0;

    const aksjeAndel = pensumAktivafordeling.find(a => a.name === 'Aksjer')?.value || 0;
    const renteAndel = pensumAktivafordeling.find(a => a.name === 'Renter')?.value || 0;

    // Allokering table — basert på Pensum-produkter (pensumAktivafordeling)
    const rapportAktivaHTML = pensumAktivafordeling.filter(a => a.value > 0);
    const rapportTotalVektHTML = rapportAktivaHTML.reduce((s, a) => s + a.value, 0) || 1;
    const allokeringRows = rapportAktivaHTML.map(a => {
      const normVekt = (a.value / rapportTotalVektHTML) * 100;
      return '<tr><td style="padding:10px;border-bottom:1px solid #E2E8F0;font-size:12px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;background:' + (a.color || '#888') + '"></span>' + a.name + '</td><td style="padding:10px;border-bottom:1px solid #E2E8F0;text-align:center;font-size:12px">' + normVekt.toFixed(1) + '%</td><td style="padding:10px;border-bottom:1px solid #E2E8F0;text-align:right;font-size:12px">' + formatCurrency((normVekt/100)*effektivtInvestertBelop) + '</td></tr>';
    }).join('');

    // SVG pie chart
    let pieSlices = '', cumulative = 0;
    const pieColors = rapportAktivaHTML.map(a => a.color || '#888');
    rapportAktivaHTML.forEach((a, i) => {
      const pct = (a.value / rapportTotalVektHTML);
      const startAngle = cumulative * 2 * Math.PI - Math.PI/2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI/2;
      const largeArc = pct > 0.5 ? 1 : 0;
      const x1 = 80 + 60 * Math.cos(startAngle), y1 = 80 + 60 * Math.sin(startAngle);
      const x2 = 80 + 60 * Math.cos(endAngle), y2 = 80 + 60 * Math.sin(endAngle);
      if (pct > 0.001) pieSlices += '<path d="M80,80 L' + x1 + ',' + y1 + ' A60,60 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + ' Z" fill="' + pieColors[i] + '"/>';
    });
    const pieSvg = '<svg width="160" height="160" viewBox="0 0 160 160">' + pieSlices + '<circle cx="80" cy="80" r="35" fill="white"/></svg>';
    const legend = rapportAktivaHTML.map(a => {
      const normVekt = (a.value / rapportTotalVektHTML) * 100;
      return '<div style="display:flex;align-items:center;gap:6px;font-size:10px;margin:3px 0"><span style="width:8px;height:8px;border-radius:50%;background:' + (a.color || '#888') + '"></span>' + a.name + ' (' + normVekt.toFixed(1) + '%)</div>';
    }).join('');

    // Porteføljesammensetning
    const portefoljeRows = pensumAllokering.filter(a => a.vekt > 0).sort((a,b) => b.vekt - a.vekt).map((a, idx) => {
      const produkt = alleProduktHTML.find(p => p.id === a.id);
      const fAvk = produkt?.forventetAvkastning ?? produktRapportMeta?.[a.id]?.expectedReturn;
      const fYield = produkt?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
      const typeLbl = produkt?.aktivatype === 'aksje' ? 'Aksje' : produkt?.aktivatype === 'rente' ? 'Rente' : produkt?.aktivatype === 'blandet' ? 'Blandet' : 'Alt.';
      const typeCol = produkt?.aktivatype === 'aksje' ? '#DBEAFE;color:#1D4ED8' : produkt?.aktivatype === 'rente' ? '#FED7AA;color:#C2410C' : '#F3F4F6;color:#4B5563';
      return '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#F8FAFC') + '"><td style="padding:8px;font-size:12px;font-weight:500"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:' + produktFargerHTML[idx % produktFargerHTML.length] + '"></span>' + (produktNavnRapport[a.id] || a.navn) + '</td><td style="padding:8px;text-align:center;font-size:12px;font-weight:600">' + a.vekt.toFixed(1) + '%</td><td style="padding:8px;text-align:center"><span style="font-size:9px;padding:2px 8px;border-radius:10px;background:' + typeCol + '">' + typeLbl + '</span></td><td style="padding:8px;text-align:right;font-size:12px;color:' + PENSUM_COLORS.teal + ';font-weight:500">' + (erGyldigTall(fAvk) ? fAvk.toFixed(1) + '%' : '—') + '</td><td style="padding:8px;text-align:right;font-size:12px;color:' + PENSUM_COLORS.teal + ';font-weight:500">' + (erGyldigTall(fYield) ? fYield.toFixed(1) + '%' : '—') + '</td></tr>';
    }).join('');

    // Historisk avkastning tabell
    const histRows = pensumAllokering.filter(a => a.vekt > 0 && produktHistorikk[a.id]).sort((a,b) => b.vekt - a.vekt).map((a, idx) => {
      const s1 = beregnProduktStatistikk(produktHistorikk[a.id], start1y);
      const s3 = beregnProduktStatistikk(produktHistorikk[a.id], start3y);
      const s5 = beregnProduktStatistikk(produktHistorikk[a.id], start5y);
      const fmtA = (v) => erGyldigTall(v) ? '<span style="color:' + (v >= 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon) + ';font-weight:600">' + (v >= 0 ? '+' : '') + v.toFixed(1) + '%</span>' : '—';
      const sharpeBg = s5 ? (s5.sharpe >= 1 ? '#E8F0F0;color:' + PENSUM_COLORS.teal : s5.sharpe >= 0.5 ? '#FDF6F2;color:' + PENSUM_COLORS.gold : '#FDF6F2;color:' + PENSUM_COLORS.salmon) : '#F3F4F6;color:#9CA3AF';
      return '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#F8FAFC') + '"><td style="padding:7px 8px;font-size:11px;font-weight:500">' + (produktNavnRapport[a.id] || a.navn) + '</td><td style="padding:7px 4px;text-align:center;font-size:11px;color:#6B7280">' + a.vekt.toFixed(1) + '%</td><td style="padding:7px 4px;text-align:right;font-size:11px;border-left:1px solid #E5E7EB">' + fmtA(s1?.totalAvkastning) + '</td><td style="padding:7px 4px;text-align:right;font-size:11px">' + fmtA(s3?.aarligAvkastning) + '</td><td style="padding:7px 4px;text-align:right;font-size:11px">' + fmtA(s5?.aarligAvkastning) + '</td><td style="padding:7px 4px;text-align:right;font-size:11px;border-left:1px solid #E5E7EB;color:#4B5563">' + (s5 ? s5.standardavvik.toFixed(1) + '%' : '—') + '</td><td style="padding:7px 4px;text-align:right;font-size:11px"><span style="padding:1px 5px;border-radius:3px;font-weight:600;font-size:10px;background:' + sharpeBg + '">' + (s5 ? s5.sharpe.toFixed(2) : '—') + '</span></td><td style="padding:7px 4px;text-align:right;font-size:11px;color:' + PENSUM_COLORS.salmon + ';font-weight:500">' + (s5 ? s5.maxDrawdown.toFixed(1) + '%' : '—') + '</td></tr>';
    }).join('');

    // Historisk porteføljeavkastning
    const histYears = [
      { aar: '2026 YTD', key: 'aar2026' },
      { aar: '2025', key: 'aar2025' },
      { aar: '2024', key: 'aar2024' },
      { aar: '2023', key: 'aar2023' },
      { aar: '2022', key: 'aar2022' }
    ];
    const histPortCards = histYears.map(({ aar, key }) => {
      const v = beregnPensumHistorikk[key];
      const col = erGyldigTall(v) ? (v >= 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon) : '#9CA3AF';
      const txt = erGyldigTall(v) ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—';
      return '<div style="background:white;border-radius:8px;padding:12px 8px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.05)"><div style="font-size:9px;color:#6B7280;margin-bottom:4px;font-weight:500">' + aar + '</div><div style="font-size:18px;font-weight:700;color:' + col + '">' + txt + '</div></div>';
    }).join('');

    // Stacked bar chart
    const maxVal = Math.max(...verdiutvikling.map(r => r.total));
    const barWidth = Math.min(50, 540 / verdiutvikling.length - 6);
    const chartWidth = verdiutvikling.length * (barWidth + 6) + 100;
    let stepSize, yAxisMax;
    if (maxVal < 1000) { stepSize = maxVal <= 200 ? 50 : 200; yAxisMax = Math.ceil(maxVal / stepSize) * stepSize; }
    else { const mag = Math.pow(10, Math.floor(Math.log10(maxVal))); const norm = maxVal / mag; stepSize = norm <= 2 ? mag * 0.5 : norm <= 5 ? mag : mag * 2; while (maxVal / stepSize > 6) stepSize *= 2; while (maxVal / stepSize < 3) stepSize /= 2; yAxisMax = Math.ceil(maxVal / stepSize) * stepSize; }
    const formatYLabel = (v) => { if (v === 0) return '0'; if (v >= 1e9) return 'kr ' + (v/1e9).toFixed(v%1e9===0?0:1) + ' mrd'; if (v >= 1e6) return 'kr ' + (v/1e6).toFixed(0) + ' mill'; if (v >= 1e3) return 'kr ' + (v/1e3).toFixed(0) + ' k'; return 'kr ' + v.toFixed(0); };
    let yAxis = '', bars = '';
    for (let v = 0; v <= yAxisMax; v += stepSize) { const y = 190 - (v/yAxisMax)*180; yAxis += '<text x="75" y="' + (y+4) + '" text-anchor="end" font-size="9" fill="#64748B">' + formatYLabel(v) + '</text><line x1="78" y1="' + y + '" x2="' + (chartWidth-10) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3"/>'; }
    verdiutvikling.forEach((row, i) => { const x = 85+i*(barWidth+6); let yOff = 0; aktiveAktiva.forEach(asset => { const val = row[asset.navn]||0; const bh = (val/yAxisMax)*180; bars += '<rect x="'+x+'" y="'+(190-yOff-bh)+'" width="'+barWidth+'" height="'+bh+'" fill="'+(ASSET_COLORS[asset.navn]||'#888')+'"/>'; yOff += bh; }); if (verdiutvikling.length<=11||i%2===0) bars += '<text x="'+(x+barWidth/2)+'" y="205" text-anchor="middle" font-size="10" fill="#64748B">' + row.year + '</text>'; });
    const barLegend = aktiveAktiva.map(a => '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:10px"><span style="width:10px;height:10px;border-radius:2px;background:' + (ASSET_COLORS[a.navn]||'#888') + '"></span>' + a.navn + '</span>').join('');
    const barSvg = '<svg width="100%" height="220" viewBox="0 0 ' + chartWidth + ' 220" preserveAspectRatio="xMidYMid meet">' + yAxis + bars + '</svg>';

    // Detail table
    const verdiTableHeader = '<tr style="background:#F8FAFC"><th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:600">År</th>' + aktiveAktiva.map(a => '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">' + a.navn + '</th>').join('') + '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">Total</th></tr>';
    const verdiTableRows = verdiutvikling.map((row, idx) => '<tr style="background:' + (idx%2===0?'#fff':'#F8FAFC') + '"><td style="padding:6px;font-weight:500;font-size:11px">' + row.year + '</td>' + aktiveAktiva.map(a => '<td style="padding:6px;text-align:right;font-size:10px;color:#64748B">' + formatCurrency(row[a.navn]||0) + '</td>').join('') + '<td style="padding:6px;text-align:right;font-size:11px;font-weight:600">' + formatCurrency(row.total) + '</td></tr>').join('');

    const css = '*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;color:#1B3A5F;line-height:1.5;background:#fff}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:12mm}}.page{max-width:800px;margin:0 auto}.header{background:#fff;padding:25px 40px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between}.header-right{text-align:right}.header-right h1{font-size:18px;color:#1B3A5F;margin-bottom:2px}.header-right p{color:#64748B;font-size:12px}.content{padding:25px 40px}.info{display:flex;flex-wrap:wrap;gap:6px 30px;margin-bottom:20px;font-size:13px}.info div{flex:1 1 45%}.info span{color:#64748B}.info strong{color:#1B3A5F}.section{margin-bottom:22px}.section h2{font-size:14px;font-weight:700;color:#1B3A5F;border-bottom:2px solid #1B3A5F;padding-bottom:5px;margin-bottom:12px}.kpi-stripe{background:#0D2240;border-radius:10px;padding:18px 20px;margin-bottom:22px;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;text-align:center}.kpi-label{font-size:9px;color:#93C5FD;text-transform:uppercase;letter-spacing:0.5px}.kpi-value{font-size:15px;font-weight:700;color:white;margin-top:3px}.kpi-value.green{color:#86EFAC}.kpi-value.teal{color:#5EEAD4}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#F8FAFC;padding:8px;text-align:left;font-weight:600;font-size:11px}td{padding:8px}.alloc-grid{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start}.pie-section{display:flex;flex-direction:column;align-items:center}.scenarios{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.box{padding:16px;border-radius:10px;text-align:center}.box-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}.box-value{font-size:18px;font-weight:700}.box-sub{font-size:9px;margin-top:3px}.chart-section{margin-top:8px;padding:12px;background:#FAFAFA;border-radius:8px}.chart-legend{text-align:center;margin-bottom:8px;padding:6px;background:#fff;border-radius:6px}.hist-port{background:#F8FAFC;border:2px solid #0D2240;border-radius:10px;padding:16px;margin-bottom:22px}.hist-port h3{font-size:12px;font-weight:700;color:#0D2240;margin-bottom:10px}.hist-port-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.disclaimer{font-size:8px;color:#64748B;background:#F8FAFC;padding:12px;border-radius:6px;margin-top:20px;line-height:1.6}.footer{background:#F8FAFC;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#64748B;margin-top:12px}.footer-logo{height:40px}.detail-table{font-size:11px;margin-top:8px}';

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Investeringsforslag - ' + (kundeNavn || 'Kunde') + '</title><style>' + css + '</style></head><body><div class="page"><div class="header"><img src="' + PENSUM_LOGO + '" alt="Pensum" style="height:70px"><div class="header-right"><h1>Investeringsforslag</h1><p>' + formatDateEuro(dato) + '</p></div></div><div class="content"><div class="info"><div><span>Kunde:</span> <strong>' + (kundeNavn || '—') + '</strong></div><div><span>Rådgiver:</span> <strong>' + (radgiver || '—') + '</strong></div><div><span>Risikoprofil:</span> <strong>' + valgtPensumProfil + '</strong></div><div><span>Horisont:</span> <strong>' + horisont + ' år</strong></div></div>' +

    '<div class="kpi-stripe"><div><div class="kpi-label">Investert beløp</div><div class="kpi-value">' + formatCurrency(totalKapital) + '</div></div><div><div class="kpi-label">Forv. avkastning</div><div class="kpi-value green">' + formatPercent(pensumForventetAvkastning) + '</div></div><div><div class="kpi-label">Forv. yield</div><div class="kpi-value teal">' + (erGyldigTall(vektetYieldHTML) ? vektetYieldHTML.toFixed(1) + '%' : '—') + '</div></div><div><div class="kpi-label">Aksje / Rente</div><div class="kpi-value">' + aksjeAndel.toFixed(0) + '% / ' + renteAndel.toFixed(0) + '%</div></div><div><div class="kpi-label">Likviditet</div><div class="kpi-value">' + pensumLikviditet.likvid.toFixed(0) + '% likvid</div></div><div><div class="kpi-label">Sluttverdi</div><div class="kpi-value green">' + formatCurrency(pensumPrognose[pensumPrognose.length-1]?.verdi || 0) + '</div></div></div>' +

    '<div class="section"><h2>Anbefalt aktivaallokering</h2><div class="alloc-grid"><table><thead><tr><th>Aktivaklasse</th><th style="text-align:center">Andel</th><th style="text-align:right">Beløp</th></tr></thead><tbody>' + allokeringRows + '</tbody></table><div class="pie-section">' + pieSvg + '<div style="margin-top:8px">' + legend + '</div></div></div></div>' +

    '<div class="section"><h2>Pensum Porteføljesammensetning</h2><table><thead><tr style="background:#F8FAFC"><th style="padding:8px">Produkt</th><th style="padding:8px;text-align:center">Vekt</th><th style="padding:8px;text-align:center">Type</th><th style="padding:8px;text-align:right">Forv. avk.</th><th style="padding:8px;text-align:right">Yield</th></tr></thead><tbody>' + portefoljeRows + '</tbody></table></div>' +

    '<div class="section"><h2>Historisk avkastning</h2><table><thead><tr style="background:#0D2240"><th style="padding:7px 8px;color:white;font-size:10px;text-align:left">Produkt</th><th style="padding:7px 4px;color:white;font-size:10px;text-align:center">Vekt</th><th style="padding:7px 4px;color:#93C5FD;font-size:10px;text-align:right;border-left:1px solid rgba(255,255,255,0.2)">1 år</th><th style="padding:7px 4px;color:#93C5FD;font-size:10px;text-align:right">3 år p.a.</th><th style="padding:7px 4px;color:#93C5FD;font-size:10px;text-align:right">5 år p.a.</th><th style="padding:7px 4px;color:white;font-size:10px;text-align:right;border-left:1px solid rgba(255,255,255,0.2)">Volatilitet</th><th style="padding:7px 4px;color:white;font-size:10px;text-align:right">Sharpe</th><th style="padding:7px 4px;color:white;font-size:10px;text-align:right">Maks DD</th></tr></thead><tbody>' + histRows + '</tbody></table><p style="font-size:8px;color:#9CA3AF;margin-top:6px">Avkastning beregnet fra månedlige indeksverdier per ' + RAPPORT_DATO + '. Sharpe (risikofri rente 3%). Volatilitet og maks drawdown basert på 5-årsperioden.</p></div>' +

    '<div class="hist-port"><h3>Pensum-forslagets historiske avkastning (vektet)</h3><div class="hist-port-grid">' + histPortCards + '</div></div>' +

    '<div class="section"><h2>Scenarioanalyse — ' + horisont + ' års horisont</h2><div class="scenarios"><div class="box" style="background:' + PENSUM_COLORS.darkBlue + ';border:2px solid ' + PENSUM_COLORS.darkBlue + '"><div class="box-label" style="color:' + PENSUM_COLORS.lightBlue + '">Forventet</div><div class="box-value" style="color:white">' + formatCurrency(forventetSluttverdi) + '</div><div class="box-sub" style="color:' + PENSUM_COLORS.lightBlue + '">CAGR ' + formatPercent(vektetAvkastning) + '</div></div><div class="box" style="background:#E8F0F0;border:1px solid #B8D4D4"><div class="box-label" style="color:' + PENSUM_COLORS.teal + '">Optimistisk</div><div class="box-value" style="color:' + PENSUM_COLORS.teal + '">' + formatCurrency(optimistiskSluttverdi) + '</div><div class="box-sub" style="color:' + PENSUM_COLORS.teal + '">CAGR ' + formatPercent(scenarioParams.optimistisk) + '</div></div><div class="box" style="background:#F8FAFC;border:1px solid #E2E8F0"><div class="box-label" style="color:#6B7280">Sluttverdi</div><div class="box-value" style="color:' + PENSUM_COLORS.darkBlue + '">' + formatCurrency(sluttverdi) + '</div><div class="box-sub" style="color:#6B7280">Aktivaallokering</div></div></div></div>' +

    '<div class="section"><h2>Forventet verdiutvikling per aktivaklasse</h2><div class="chart-section"><div class="chart-legend">' + barLegend + '</div>' + barSvg + '</div></div>' +

    '<div class="section"><h2>Detaljert verdiutvikling</h2><table class="detail-table"><thead>' + verdiTableHeader + '</thead><tbody>' + verdiTableRows + '</tbody></table></div>' +

    // === Avkastning- og risikografer (SVG) ===
    (() => {
      const produkterMedHist = pensumAllokering.filter(a => a.vekt > 0 && produktHistorikk[a.id]).sort((a,b) => b.vekt - a.vekt);
      if (produkterMedHist.length === 0) return '';

      // 1/3/5-års avkastning horisontale søyler
      const barData = produkterMedHist.map(a => {
        const s1 = beregnProduktStatistikk(produktHistorikk[a.id], start1y);
        const s3 = beregnProduktStatistikk(produktHistorikk[a.id], start3y);
        const s5 = beregnProduktStatistikk(produktHistorikk[a.id], start5y);
        return { id: a.id, navn: produktNavnRapport[a.id] || a.navn, s1: s1?.totalAvkastning, s3: s3?.aarligAvkastning, s5: s5?.aarligAvkastning, dd: s5?.maxDrawdown };
      });

      const allVals = barData.flatMap(d => [d.s1, d.s3, d.s5].filter(v => erGyldigTall(v)));
      const maxAbs = Math.max(Math.abs(Math.min(...allVals, 0)), Math.max(...allVals, 1));
      const chartW = 700, rowH = 28, labelW = 140, barAreaW = chartW - labelW - 60;
      const chartH = barData.length * rowH * 3 + 60;
      const periods = [
        { key: 's1', label: '1 år', color: PENSUM_COLORS.lightBlue },
        { key: 's3', label: '3 år p.a.', color: PENSUM_COLORS.darkBlue },
        { key: 's5', label: '5 år p.a.', color: PENSUM_COLORS.teal },
      ];
      let returnSvg = '<svg width="100%" viewBox="0 0 ' + chartW + ' ' + chartH + '" style="font-family:sans-serif">';
      // Legend
      returnSvg += periods.map((p, i) => '<rect x="' + (labelW + i * 120) + '" y="6" width="12" height="12" rx="2" fill="' + p.color + '"/><text x="' + (labelW + i * 120 + 16) + '" y="16" font-size="10" fill="#4B5563">' + p.label + '</text>').join('');
      // Zero line
      const zeroX = labelW + (barAreaW / 2);
      returnSvg += '<line x1="' + zeroX + '" y1="28" x2="' + zeroX + '" y2="' + chartH + '" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3,3"/>';

      barData.forEach((prod, pi) => {
        const groupY = 32 + pi * rowH * 3;
        returnSvg += '<text x="' + (labelW - 6) + '" y="' + (groupY + rowH * 1.5) + '" text-anchor="end" font-size="10" font-weight="600" fill="#1B3A5F">' + prod.navn + '</text>';
        periods.forEach((period, ti) => {
          const val = prod[period.key];
          const y = groupY + ti * rowH;
          if (erGyldigTall(val)) {
            const barW = Math.abs(val / maxAbs) * (barAreaW / 2);
            const bx = val >= 0 ? zeroX : zeroX - barW;
            returnSvg += '<rect x="' + bx + '" y="' + (y + 4) + '" width="' + barW + '" height="' + (rowH - 8) + '" rx="3" fill="' + period.color + '" opacity="0.85"/>';
            const txtX = val >= 0 ? bx + barW + 4 : bx - 4;
            const anchor = val >= 0 ? 'start' : 'end';
            returnSvg += '<text x="' + txtX + '" y="' + (y + rowH / 2 + 3) + '" text-anchor="' + anchor + '" font-size="9" font-weight="600" fill="' + (val >= 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon) + '">' + (val >= 0 ? '+' : '') + val.toFixed(1) + '%</text>';
          } else {
            returnSvg += '<text x="' + (zeroX + 6) + '" y="' + (y + rowH / 2 + 3) + '" font-size="9" fill="#9CA3AF">—</text>';
          }
        });
        if (pi < barData.length - 1) returnSvg += '<line x1="' + labelW + '" y1="' + (groupY + rowH * 3 - 2) + '" x2="' + (chartW - 10) + '" y2="' + (groupY + rowH * 3 - 2) + '" stroke="#E2E8F0" stroke-width="0.5"/>';
      });
      returnSvg += '</svg>';

      // Max Drawdown diagram
      const ddVals = barData.filter(d => erGyldigTall(d.dd));
      let ddSvg = '';
      if (ddVals.length > 0) {
        const ddH = ddVals.length * 36 + 30;
        const ddMaxAbs = Math.max(...ddVals.map(d => Math.abs(d.dd)), 1);
        ddSvg = '<svg width="100%" viewBox="0 0 ' + chartW + ' ' + ddH + '" style="font-family:sans-serif">';
        ddSvg += '<text x="' + labelW + '" y="16" font-size="10" fill="#4B5563" font-weight="500">Maks drawdown (5 år)</text>';
        ddVals.forEach((d, i) => {
          const y = 26 + i * 36;
          const barW = (Math.abs(d.dd) / ddMaxAbs) * (barAreaW * 0.6);
          ddSvg += '<text x="' + (labelW - 6) + '" y="' + (y + 16) + '" text-anchor="end" font-size="10" fill="#1B3A5F">' + d.navn + '</text>';
          ddSvg += '<rect x="' + labelW + '" y="' + (y + 4) + '" width="' + barW + '" height="22" rx="3" fill="' + PENSUM_COLORS.salmon + '" opacity="0.7"/>';
          ddSvg += '<text x="' + (labelW + barW + 6) + '" y="' + (y + 18) + '" font-size="10" font-weight="600" fill="' + PENSUM_COLORS.salmon + '">' + d.dd.toFixed(1) + '%</text>';
        });
        ddSvg += '</svg>';
      }

      return '<div class="section" style="page-break-before:always"><h2>Avkastning og risiko per produkt</h2>' +
        '<div style="background:#FAFAFA;border-radius:8px;padding:16px;margin-bottom:12px">' + returnSvg + '</div>' +
        (ddSvg ? '<div style="background:#FAFAFA;border-radius:8px;padding:16px">' + ddSvg + '</div>' : '') +
        '</div>';
    })() +

    // === Produktark (kundeark) per valgt mandat ===
    (() => {
      const produkterForArk = pensumAllokering.filter(a => a.vekt > 0).sort((a,b) => b.vekt - a.vekt);
      if (produkterForArk.length === 0) return '';

      const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
      const produktArkHTML = produkterForArk.map((allok, arkIdx) => {
        const produkt = alleProdukt.find(p => p.id === allok.id);
        const meta = produktRapportMeta?.[allok.id] || {};
        const eksp = produktEksponering?.[allok.id] || {};
        const hist = produktHistorikk?.[allok.id];
        const s1 = hist ? beregnProduktStatistikk(hist, start1y) : null;
        const s3 = hist ? beregnProduktStatistikk(hist, start3y) : null;
        const s5 = hist ? beregnProduktStatistikk(hist, start5y) : null;
        const fullStats = hist ? beregnProduktStatistikk(hist, new Date(2000, 0, 1)) : null;
        const fAvk = produkt?.forventetAvkastning ?? meta.expectedReturn;
        const fYield = produkt?.forventetYield ?? meta.expectedYield;
        const fargeIdx = arkIdx % produktFargerHTML.length;

        // KPI stripe
        const kpiItems = [
          { label: 'Vekt', value: allok.vekt.toFixed(1) + '%', cls: '' },
          { label: 'Forv. avk.', value: erGyldigTall(fAvk) ? fAvk.toFixed(1) + '%' : '—', cls: 'green' },
          { label: 'Forv. yield', value: erGyldigTall(fYield) ? fYield.toFixed(1) + '%' : '—', cls: 'teal' },
          { label: 'Volatilitet', value: s5 ? s5.standardavvik.toFixed(1) + '%' : '—', cls: '' },
          { label: 'Sharpe', value: s5 ? s5.sharpe.toFixed(2) : '—', cls: s5 && s5.sharpe >= 1 ? 'green' : '' },
          { label: 'Maks DD', value: s5 ? s5.maxDrawdown.toFixed(1) + '%' : '—', cls: '' },
        ];
        const kpiStripe = '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:12px 0">' +
          kpiItems.map(k => '<div style="background:white;border:1px solid #E2E8F0;border-radius:8px;padding:10px 6px;text-align:center"><div style="font-size:8px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">' + k.label + '</div><div style="font-size:15px;font-weight:700;margin-top:3px;color:' + (k.cls === 'green' ? PENSUM_COLORS.teal : k.cls === 'teal' ? PENSUM_COLORS.teal : PENSUM_COLORS.darkBlue) + '">' + k.value + '</div></div>').join('') +
          '</div>';

        // Avkastning tabell
        const fmtRet = (v) => erGyldigTall(v) ? '<span style="color:' + (v >= 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon) + ';font-weight:600">' + (v >= 0 ? '+' : '') + v.toFixed(1) + '%</span>' : '—';
        const retTable = '<table style="width:100%;margin:8px 0"><thead><tr style="background:#F8FAFC"><th style="padding:6px;font-size:10px;text-align:left">Periode</th><th style="padding:6px;font-size:10px;text-align:right">Avkastning</th><th style="padding:6px;font-size:10px;text-align:right">Volatilitet</th><th style="padding:6px;font-size:10px;text-align:right">Sharpe</th></tr></thead><tbody>' +
          '<tr><td style="padding:5px;font-size:10px">1 år</td><td style="padding:5px;font-size:10px;text-align:right">' + fmtRet(s1?.totalAvkastning) + '</td><td style="padding:5px;font-size:10px;text-align:right;color:#4B5563">' + (s1 ? s1.standardavvik.toFixed(1) + '%' : '—') + '</td><td style="padding:5px;font-size:10px;text-align:right">' + (s1 ? s1.sharpe.toFixed(2) : '—') + '</td></tr>' +
          '<tr style="background:#F8FAFC"><td style="padding:5px;font-size:10px">3 år p.a.</td><td style="padding:5px;font-size:10px;text-align:right">' + fmtRet(s3?.aarligAvkastning) + '</td><td style="padding:5px;font-size:10px;text-align:right;color:#4B5563">' + (s3 ? s3.standardavvik.toFixed(1) + '%' : '—') + '</td><td style="padding:5px;font-size:10px;text-align:right">' + (s3 ? s3.sharpe.toFixed(2) : '—') + '</td></tr>' +
          '<tr><td style="padding:5px;font-size:10px">5 år p.a.</td><td style="padding:5px;font-size:10px;text-align:right">' + fmtRet(s5?.aarligAvkastning) + '</td><td style="padding:5px;font-size:10px;text-align:right;color:#4B5563">' + (s5 ? s5.standardavvik.toFixed(1) + '%' : '—') + '</td><td style="padding:5px;font-size:10px;text-align:right">' + (s5 ? s5.sharpe.toFixed(2) : '—') + '</td></tr>' +
          '<tr style="background:#F8FAFC"><td style="padding:5px;font-size:10px">Siden oppstart</td><td style="padding:5px;font-size:10px;text-align:right">' + fmtRet(fullStats?.avkSidenOppstart) + '</td><td style="padding:5px;font-size:10px;text-align:right;color:#4B5563">' + (fullStats ? fullStats.standardavvik.toFixed(1) + '%' : '—') + '</td><td style="padding:5px;font-size:10px;text-align:right">' + (fullStats ? fullStats.sharpe.toFixed(2) : '—') + '</td></tr>' +
          '</tbody></table>';

        // Eksponering: sektorer + regioner som bar chart
        const renderExpBars = (title, data, color) => {
          if (!Array.isArray(data) || data.length === 0) return '';
          const maxW = Math.max(...data.map(d => d.vekt || 0), 1);
          return '<div style="margin:6px 0"><div style="font-size:10px;font-weight:600;color:' + PENSUM_COLORS.darkBlue + ';margin-bottom:6px">' + title + '</div>' +
            data.slice(0, 8).map(d => {
              const bw = Math.max(2, (d.vekt / maxW) * 100);
              return '<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="width:80px;font-size:9px;text-align:right;color:#4B5563;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (d.navn || '—') + '</span><div style="flex:1;background:#F1F5F9;border-radius:3px;height:14px;overflow:hidden"><div style="height:100%;border-radius:3px;background:' + color + ';width:' + bw + '%"></div></div><span style="font-size:9px;font-weight:600;color:' + PENSUM_COLORS.darkBlue + ';width:35px;text-align:right">' + (d.vekt || 0).toFixed(1) + '%</span></div>';
            }).join('') + '</div>';
        };

        // Underliggende investeringer tabell
        const underlying = Array.isArray(eksp.underliggende) ? eksp.underliggende : [];
        const underlyingTable = underlying.length > 0 ?
          '<div style="margin:8px 0"><div style="font-size:10px;font-weight:600;color:' + PENSUM_COLORS.darkBlue + ';margin-bottom:6px">Underliggende investeringer</div>' +
          '<table style="width:100%"><thead><tr style="background:' + PENSUM_COLORS.darkBlue + '"><th style="padding:5px 8px;font-size:9px;color:white;text-align:left">Investering</th><th style="padding:5px 8px;font-size:9px;color:white;text-align:right">Vekt</th></tr></thead><tbody>' +
          underlying.slice(0, 10).map((u, i) => '<tr style="background:' + (i % 2 === 0 ? '#fff' : '#F8FAFC') + '"><td style="padding:4px 8px;font-size:9px">' + (u.navn || '—') + '</td><td style="padding:4px 8px;font-size:9px;text-align:right;font-weight:600;color:' + PENSUM_COLORS.darkBlue + '">' + (u.vekt || 0).toFixed(1) + '%</td></tr>').join('') +
          '</tbody></table></div>' : '';

        // Historical return bars (mini SVG)
        const yearReturns = [
          { label: '2026 YTD', val: produkt?.aar2026 },
          { label: '2025', val: produkt?.aar2025 },
          { label: '2024', val: produkt?.aar2024 },
          { label: '2023', val: produkt?.aar2023 },
          { label: '2022', val: produkt?.aar2022 },
        ].filter(y => erGyldigTall(y.val));
        let yearBarSvg = '';
        if (yearReturns.length > 0) {
          const yrMax = Math.max(...yearReturns.map(y => Math.abs(y.val)), 1);
          const yrH = yearReturns.length * 28 + 10;
          yearBarSvg = '<div style="margin:8px 0"><div style="font-size:10px;font-weight:600;color:' + PENSUM_COLORS.darkBlue + ';margin-bottom:4px">Kalenderårsavkastning</div>';
          yearBarSvg += '<svg width="100%" viewBox="0 0 350 ' + yrH + '" style="font-family:sans-serif">';
          const yrZero = 80 + (350 - 80 - 40) / 2;
          yearBarSvg += '<line x1="' + yrZero + '" y1="0" x2="' + yrZero + '" y2="' + yrH + '" stroke="#CBD5E1" stroke-width="0.5" stroke-dasharray="2,2"/>';
          yearReturns.forEach((yr, i) => {
            const y = 4 + i * 28;
            const barW = (Math.abs(yr.val) / yrMax) * ((350 - 80 - 40) / 2);
            const bx = yr.val >= 0 ? yrZero : yrZero - barW;
            const col = yr.val >= 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon;
            yearBarSvg += '<text x="74" y="' + (y + 15) + '" text-anchor="end" font-size="9" fill="#4B5563">' + yr.label + '</text>';
            yearBarSvg += '<rect x="' + bx + '" y="' + (y + 3) + '" width="' + barW + '" height="18" rx="2" fill="' + col + '" opacity="0.8"/>';
            yearBarSvg += '<text x="' + (yr.val >= 0 ? bx + barW + 4 : bx - 4) + '" y="' + (y + 15) + '" text-anchor="' + (yr.val >= 0 ? 'start' : 'end') + '" font-size="9" font-weight="600" fill="' + col + '">' + (yr.val >= 0 ? '+' : '') + yr.val.toFixed(1) + '%</text>';
          });
          yearBarSvg += '</svg></div>';
        }

        return '<div style="page-break-before:always;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:20px;background:white">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + produktFargerHTML[fargeIdx] + '"></span><h2 style="font-size:16px;font-weight:700;color:' + PENSUM_COLORS.darkBlue + ';margin:0;border:none;padding:0">' + (meta.slideTitle || produkt?.navn || allok.navn) + '</h2></div>' +
          '<div style="font-size:11px;color:#6B7280;margin-bottom:8px">' + (meta.slideSubtitle || '') + '</div>' +
          kpiStripe +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div>' +
              '<div style="font-size:10px;color:#6B7280;margin-bottom:2px"><strong style="color:' + PENSUM_COLORS.darkBlue + '">Rolle:</strong> ' + (meta.role || '—') + '</div>' +
              '<div style="font-size:10px;color:#6B7280;margin-bottom:2px"><strong style="color:' + PENSUM_COLORS.darkBlue + '">Benchmark:</strong> ' + (meta.benchmark || '—') + '</div>' +
              '<div style="font-size:10px;color:#6B7280;margin-bottom:2px"><strong style="color:' + PENSUM_COLORS.darkBlue + '">Pitch:</strong> ' + (meta.pitch || '—') + '</div>' +
              '<div style="font-size:10px;color:#6B7280;margin-bottom:6px"><strong style="color:' + PENSUM_COLORS.darkBlue + '">Risiko:</strong> ' + (meta.riskText || '—') + '</div>' +
              retTable +
              yearBarSvg +
            '</div>' +
            '<div>' +
              renderExpBars('Sektorer', eksp.sektorer, PENSUM_COLORS.lightBlue) +
              renderExpBars('Regioner', eksp.regioner, PENSUM_COLORS.teal) +
              underlyingTable +
            '</div>' +
          '</div>' +
          (eksp.disclaimer ? '<div style="font-size:8px;color:#9CA3AF;margin-top:8px;padding:6px;background:#F8FAFC;border-radius:4px">' + eksp.disclaimer + '</div>' : '') +
        '</div>';
      }).join('');

      return '<div class="section" style="page-break-before:always"><h2>Produktark – valgte Pensum-løsninger</h2>' +
        '<p style="font-size:11px;color:#6B7280;margin-bottom:16px">Detaljert oversikt over hvert valgt produkt med rolle, eksponering, nøkkeltall og historisk utvikling.</p>' +
        produktArkHTML + '</div>';
    })() +

    '<div class="disclaimer"><strong>Viktig informasjon:</strong> Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke. Sharpe Ratio er beregnet med risikofri rente på 3% p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det største kursfallet fra topp til bunn. Avkastningstall er oppdatert til og med ' + RAPPORT_DATO + '.</div></div><div class="footer"><img src="' + PENSUM_LOGO + '" alt="Pensum" class="footer-logo"><div>Frøyas gate 15, 0273 Oslo · +47 23 89 68 44 · pensumgroup.no</div></div></div></body></html>';

    return html;
  };

  const PRODUKT_NAVN_MAP_PDF = {
    'global-core-active': 'Global Core Active',
    'global-edge': 'Global Edge',
    'basis': 'Basis',
    'global-hoyrente': 'Global Høyrente',
    'nordisk-hoyrente': 'Nordisk Høyrente',
    'norge-a': 'Norske Aksjer',
    'energy-a': 'Global Energy',
    'banking-d': 'Nordic Banking Sector',
    'financial-d': 'Financial Opportunities',
  };

  const handleGeneratePresentation = async () => {
    setPdfLoading(true);
    try {
      const valgteProduktIrapport = pdfProduktValg.length > 0 ? pdfProduktValg : Object.keys(PRODUKT_NAVN_MAP_PDF);
      const historikkTilEksport = valgteProduktIrapport.reduce((acc, id) => {
        const hist = produktHistorikk?.[id];
        if (!hist || !Array.isArray(hist.data)) return acc;
        acc[id] = {
          ...hist,
          data: hist.data.slice(-120)
        };
        return acc;
      }, {});

      const produktMap = [...(pensumProdukter?.enkeltfond || []), ...(pensumProdukter?.fondsportefoljer || []), ...(pensumProdukter?.alternative || [])]
        .reduce((acc, p) => { if (p?.id) acc[p.id] = p; return acc; }, {});
      const pensumProdukterTilEksport = valgteProduktIrapport
        .map((id) => produktMap[id])
        .filter(Boolean)
        .map((p) => ({
          id: p.id,
          navn: p.navn,
          aar2026: p.aar2026,
          aar2025: p.aar2025,
          aar2024: p.aar2024,
          aar2023: p.aar2023,
          aar2022: p.aar2022,
          ...(produktRapportMeta?.[p.id] || {})
        }));

      const investerbarKapital = investertBelop !== null ? investertBelop : totalKapital;
      const payload = {
        kundeNavn: kundeNavn || kundeSelskap || 'Investor',
        totalKapital: investerbarKapital,
        totalFormue: totalKapital,
        investerbarKapital,
        risikoProfil: valgtPensumProfil,
        horisont,
        vektetAvkastning,
        allokering: aktiveAktiva.map((a) => ({
          ...a,
          belop: ((a.vekt || 0) / 100) * investerbarKapital
        })),
        produkterIBruk: valgteProduktIrapport,
        pensumProdukter: pensumProdukterTilEksport,
        pensumAllokering: pensumAllokering.filter((p) => valgteProduktIrapport.includes(p.id)),
        produktEksponering: valgteProduktIrapport.reduce((acc, id) => {
          if (produktEksponering?.[id]) acc[id] = produktEksponering[id];
          return acc;
        }, {}),
        produktHistorikk: historikkTilEksport,
        kundeinfo: {
          totalFormue: totalKapital,
          investerbarKapital,
          aksjerKunde,
          aksjefondKunde,
          renterKunde,
          kontanterKunde,
          peFondKunde,
          unoterteAksjerKunde,
          shippingKunde,
          egenEiendomKunde,
          eiendomSyndikatKunde,
          eiendomFondKunde
        },
        malConfig: {
          navn: pdfMalConfig.navn,
          filnavn: erPptTemplateFilnavn(pdfMalConfig.filnavn) ? pdfMalConfig.filnavn : DEFAULT_TEMPLATE_FILENAME,
          filtype: pdfMalConfig.filtype,
          filDataUrl: pdfMalConfig.filDataUrl,
          fasteSider: pdfMalConfig.fasteSider,
          dynamiskeSider: pdfMalConfig.dynamiskeSider,
          dynamiskBeskrivelse: pdfMalConfig.dynamiskBeskrivelse
        },
        eksponering: {
          sektorer: aggregertPensumEksponering?.sektorer || [],
          regioner: aggregertPensumEksponering?.regioner || []
        },
        historiskPortefolje: beregnPensumHistorikk,
        pensumForventetAvkastning,
        pensumLikviditet,
        aktivafordeling: pensumAktivafordeling,
        scenarioParams,
        scenarioData,
        verdiutvikling
      };
      let payloadTilSending = payload;
      let templateDroppetPgaStorrelse = false;
      let serializedPayload = JSON.stringify(payloadTilSending);
      if (serializedPayload.length > MAX_TEMPLATE_PAYLOAD_BYTES) {
        templateDroppetPgaStorrelse = true;
        payloadTilSending = {
          ...payload,
          malConfig: {
            ...payload.malConfig,
            filDataUrl: '',
            filtype: ''
          }
        };
        serializedPayload = JSON.stringify(payloadTilSending);
      }

      const fetchPresentation = async (requestPayload) => {
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
        if (!response.ok) {
          let melding = await response.text();
          try {
            const parsed = JSON.parse(melding);
            if (parsed?.error) melding = parsed.error;
          } catch (_) {
            // behold rå melding
          }
          throw new Error(melding || 'Ukjent feil fra server.');
        }
        return response;
      };

      let res = await fetchPresentation(payloadTilSending);
      let outputFormat = res.headers.get('x-pensum-output-format') || '';
      const templateWarningRaw = res.headers.get('x-pensum-template-warning') || '';
      const templateWarning = templateWarningRaw ? decodeURIComponent(templateWarningRaw) : '';
      const templateReplacements = Number(res.headers.get('x-pensum-template-replacements') || 0);
      const manglerPlaceholders = outputFormat === 'pptx-template' && templateReplacements === 0;

      if (manglerPlaceholders) {
        res = await fetchPresentation({
          ...payloadTilSending,
          skipTemplateMerge: true,
          malConfig: {
            ...payloadTilSending.malConfig,
            filDataUrl: '',
            filtype: ''
          }
        });
        outputFormat = res.headers.get('x-pensum-output-format') || outputFormat;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/i);
      const fallbackName = outputFormat === 'pdf-fallback'
        ? `Pensum_Investeringsforslag_${(kundeNavn || 'Kunde').replace(/\s+/g, '_')}.pdf`
        : `Pensum_Investeringsforslag_${(kundeNavn || 'Kunde').replace(/\s+/g, '_')}.pptx`;
      a.download = match ? match[1] : fallbackName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (outputFormat === 'pdf-fallback') {
        alert('PowerPoint er midlertidig utilgjengelig i miljøet. Du fikk PDF som fallback.');
      } else if (templateDroppetPgaStorrelse) {
        alert('Malfilen var for stor for serverless-request. Presentasjonen ble generert uten template-merge. Komprimer malen (bilder) for å bruke full mal.');
      } else if (manglerPlaceholders) {
        alert('Malen inneholdt ingen gjenkjennbare placeholders for dynamiske felter. Derfor ble presentasjonen automatisk generert med datadrevne sider (6–13) fra verktøyet.');
      } else if (outputFormat === 'pptx-generated' && templateWarning) {
        alert('Template-merge ble hoppet over: ' + templateWarning + ' Presentasjonen ble laget med standardgeneratoren.');
      }

      setPdfModal(false);
    } catch (err) {
      alert('Feil ved generering av presentasjon: ' + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadHTML = () => {
    const html = generateReportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Investeringsprognose_' + (kundeNavn || 'Kunde').replace(/[^a-zA-Z0-9æøåÆØÅ]/g, '_') + '.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateRapportPPTX = async () => {
    setRapportPptxLoading(true);
    setRapportPptxProgress('Laster biblioteker...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const PptxGenJS = (await import('pptxgenjs')).default;

      // Find all rapport sections in the DOM
      const container = document.getElementById('rapport-container');
      if (!container) throw new Error('Rapport-siden er ikke synlig. Gå til Kunderapport-fanen først.');

      const slideElements = container.querySelectorAll('[data-rapport-slide]');
      if (slideElements.length === 0) throw new Error('Fant ingen rapportseksjoner å eksportere.');

      // Group sections into logical slides
      // 'snapshot-charts' is special: each child chart card gets its own slide
      // 'faktaark-*' are dynamically discovered for each product
      const faktaarkElements = container.querySelectorAll('[data-rapport-slide^="faktaark-"]');
      const faktaarkGroups = Array.from(faktaarkElements).map(el => ({
        name: `Faktaark: ${el.dataset.rapportSlide}`,
        selectors: [el.dataset.rapportSlide],
        wide: true,
      }));

      // Bygg tilleggsmodul-grupper for aktive moduler, innsatt på riktig posisjon
      const tilleggsmodulGruppe = (posisjon) => tilleggsmoduler
        .filter(m => m.aktiv && m.posisjon === posisjon)
        .map(m => ({ name: m.label, selectors: [m.id], wide: true }));

      const slideGroups = [
        { name: 'Forside', selectors: ['cover'], cover: true },
        ...tilleggsmodulGruppe('etter-cover'),
        { name: 'Personlig følgebrev', selectors: ['folgebrev'] },
        { name: 'Utgangspunkt og investeringsmandat', selectors: ['utgangspunkt'] },
        ...tilleggsmodulGruppe('etter-utgangspunkt'),
        { name: 'Hvordan porteføljen er bygget', selectors: ['byggesteiner'] },
        ...tilleggsmodulGruppe('etter-byggesteiner'),
        { name: 'Pensum Porteføljesammensetning', selectors: ['allokering', 'kalenderaar'], wide: true },
        ...tilleggsmodulGruppe('etter-allokering'),
        ...tilleggsmodulGruppe('etter-historisk'),
        { name: 'Scenarioanalyse', selectors: ['scenarioanalyse'] },
        { name: 'snapshot-charts-split', selectors: ['snapshot-charts'] },
        ...tilleggsmodulGruppe('etter-snapshot'),
        { name: 'Eksponering', selectors: ['eksponering'], wide: true },
        ...tilleggsmodulGruppe('etter-eksponering'),
        { name: 'Verdiutvikling', selectors: ['verdiutvikling', 'verdi-tabell'], wide: true },
        ...tilleggsmodulGruppe('etter-verdiutvikling'),
        ...faktaarkGroups,
        ...tilleggsmodulGruppe('etter-faktaark'),
        ...tilleggsmodulGruppe('foer-disclaimer'),
        { name: 'Hvordan tar vi oss betalt?', selectors: ['honorarstruktur'] },
        { name: 'Neste steg', selectors: ['neste-steg'], darkBg: true },
        ...tilleggsmodulGruppe('appendix'),
        { name: 'Viktig informasjon', selectors: ['disclaimer'] },
      ];

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
      pptx.author = 'Pensum Asset Management';
      pptx.company = 'Pensum Asset Management';
      pptx.subject = 'Kunderapport';
      pptx.title = `Kunderapport ${kundeNavn || kundeSelskap || 'Investor'}`;

      const SLIDE_W = 13.33;
      const SLIDE_H = 7.5;
      const MARGIN = 0.4;
      const FOOTER_H = 0.32;
      const CONTENT_W = SLIDE_W - 2 * MARGIN;
      const CONTENT_H = SLIDE_H - MARGIN - FOOTER_H - 0.1;

      // Move an element into a wide off-screen container so Recharts re-renders
      // at the target width, then clone and capture it. Moves element back after.
      const captureWithResize = async (element, renderWidth = 1120, opts = {}) => {
        const bgColor = opts.bgColor || '#ffffff';
        const padding = opts.noPadding ? '0' : '28px 36px';
        const hasCharts = element.querySelector('.recharts-responsive-container');

        if (!hasCharts) {
          // No charts — simple clone-and-capture
          return captureElement(element, renderWidth, opts);
        }

        // Move the ORIGINAL element into a wide off-screen container
        // so Recharts' ResizeObserver fires and re-renders at the target width.
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;
        const placeholder = document.createComment('pptx-placeholder');
        parent.insertBefore(placeholder, nextSibling);

        const sizer = document.createElement('div');
        // Use the same inner width as the capture wrapper (renderWidth - padding)
        const innerW = renderWidth - 72; // 36px padding each side
        sizer.style.cssText = `position:fixed;left:-9999px;top:0;width:${innerW}px;z-index:-1;`;
        document.body.appendChild(sizer);
        // Remove overflow:hidden from element so ResponsiveContainer can detect the new width
        const savedOverflow = element.style.overflow;
        element.style.overflow = 'visible';
        element.querySelectorAll('.overflow-hidden').forEach(el => { el.style.overflow = 'visible'; });
        sizer.appendChild(element);

        // Force Recharts ResponsiveContainer to detect new size by toggling display
        const rechartsContainers = element.querySelectorAll('.recharts-responsive-container');
        rechartsContainers.forEach(c => {
          c.style.display = 'none';
          c.offsetHeight; // force reflow
          c.style.display = '';
        });
        // Wait for Recharts to re-render at new width
        await new Promise(r => setTimeout(r, 800));
        // Toggle again for reliability
        rechartsContainers.forEach(c => {
          c.style.display = 'none';
          c.offsetHeight;
          c.style.display = '';
        });
        await new Promise(r => setTimeout(r, 800));

        // Now clone the properly-rendered element
        const imgData = await captureElement(element, renderWidth, opts);

        // Move element back to its original position and restore overflow
        element.style.overflow = savedOverflow;
        element.querySelectorAll('.overflow-hidden').forEach(el => { el.style.overflow = ''; });
        if (placeholder.parentNode) {
          placeholder.parentNode.insertBefore(element, placeholder);
          placeholder.parentNode.removeChild(placeholder);
        } else {
          parent.appendChild(element);
        }
        document.body.removeChild(sizer);

        return imgData;
      };

      const captureElement = async (element, renderWidth = 1120, opts = {}) => {
        const bgColor = opts.bgColor || '#ffffff';
        const padding = opts.noPadding ? '0' : '28px 36px';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `position:absolute;left:-9999px;top:0;width:${renderWidth}px;background:${bgColor};padding:${padding};`;
        const clone = element.cloneNode(true);
        const chartH = opts.chartMinHeight || 280;
        clone.querySelectorAll('.recharts-responsive-container').forEach(rc => {
          rc.style.width = '100%';
          rc.style.minHeight = `${chartH}px`;
          // Force SVG to stretch to full width of container
          const svg = rc.querySelector('svg.recharts-surface');
          if (svg) {
            svg.setAttribute('width', '100%');
            svg.style.width = '100%';
          }
          const rw = rc.querySelector('.recharts-wrapper');
          if (rw) {
            rw.style.width = '100%';
          }
        });
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        await new Promise(r => setTimeout(r, 200));
        try {
          const canvas = await html2canvas(wrapper, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: bgColor,
            logging: false,
            windowWidth: renderWidth,
          });
          return canvas.toDataURL('image/png');
        } finally {
          document.body.removeChild(wrapper);
        }
      };

      // Capture logo as PNG for PPTX (webp may not be supported)
      const logoImgData = await (async () => {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = PENSUM_LOGO; });
          const c = document.createElement('canvas');
          c.width = img.width; c.height = img.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          return c.toDataURL('image/png');
        } catch { return null; }
      })();

      const addSlideFooter = (slide) => {
        // Thin dark navy bar at bottom with company name
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: SLIDE_H - FOOTER_H, w: SLIDE_W, h: FOOTER_H,
          fill: { color: PENSUM_COLORS.darkBlue.replace('#', '') },
        });
        slide.addText('PENSUM ASSET MANAGEMENT', {
          x: MARGIN, y: SLIDE_H - FOOTER_H + 0.02, w: CONTENT_W / 2, h: FOOTER_H - 0.04,
          fontSize: 7, color: '6B8CAA', fontFace: 'Arial',
          align: 'left', valign: 'middle',
          charSpacing: 3,
        });
        // Logo in top-right corner
        if (logoImgData) {
          slide.addImage({
            data: logoImgData,
            x: SLIDE_W - MARGIN / 2 - 1.8,
            y: 0.15,
            w: 1.8,
            h: 0.75,
            sizing: { type: 'contain', w: 1.8, h: 0.75 },
          });
        }
      };

      const addImageSlide = (imgData, imgAspectRaw, opts = {}) => {
        const imgAspect = imgAspectRaw;
        const availH = SLIDE_H - FOOTER_H - 0.1; // max usable height above footer
        const availW = CONTENT_W;
        const slideAspect = availW / availH;
        let imgW, imgH;
        if (imgAspect > slideAspect) {
          imgW = availW;
          imgH = availW / imgAspect;
        } else {
          imgH = availH;
          imgW = availH * imgAspect;
        }
        const imgX = (SLIDE_W - imgW) / 2;
        // Center vertically in available space (above footer) or top-align
        const imgY = opts.centerV
          ? Math.max(0.15, (availH - imgH) / 2)
          : 0.2;
        const slide = pptx.addSlide();
        slide.background = { color: 'FFFFFF' };
        slide.addImage({ data: imgData, x: imgX, y: imgY, w: imgW, h: imgH });
        addSlideFooter(slide);
      };

      for (let gi = 0; gi < slideGroups.length; gi++) {
        const group = slideGroups[gi];
        setRapportPptxProgress(`Genererer side ${gi + 1} av ${slideGroups.length}: ${group.name === 'snapshot-charts-split' ? 'Snapshot-grafer' : group.name}...`);
        if (group.name === 'snapshot-charts-split') {
          // Split: find individual chart cards within snapshot-charts
          const snapSection = container.querySelector('[data-rapport-slide="snapshot-charts"]');
          if (!snapSection) continue;

          // Each .rounded-xl child inside .space-y-6 is an individual chart
          const chartCards = snapSection.querySelectorAll(':scope > div.space-y-6 > div');
          if (chartCards.length === 0) {
            // Fallback: render as one
            const imgData = await captureWithResize(snapSection, 1120);
            const img = new Image();
            await new Promise(r => { img.onload = r; img.src = imgData; });
            addImageSlide(imgData, img.width / img.height);
          } else {
            for (const card of chartCards) {
              // Skip the disclaimer note at the bottom (text-only, no chart)
              if (card.classList.contains('text-xs') && !card.querySelector('svg')) continue;

              // Determine slide title based on chart type
              const chartType = card.getAttribute('data-chart-type');
              let slideTitle = 'Historisk avkastning — benchmark';
              if (chartType === 'drawdown') slideTitle = 'Risiko og nedsidebeskyttelse';

              // Create a temporary wrapper with the title above the card
              const titleEl = document.createElement('div');
              titleEl.innerHTML = `<h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:2px solid ${PENSUM_COLORS.darkBlue};color:${PENSUM_COLORS.darkBlue};">${slideTitle}</h2>`;
              const cardParent = card.parentNode;
              cardParent.insertBefore(titleEl, card);

              // Wrap title + card in a temporary container for capture
              const wrapper = document.createElement('div');
              wrapper.style.cssText = 'width:100%;';
              cardParent.insertBefore(wrapper, titleEl);
              wrapper.appendChild(titleEl);
              wrapper.appendChild(card);
              // Force card to fill width for proper chart rendering
              card.style.width = '100%';
              card.style.maxWidth = 'none';

              const imgData = await captureWithResize(wrapper, 1400, { chartMinHeight: 420 });
              const img = new Image();
              await new Promise(r => { img.onload = r; img.src = imgData; });
              addImageSlide(imgData, img.width / img.height, { centerV: true });

              // Restore: move card back to original parent and remove wrapper/title
              card.style.width = '';
              card.style.maxWidth = '';
              cardParent.insertBefore(card, wrapper);
              wrapper.remove();
            }
          }
          continue;
        }

        // Find matching elements
        const elements = group.selectors
          .map(sel => container.querySelector(`[data-rapport-slide="${sel}"]`))
          .filter(Boolean);
        if (elements.length === 0) continue;

        // Cover slide: full-bleed dark background, no padding
        if (group.cover) {
          const el = elements[0];
          const imgData = await captureElement(el, 1120, { bgColor: PENSUM_COLORS.darkBlue, noPadding: true });
          const img = new Image();
          await new Promise(r => { img.onload = r; img.src = imgData; });
          const slide = pptx.addSlide();
          slide.background = { color: PENSUM_COLORS.darkBlue.replace('#', '') };
          slide.addImage({ data: imgData, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, sizing: { type: 'contain', w: SLIDE_W, h: SLIDE_H } });
          continue;
        }

        // Dark background slides: standard padding, dark bg, with logo
        if (group.darkBg) {
          const el = elements[0];
          const imgData = await captureElement(el, 1120, { bgColor: PENSUM_COLORS.darkBlue });
          const img = new Image();
          await new Promise(r => { img.onload = r; img.src = imgData; });
          const slide = pptx.addSlide();
          slide.background = { color: PENSUM_COLORS.darkBlue.replace('#', '') };
          const imgAspect = img.width / img.height;
          const availH = SLIDE_H - FOOTER_H - 0.1;
          const availW = CONTENT_W;
          const slideAspect = availW / availH;
          let imgW, imgH;
          if (imgAspect > slideAspect) { imgW = availW; imgH = availW / imgAspect; }
          else { imgH = availH; imgW = availH * imgAspect; }
          const imgX = (SLIDE_W - imgW) / 2;
          const imgY = Math.max(0.15, (availH - imgH) / 2);
          slide.addImage({ data: imgData, x: imgX, y: imgY, w: imgW, h: imgH });
          if (logoImgData) {
            slide.addImage({ data: logoImgData, x: SLIDE_W - 0.4 - 1.8, y: 0.15, w: 1.8, h: 0.75, sizing: { type: 'contain', w: 1.8, h: 0.75 } });
          }
          // Dark footer bar
          slide.addShape(pptx.ShapeType.rect, { x: 0, y: SLIDE_H - FOOTER_H, w: SLIDE_W, h: FOOTER_H, fill: { color: '0A1929' } });
          slide.addText('P E N S U M   A S S E T   M A N A G E M E N T', {
            x: MARGIN, y: SLIDE_H - FOOTER_H + 0.02, w: CONTENT_W / 2, h: FOOTER_H - 0.04,
            fontSize: 7, color: '6B8CAA', fontFace: 'Arial',
            align: 'left', valign: 'middle', charSpacing: 3,
          });
          continue;
        }

        // Check if any element has charts that need resizing
        const hasAnyCharts = elements.some(el => el.querySelector('.recharts-responsive-container'));
        const renderWidth = group.wide ? 1400 : 1120;

        if (hasAnyCharts && elements.length === 1) {
          // Single element with charts: use captureWithResize for proper chart sizing
          const imgData = await captureWithResize(elements[0], renderWidth);
          const img = new Image();
          await new Promise(r => { img.onload = r; img.src = imgData; });
          addImageSlide(imgData, img.width / img.height, { centerV: true });
        } else {
          // Multiple elements or no charts: clone-and-capture approach
          // For chart elements, move them individually to resize first
          const restorerMap = new Map();
          if (hasAnyCharts) {
            for (const el of elements) {
              if (el.querySelector('.recharts-responsive-container')) {
                const parent = el.parentNode;
                const nextSibling = el.nextSibling;
                const placeholder = document.createComment('pptx-ph');
                parent.insertBefore(placeholder, nextSibling);
                const sizer = document.createElement('div');
                sizer.style.cssText = `position:fixed;left:-9999px;top:0;width:${renderWidth - 72}px;z-index:-1;`;
                document.body.appendChild(sizer);
                el.style.overflow = 'visible';
                el.querySelectorAll('.overflow-hidden').forEach(c => { c.style.overflow = 'visible'; });
                sizer.appendChild(el);
                restorerMap.set(el, { placeholder, sizer });
              }
            }
            // Force Recharts ResponsiveContainer to detect new size
            for (const [el] of restorerMap) {
              el.querySelectorAll('.recharts-responsive-container').forEach(c => {
                c.style.display = 'none';
                c.offsetHeight;
                c.style.display = '';
              });
            }
            await new Promise(r => setTimeout(r, 800));
            for (const [el] of restorerMap) {
              el.querySelectorAll('.recharts-responsive-container').forEach(c => {
                c.style.display = 'none';
                c.offsetHeight;
                c.style.display = '';
              });
            }
            await new Promise(r => setTimeout(r, 800));
          }

          const wrapper = document.createElement('div');
          wrapper.style.cssText = `position:absolute;left:-9999px;top:0;width:${renderWidth}px;background:#ffffff;padding:28px 36px;`;
          elements.forEach(el => {
            const clone = el.cloneNode(true);
            clone.style.marginBottom = '20px';
            if (group.wide) {
              clone.querySelectorAll('.truncate').forEach(t => {
                t.classList.remove('truncate');
                t.style.overflow = 'visible';
                t.style.textOverflow = 'unset';
                t.style.whiteSpace = 'normal';
              });
            }
            wrapper.appendChild(clone);
          });
          document.body.appendChild(wrapper);
          await new Promise(r => setTimeout(r, 200));

          try {
            const canvas = await html2canvas(wrapper, {
              scale: 2.5,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              windowWidth: renderWidth,
            });
            const imgData = canvas.toDataURL('image/png');
            addImageSlide(imgData, canvas.width / canvas.height, { centerV: true });
          } finally {
            document.body.removeChild(wrapper);
            // Restore moved elements
            for (const [el, { placeholder, sizer }] of restorerMap) {
              el.style.overflow = '';
              el.querySelectorAll('.overflow-hidden').forEach(c => { c.style.overflow = ''; });
              if (placeholder.parentNode) {
                placeholder.parentNode.insertBefore(el, placeholder);
                placeholder.parentNode.removeChild(placeholder);
              }
              document.body.removeChild(sizer);
            }
          }
        }
      }

      // Download
      setRapportPptxProgress('Pakker PowerPoint-fil...');
      const blob = await pptx.write({ outputType: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pensum_Kunderapport_${(kundeNavn || 'Kunde').replace(/\s+/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Feil ved generering av PowerPoint: ' + err.message);
    } finally {
      setRapportPptxLoading(false);
      setRapportPptxProgress('');
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
                            <p className="text-lg font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{erGyldigTall(produktRapportMeta[valgtProduktDetalj.id].expectedReturn) ? `${produktRapportMeta[valgtProduktDetalj.id].expectedReturn}%` : '—'}</p>
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
                              <span className="text-sm font-medium whitespace-nowrap" style={{ color: PENSUM_COLORS.darkBlue }}>{inv.vekt}%</span>
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
                                  <span className="text-xs w-24 truncate">{region.navn}</span>
                                  <span className="text-xs font-medium w-10 text-right">{region.vekt}%</span>
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
                                  <span className="text-xs w-32 truncate">{sektor.navn}</span>
                                  <span className="text-xs font-medium w-10 text-right">{sektor.vekt}%</span>
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
                              <span className="text-xs text-gray-600">{stil.navn}</span>
                              <span className="ml-2 text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{stil.vekt}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Avkastningshistorikk */}
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Historisk avkastning</h4>
                      <div className="flex flex-wrap gap-4">
                        {erGyldigTall(valgtProduktDetalj.aar2024) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2024</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2024 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2024 > 0 ? '+' : ''}{valgtProduktDetalj.aar2024}%</span></div>}
                        {erGyldigTall(valgtProduktDetalj.aar2023) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2023</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2023 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2023 > 0 ? '+' : ''}{valgtProduktDetalj.aar2023}%</span></div>}
                        {erGyldigTall(valgtProduktDetalj.aar2022) && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">2022</span><span className={"text-lg font-bold " + (valgtProduktDetalj.aar2022 >= 0 ? "text-green-600" : "text-red-600")}>{valgtProduktDetalj.aar2022 > 0 ? '+' : ''}{valgtProduktDetalj.aar2022}%</span></div>}
                        {(() => { const nokkeltall = beregnProduktNokkeltall(valgtProduktDetalj); return nokkeltall.aarlig3ar !== null && <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200"><span className="text-xs text-blue-600 block">Årlig 3 år (beregnet)</span><span className={"text-lg font-bold " + (nokkeltall.aarlig3ar >= 0 ? "text-green-600" : "text-red-600")}>{nokkeltall.aarlig3ar > 0 ? '+' : ''}{nokkeltall.aarlig3ar}%</span></div>; })()}
                        {(() => { const nokkeltall = beregnProduktNokkeltall(valgtProduktDetalj); return nokkeltall.risiko3ar !== null && <div className="text-center p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 block">Risiko 3 år (beregnet)</span><span className="text-lg font-bold text-gray-700">{nokkeltall.risiko3ar}%</span></div>; })()}
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
      
      {/* ====== PDF INVESTERINGSFORSLAG MODAL ====== */}
      {pdfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !pdfLoading && !rapportPptxLoading && setPdfModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 rounded-t-2xl" style={{ backgroundColor: '#0D2240' }}>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <div>
                  <h2 className="text-lg font-bold text-white">Generer investeringsforslag</h2>
                  <p className="text-blue-300 text-sm mt-0.5">Velg format og last ned som PowerPoint</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Kundeinfo oppsummering */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                {[
                  ['Kunde', kundeNavn || '—'],
                  ['Investerbar kapital', formatCurrency(investertBelop !== null ? investertBelop : totalKapital)],
                  ['Risikoprofil', risikoprofil],
                  ['Forv. avkastning', vektetAvkastning.toFixed(1) + '% p.a.'],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{lbl}</div>
                    <div className="font-semibold text-sm mt-0.5" style={{ color: '#0D2240' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Valg: Standard vs Utvidet */}
              <div className="space-y-3">
                {/* Standard — rapport-basert */}
                <button
                  onClick={async () => { setActiveTab('rapport'); await new Promise(r => setTimeout(r, 500)); await handleGenerateRapportPPTX(); setPdfModal(false); }}
                  disabled={pdfLoading || rapportPptxLoading}
                  className="w-full text-left rounded-xl border-2 p-4 transition-all hover:border-blue-300 hover:shadow-md group border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PENSUM_COLORS.salmon }}>Standard</span>
                        <h3 className="text-sm font-bold" style={{ color: '#0D2240' }}>Investeringsforslag</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Kompakt presentasjon med forside, mandat, allokering, byggesteiner, historisk avkastning, eksponering, verdiutvikling og produktark.</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                </button>

              </div>

              {(pdfLoading || rapportPptxLoading) && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <svg className="animate-spin w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  <span className="text-sm text-gray-500">Genererer PowerPoint...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setPdfModal(false)} disabled={pdfLoading || rapportPptxLoading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={PENSUM_LOGO} alt="Pensum Asset Management" className="h-20 md:h-24" />
          <div className="flex items-center gap-4">
            {/* Bruker-info */}
            {bruker ? (
              <div className="relative flex items-center gap-2 text-sm">
                <button onClick={() => setVisProfilPanel(!visProfilPanel)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                style={{ color: PENSUM_COLORS.darkBlue }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Logg inn
              </button>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setVisKundeliste(!visKundeliste)} className={"px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border " + (visKundeliste ? "bg-blue-100 border-blue-300 text-blue-700" : "border-gray-200 hover:bg-gray-50")} style={{ color: visKundeliste ? undefined : PENSUM_COLORS.darkBlue }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Mine kunder {lagredeKunder.length > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{lagredeKunder.length}</span>}
              </button>
              <button onClick={() => { setPdfProduktValg([]); setPdfModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: '#D4886B' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Investeringsforslag
              </button>
              <button onClick={lagreKunde} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: lagringsStatus ? PENSUM_COLORS.teal : PENSUM_COLORS.darkBlue }}>
                {lagringsStatus ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                )}
                {lagringsStatus || 'Lagre'}
              </button>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-base font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsprognose</div>
              <div className="text-xs text-gray-500">{formatDateEuro(dato)}</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-1 overflow-x-auto -mb-px">
              {['input', 'losninger', 'allokering', 'scenario', 'rapport'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={"px-5 py-3 font-medium whitespace-nowrap text-sm " + (activeTab === tab ? "text-white border-b-2 border-white" : "text-blue-200 hover:text-white")}>
                  {tab === 'input' ? 'Kundeinformasjon' : tab === 'losninger' ? 'Porteføljebygging' : tab === 'allokering' ? 'Prognoser med indekser' : tab === 'scenario' ? 'Historisk sammenligning' : 'Investeringsforslag'}
                </button>
              ))}
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
      </header>

      {/* Kundeliste panel */}
      {visKundeliste && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <h2 className="text-lg font-semibold text-white">Mine kunder</h2>
              <button onClick={() => setVisKundeliste(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {!radgiver ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <p className="text-gray-500 mb-2">Fyll inn rådgivernavn først</p>
                  <p className="text-sm text-gray-400">Gå til Kundeinformasjon og skriv inn ditt navn</p>
                </div>
              ) : lagredeKunder.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-gray-500">Ingen lagrede kunder for {radgiver}</p>
                  <p className="text-sm text-gray-400 mt-1">Fyll inn kundedata og trykk "Lagre"</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lagredeKunder.map(kunde => (
                    <div key={kunde.id} className={"flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 " + (aktivKundeId === kunde.id ? "border-blue-500 bg-blue-50" : "border-gray-200")} onClick={() => lastKundeData(kunde)}>
                      <div>
                        <div className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{kunde.kundeNavn}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency((kunde.aksjerKunde || 0) + (kunde.aksjefondKunde || 0) + (kunde.renterKunde || 0) + (kunde.kontanterKunde || 0) + (kunde.peFondKunde || 0) + (kunde.unoterteAksjerKunde || 0) + (kunde.shippingKunde || 0) + (kunde.egenEiendomKunde || 0) + (kunde.eiendomSyndikatKunde || 0) + (kunde.eiendomFondKunde || 0))} • {kunde.risikoprofil}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Sist endret: {new Date(kunde.sistEndret).toLocaleDateString('nb-NO')}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); slettKunde(kunde.id); }} className="text-red-500 hover:text-red-700 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
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
      )}

      <main className="max-w-7xl mx-auto px-6 py-6">
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
                      <input type="text" defaultValue={kundeNavn} onBlur={(e) => setKundeNavn(e.target.value)} placeholder="Navn på investor" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Personnavn eller kontaktperson</span>
                    </div>
                    <div>
                      <input type="text" defaultValue={kundeSelskap} onBlur={(e) => setKundeSelskap(e.target.value)} placeholder="Selskap / organisasjon (valgfritt)" className="w-full border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
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
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">{RISK_PROFILES[risikoprofil].aksjer}% aksjer · {RISK_PROFILES[risikoprofil].renter}% renter</p>
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
                    <input type="text" value={investertBelop !== null ? formatNumber(investertBelop) : ''} onChange={(e) => { const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); setInvestertBelop(isNaN(v) ? null : v); }} onFocus={(e) => { if (investertBelop !== null) e.target.value = investertBelop.toString(); }} onBlur={(e) => { const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); setInvestertBelop(isNaN(v) || v === 0 ? null : v); }} placeholder={formatCurrency(totalKapital) + ' (fra kapitaloversikt)'} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 pr-10 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
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
                  <button onClick={() => resetTilAutomatisk()} className="w-full mt-4 py-2.5 px-4 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    Oppdater allokering basert på risikoprofil
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Årlig kontantstrøm</h3></div>
                <div className="p-6">
                  <CurrencyInput label="Årlig innskudd" value={innskudd} onChange={setInnskudd} />
                  <CurrencyInput label="Årlige uttak" value={uttak} onChange={setUttak} />
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Netto kontantstrøm</span>
                      <span className={"text-xl font-bold " + (nettoKontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(nettoKontantstrom)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Eksisterende portefølje ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                <button
                  onClick={() => { setVisEksisterendePortefolje(v => !v); if (!eksterneFond && !eksterneFondLoading) lastEksterneFond(); }}
                  className="w-full px-6 py-4 flex items-center justify-between"
                  style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Kundens eksisterende portefølje</h3>
                    {eksisterendePortefolje.fond.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {eksisterendePortefolje.fond.length} fond · {formatCurrency(eksisterendePortefolje.fond.reduce((s, f) => s + f.belop, 0) + eksisterendePortefolje.aksjer.reduce((s, a) => s + a.belop, 0) + eksisterendePortefolje.kontanter)}
                      </span>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-white transition-transform ${visEksisterendePortefolje ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {visEksisterendePortefolje && (
                  <div className="p-6 space-y-5">
                    <p className="text-xs text-gray-500">Registrer kundens nåværende portefølje fra annen forvalter for å lage en sammenligning med Pensum-forslaget.</p>

                    {/* Kilde */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Forvalter / kilde:</label>
                      <input type="text" value={eksisterendePortefolje.kilde} onChange={(e) => setEksisterendePortefolje(prev => ({ ...prev, kilde: e.target.value }))}
                        placeholder="f.eks. Nordea, DNB, Handelsbanken" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5" />
                    </div>

                    {/* Importer-knapper */}
                    <div className="flex gap-2">
                      <button onClick={() => setEksPortPasteModal(true)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5" style={{ color: PENSUM_COLORS.darkBlue }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Lim inn porteføljeoversikt
                      </button>
                    </div>

                    {/* ── FOND ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Fond</h4>
                        <span className="text-xs text-gray-400">{eksisterendePortefolje.fond.length} fond</span>
                      </div>

                      {/* Fondssøk — bruker Morningstar-datasettet (eksterneFond) */}
                      <div className="relative mb-3">
                        <input
                          type="text" value={eksPortFondSok}
                          onFocus={() => { if (!eksterneFond && !eksterneFondLoading) lastEksterneFond(); }}
                          onChange={(e) => {
                            setEksPortFondSok(e.target.value);
                            setEksPortFondResultater(sokEksterneFondFuzzy(e.target.value, 20));
                          }}
                          placeholder={eksterneFondLoading ? 'Laster fondsdatabase...' : 'Søk fond (navn, ISIN eller forvalter) — 4 974 fond fra Morningstar'}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pl-8"
                        />
                        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        {eksterneFondLoading && <svg className="w-4 h-4 absolute right-3 top-2.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                        {eksPortFondResultater.length > 0 && eksPortFondSok.length >= 2 && (
                          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                            {eksPortFondResultater.map(f => {
                              const erLagtTil = eksisterendePortefolje.fond.some(ef => ef.isin === f.isin);
                              const fondKat = f.cat?.toLowerCase().includes('fixed income') || f.cat?.toLowerCase().includes('bond') || f.cat?.toLowerCase().includes('money market') ? 'rente'
                                : f.cat?.toLowerCase().includes('allocation') || f.cat?.toLowerCase().includes('mixed') ? 'blandet' : 'aksje';
                              return (
                                <button key={f.isin} disabled={erLagtTil}
                                  onClick={() => {
                                    setEksisterendePortefolje(prev => ({
                                      ...prev,
                                      fond: [...prev.fond, {
                                        id: f.isin, navn: f.n, isin: f.isin, belop: 0,
                                        forvalter: f.mgr || '', kategori: fondKat, cat: f.cat || '',
                                        avk1y: f.r1y, avk3y: f.r3y, avk5y: f.r5y,
                                        volatilitet: f.sd3y, geografi: f.cat || '',
                                        matchet: true
                                      }]
                                    }));
                                    setEksPortFondSok('');
                                    setEksPortFondResultater([]);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 flex items-center justify-between ${erLagtTil ? 'opacity-40' : ''}`}>
                                  <div>
                                    <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{f.n}</span>
                                    <span className="text-gray-400 ml-2">{f.isin}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100">{f.cat || '—'}</span>
                                    {erLagtTil && <span className="text-green-500">✓</span>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Legge til fond manuelt (ikke i database) */}
                      <button
                        onClick={() => {
                          const navn = prompt('Fondsnavn:');
                          if (!navn) return;
                          setEksisterendePortefolje(prev => ({
                            ...prev,
                            fond: [...prev.fond, { id: `manuell-${Date.now()}`, navn, isin: '', belop: 0, forvalter: '', kategori: 'ukjent', cat: '', avk1y: null, avk3y: null, avk5y: null, volatilitet: null, geografi: '', matchet: false }]
                          }));
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Legg til fond manuelt
                      </button>

                      {/* Fondsliste */}
                      {eksisterendePortefolje.fond.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ backgroundColor: '#F8FAFB' }}>
                                <th className="py-2 px-3 text-left font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Fond</th>
                                <th className="py-2 px-2 text-right font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Beløp</th>
                                <th className="py-2 px-2 text-left font-medium text-gray-400">Kategori</th>
                                <th className="py-2 px-2 text-right font-medium text-gray-400">1 år</th>
                                <th className="py-2 px-2 text-right font-medium text-gray-400">3 år p.a.</th>
                                <th className="py-2 px-2 text-right font-medium text-gray-400">5 år p.a.</th>
                                <th className="py-2 px-2 text-right font-medium text-gray-400">Vol.</th>
                                <th className="py-2 px-1 text-center font-medium text-gray-400">Slett</th>
                              </tr>
                            </thead>
                            <tbody>
                              {eksisterendePortefolje.fond.map((f, idx) => (
                                <tr key={f.id} className={idx % 2 === 0 ? '' : 'bg-gray-50/50'}>
                                  <td className="py-1.5 px-3">
                                    <div className="flex items-center gap-1.5">
                                      {f.matchet ? <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> : <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                                      <span className="font-medium truncate max-w-[200px]" style={{ color: PENSUM_COLORS.darkBlue }}>{f.navn}</span>
                                    </div>
                                  </td>
                                  <td className="py-1.5 px-2 text-right">
                                    <input type="text" className="w-24 text-right text-xs border border-gray-200 rounded px-1.5 py-0.5"
                                      value={f.belop > 0 ? formatNumber(f.belop) : ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                        setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, belop: val } : ff)
                                        }));
                                      }} />
                                  </td>
                                  <td className="py-1.5 px-2 text-left">
                                    {f.matchet ? (
                                      <span className={`px-1 py-0.5 rounded text-[9px] ${f.kategori === 'aksje' ? 'bg-blue-50 text-blue-600' : f.kategori === 'rente' ? 'bg-green-50 text-green-600' : f.kategori === 'blandet' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`} title={f.cat || ''}>
                                        {f.kategori === 'aksje' ? 'Aksje' : f.kategori === 'rente' ? 'Rente' : f.kategori === 'blandet' ? 'Blandet' : '—'}
                                      </span>
                                    ) : (
                                      <select className="text-[9px] border border-gray-200 rounded px-1 py-0.5 bg-white"
                                        value={f.kategori}
                                        onChange={(e) => setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, kategori: e.target.value } : ff)
                                        }))}>
                                        <option value="ukjent">—</option>
                                        <option value="aksje">Aksje</option>
                                        <option value="rente">Rente</option>
                                        <option value="blandet">Blandet</option>
                                      </select>
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right">
                                    {f.matchet ? (
                                      f.avk1y != null ? <span className={f.avk1y >= 0 ? 'text-green-600' : 'text-red-600'}>{f.avk1y >= 0 ? '+' : ''}{f.avk1y.toFixed(1)}%</span> : <span className="text-gray-400">—</span>
                                    ) : (
                                      <input type="number" step="0.1" className="w-14 text-right text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                        value={f.avk1y ?? ''} placeholder="—"
                                        onChange={(e) => setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, avk1y: e.target.value ? parseFloat(e.target.value) : null } : ff)
                                        }))} />
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right">
                                    {f.matchet ? (
                                      f.avk3y != null ? <span className={f.avk3y >= 0 ? 'text-green-600' : 'text-red-600'}>{f.avk3y >= 0 ? '+' : ''}{f.avk3y.toFixed(1)}%</span> : <span className="text-gray-400">—</span>
                                    ) : (
                                      <input type="number" step="0.1" className="w-14 text-right text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                        value={f.avk3y ?? ''} placeholder="—"
                                        onChange={(e) => setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, avk3y: e.target.value ? parseFloat(e.target.value) : null } : ff)
                                        }))} />
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right">
                                    {f.matchet ? (
                                      f.avk5y != null ? <span className={f.avk5y >= 0 ? 'text-green-600' : 'text-red-600'}>{f.avk5y >= 0 ? '+' : ''}{f.avk5y.toFixed(1)}%</span> : <span className="text-gray-400">—</span>
                                    ) : (
                                      <input type="number" step="0.1" className="w-14 text-right text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                        value={f.avk5y ?? ''} placeholder="—"
                                        onChange={(e) => setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, avk5y: e.target.value ? parseFloat(e.target.value) : null } : ff)
                                        }))} />
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right">
                                    {f.matchet ? (
                                      f.volatilitet != null ? <span className="text-gray-500">{f.volatilitet.toFixed(1)}%</span> : <span className="text-gray-400">—</span>
                                    ) : (
                                      <input type="number" step="0.1" className="w-14 text-right text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                        value={f.volatilitet ?? ''} placeholder="—"
                                        onChange={(e) => setEksisterendePortefolje(prev => ({
                                          ...prev,
                                          fond: prev.fond.map((ff, i) => i === idx ? { ...ff, volatilitet: e.target.value ? parseFloat(e.target.value) : null } : ff)
                                        }))} />
                                    )}
                                  </td>
                                  <td className="py-1.5 px-1 text-center">
                                    <button onClick={() => setEksisterendePortefolje(prev => ({ ...prev, fond: prev.fond.filter((_, i) => i !== idx) }))}
                                      className="text-red-400 hover:text-red-600">×</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 font-semibold" style={{ backgroundColor: '#F8FAFB' }}>
                                <td className="py-2 px-3" style={{ color: PENSUM_COLORS.darkBlue }}>Sum fond</td>
                                <td className="py-2 px-2 text-right" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(eksisterendePortefolje.fond.reduce((s, f) => s + f.belop, 0))}</td>
                                <td colSpan={4}></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* ── ENKELTAKSJER ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Enkeltaksjer</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setEksisterendePortefolje(prev => ({ ...prev, aksjer: [...prev.aksjer, { navn: '', belop: 0 }] }))}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1" style={{ color: PENSUM_COLORS.darkBlue }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Legg til aksjepost
                        </button>
                      </div>
                      {eksisterendePortefolje.aksjer.length > 0 && (
                        <div className="space-y-1.5">
                          {eksisterendePortefolje.aksjer.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input type="text" value={a.navn} onChange={(e) => setEksisterendePortefolje(prev => ({ ...prev, aksjer: prev.aksjer.map((aa, i) => i === idx ? { ...aa, navn: e.target.value } : aa) }))}
                                placeholder="Aksjenavn eller samlebetegnelse" className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5" />
                              <input type="text" className="w-28 text-right text-xs border border-gray-200 rounded px-2 py-1.5"
                                value={a.belop > 0 ? formatNumber(a.belop) : ''} placeholder="Beløp"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                  setEksisterendePortefolje(prev => ({ ...prev, aksjer: prev.aksjer.map((aa, i) => i === idx ? { ...aa, belop: val } : aa) }));
                                }} />
                              <button onClick={() => setEksisterendePortefolje(prev => ({ ...prev, aksjer: prev.aksjer.filter((_, i) => i !== idx) }))}
                                className="text-red-400 hover:text-red-600 text-sm">×</button>
                            </div>
                          ))}
                          <div className="text-xs font-semibold text-right pr-12" style={{ color: PENSUM_COLORS.darkBlue }}>
                            Sum aksjer: {formatCurrency(eksisterendePortefolje.aksjer.reduce((s, a) => s + a.belop, 0))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── KONTANTER ── */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Kontanter</h4>
                      <CurrencyInput label="Kontantbeholdning" value={eksisterendePortefolje.kontanter}
                        onChange={(v) => setEksisterendePortefolje(prev => ({ ...prev, kontanter: v }))} />
                    </div>

                    {/* ── TOTAL ── */}
                    {(eksisterendePortefolje.fond.length > 0 || eksisterendePortefolje.aksjer.length > 0 || eksisterendePortefolje.kontanter > 0) && (
                      <div className="border-t-2 pt-4 mt-4" style={{ borderColor: PENSUM_COLORS.darkBlue }}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total eksisterende portefølje</span>
                          <span className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>
                            {formatCurrency(eksisterendePortefolje.fond.reduce((s, f) => s + f.belop, 0) + eksisterendePortefolje.aksjer.reduce((s, a) => s + a.belop, 0) + eksisterendePortefolje.kontanter)}
                          </span>
                        </div>
                        {/* Aktivt tilleggsmodul-toggle */}
                        {(() => {
                          const eksModul = tilleggsmoduler.find(m => m.id === 'eksisterende-sammenligning');
                          if (!eksModul) return null;
                          return (
                            <button
                              onClick={() => setTilleggsmoduler(prev => prev.map(m => m.id === 'eksisterende-sammenligning' ? { ...m, aktiv: !m.aktiv } : m))}
                              className={`w-full text-xs py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${eksModul.aktiv ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                              {eksModul.aktiv ? 'Sammenligning aktiv i rapporten ✓' : 'Inkluder sammenligning i rapporten'}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Paste-modal for eksisterende portefølje */}
              {eksPortPasteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Lim inn porteføljeoversikt</h3>
                      <p className="text-xs text-gray-500 mt-1">Lim inn tekst fra bankutskrift, e-post eller PDF. Systemet forsøker å gjenkjenne fond, aksjer og beløp automatisk.</p>
                    </div>
                    <div className="p-6">
                      <textarea
                        value={eksPortPasteText}
                        onChange={(e) => setEksPortPasteText(e.target.value)}
                        placeholder={"Eksempel:\nGambak NOK 1.400.000\nNordea FRN Kredit NOK 1.550.000\nKontanter: NOK 8.300.000\nFrontline\nMowi\nStorebrand"}
                        className="w-full h-48 text-sm border border-gray-200 rounded-lg p-3 font-mono"
                      />
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                      <button onClick={() => { setEksPortPasteModal(false); setEksPortPasteText(''); }}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Avbryt</button>
                      <button onClick={() => {
                        // Parse innlimt tekst
                        const linjer = eksPortPasteText.split('\n').map(l => l.trim()).filter(Boolean);
                        const nyeFond = [];
                        const nyeAksjer = [];
                        let kontanter = eksisterendePortefolje.kontanter;
                        for (const linje of linjer) {
                          // Forsøk å finne beløp i linjen
                          const belopMatch = linje.match(/(?:NOK|kr\.?|:)\s*([\d\s.,]+)/i);
                          const belop = belopMatch ? parseInt(belopMatch[1].replace(/[\s.,]/g, '')) || 0 : 0;
                          const navnDel = belopMatch ? linje.substring(0, belopMatch.index).trim() : linje.trim();
                          // Sjekk om det er kontanter
                          if (/kontant/i.test(navnDel) && belop > 0) {
                            kontanter = belop;
                            continue;
                          }
                          // Forsøk å matche mot Morningstar-datasettet via fuzzy-søk
                          const fondMatchResultat = sokEksterneFondFuzzy(navnDel, 1);
                          const fondMatch = fondMatchResultat.length > 0 ? fondMatchResultat[0] : null;
                          if (fondMatch) {
                            if (!nyeFond.some(f => f.isin === fondMatch.isin)) {
                              const fKat = fondMatch.cat?.toLowerCase().includes('fixed income') || fondMatch.cat?.toLowerCase().includes('bond') || fondMatch.cat?.toLowerCase().includes('money market') ? 'rente'
                                : fondMatch.cat?.toLowerCase().includes('allocation') || fondMatch.cat?.toLowerCase().includes('mixed') ? 'blandet' : 'aksje';
                              nyeFond.push({ id: fondMatch.isin, navn: fondMatch.n, isin: fondMatch.isin, belop, forvalter: fondMatch.mgr || '', kategori: fKat, cat: fondMatch.cat || '', avk1y: fondMatch.r1y, avk3y: fondMatch.r3y, avk5y: fondMatch.r5y, volatilitet: fondMatch.sd3y, geografi: fondMatch.cat || '', matchet: true });
                            }
                          } else if (belop > 0 && navnDel.length > 1) {
                            // Ukjent fond med beløp
                            nyeFond.push({ id: `paste-${Date.now()}-${Math.random()}`, navn: navnDel, isin: '', belop, forvalter: '', kategori: 'ukjent', cat: '', avk1y: null, avk3y: null, avk5y: null, volatilitet: null, geografi: '', matchet: false });
                          } else if (navnDel.length > 1 && belop === 0) {
                            // Sannsynligvis en aksje (bare navn, ingen beløp)
                            nyeAksjer.push({ navn: navnDel, belop: 0 });
                          }
                        }
                        setEksisterendePortefolje(prev => ({
                          ...prev,
                          fond: [...prev.fond, ...nyeFond.filter(nf => !prev.fond.some(ef => ef.isin && ef.isin === nf.isin))],
                          aksjer: [...prev.aksjer, ...nyeAksjer],
                          kontanter,
                        }));
                        setEksPortPasteModal(false);
                        setEksPortPasteText('');
                      }} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        Analyser og importer
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {activeTab === 'allokering' && (
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
                        value={investertBelop !== null ? formatNumber(investertBelop) : formatNumber(totalKapital)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 0;
                          setInvestertBelop(value);
                        }}
                        className="border border-blue-400 bg-blue-800/50 text-white rounded py-1 px-2 w-28 text-right text-sm"
                      />
                      <span className="text-blue-300 text-sm">kr</span>
                      {investertBelop !== null && (
                        <button onClick={() => setInvestertBelop(null)} className="text-blue-300 hover:text-white" title="Tilbakestill">↺</button>
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
                      <button onClick={() => { setVisAlternativeAllokering(null); resetTilAutomatisk(); setInvestertBelop(null); }} className="px-3 py-1.5 rounded text-xs font-medium bg-blue-800 text-white hover:bg-blue-700 transition-colors">Tilbakestill alt</button>
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
                      </div>
                      <div className={"flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold " + (Math.abs(totalVekt - 100) < 0.2 ? "bg-green-50 text-green-700 border border-green-200" : totalVekt > 100 ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                        <div className={"w-2 h-2 rounded-full " + (Math.abs(totalVekt - 100) < 0.2 ? "bg-green-500" : totalVekt > 100 ? "bg-red-500" : "bg-amber-500")}></div>
                        {formatPercent(totalVekt)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'aksjer')} isExpanded={expandedCategories.aksjer} onToggle={() => toggleCategory('aksjer')} />
                      {expandedCategories.aksjer && allokering.filter(a => a.kategori === 'aksjer').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} avkastningLaast={avkastningsraterLaast} />)}
                      <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'renter')} isExpanded={expandedCategories.renter} onToggle={() => toggleCategory('renter')} />
                      {expandedCategories.renter && allokering.filter(a => a.kategori === 'renter').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} avkastningLaast={avkastningsraterLaast} />)}
                      {effektivVisAlternative && (
                        <>
                          {allokering.find(a => a.navn === 'Private Equity') && <AllokeringRow item={allokering.find(a => a.navn === 'Private Equity')} index={allokering.findIndex(a => a.navn === 'Private Equity')} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} avkastningLaast={avkastningsraterLaast} />}
                          {allokering.find(a => a.navn === 'Eiendom') && <AllokeringRow item={allokering.find(a => a.navn === 'Eiendom')} index={allokering.findIndex(a => a.navn === 'Eiendom')} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} avkastningLaast={avkastningsraterLaast} />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
                  {/* Porteføljesammensetning - donut chart with side legend */}
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                    <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljesammensetning</h4>
                    {showComparison ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</h5>
                          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2} cornerRadius={3}>{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || '#888'} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                          <div className="space-y-1 mt-1">
                            {pieData.filter(d => d.value > 0).map(d => (
                              <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: ASSET_COLORS[d.name] || '#888' }}></div><span className="text-gray-600 truncate">{d.name}</span></div>
                                <span className="font-semibold">{d.value.toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-center text-xs font-semibold mb-2" style={{ color: PENSUM_COLORS.teal }}>{sammenligningProfil}</h5>
                          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={sammenligningPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2} cornerRadius={3}>{sammenligningPieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS_LIGHT[e.name] || ASSET_COLORS[e.name] || '#888'} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} /></PieChart></ResponsiveContainer>
                          <div className="space-y-1 mt-1">
                            {sammenligningPieData.filter(d => d.value > 0).map(d => (
                              <div key={d.name} className="flex items-center justify-between text-xs px-1">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ backgroundColor: ASSET_COLORS_LIGHT[d.name] || ASSET_COLORS[d.name] || '#888' }}></div><span className="text-gray-600 truncate">{d.name}</span></div>
                                <span className="font-semibold">{d.value.toFixed(0)}%</span>
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
                              <Tooltip formatter={(v, n) => [v.toFixed(1) + '%', n]} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
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
                              <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{entry.value.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Likviditet & Aktivafordeling — full bredde under allokering */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet & Aktivafordeling</h4>
              {(() => {
                const illikvKat = ['privateMarkets', 'eiendom'];
                const currIllikvid = allokering.filter(a => illikvKat.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
                const currLikvid = totalVekt - currIllikvid;
                const currLikvidData = [{ name: 'Likvid', value: currLikvid }, { name: 'Illikvid', value: currIllikvid }].filter(d => d.value > 0);

                const sammIllikvid = showComparison ? sammenligningAllokering.filter(a => illikvKat.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0) : 0;
                const sammLikvid = showComparison ? sammenligningAllokering.reduce((s, a) => s + a.vekt, 0) - sammIllikvid : 0;
                const sammLikvidData = [{ name: 'Likvid', value: sammLikvid }, { name: 'Illikvid', value: sammIllikvid }].filter(d => d.value > 0);

                const sammAktivaData = showComparison ? [
                  { name: 'Aksjer', value: sammenligningAllokering.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0), color: PENSUM_COLORS.darkBlue },
                  { name: 'Renter', value: sammenligningAllokering.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0), color: PENSUM_COLORS.salmon },
                  { name: 'Private Equity', value: sammenligningAllokering.filter(a => a.kategori === 'privateMarkets').reduce((s, a) => s + a.vekt, 0), color: PENSUM_COLORS.teal },
                  { name: 'Eiendom', value: sammenligningAllokering.filter(a => a.kategori === 'eiendom').reduce((s, a) => s + a.vekt, 0), color: PENSUM_COLORS.gold },
                ].filter(d => d.value > 0) : [];

                const renderDonutWithLegend = (title, pieData, colors) => (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
                    <div className="flex items-center justify-center gap-3">
                      <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value" paddingAngle={2} cornerRadius={3}>
                            {pieData.map((e, i) => <Cell key={i} fill={colors ? colors[i] : e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => v.toFixed(0) + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1 text-left">
                        {pieData.map((d, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors ? colors[i] : d.color }}></div>
                            <span className="text-gray-600">{d.name}</span>
                            <span className="font-semibold">{d.value.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div className={showComparison ? "grid grid-cols-4 gap-4" : "grid grid-cols-2 gap-6"}>
                    {renderDonutWithLegend(showComparison ? `Likvid — ${risikoprofil}` : 'Likvid vs. illikvid', currLikvidData, [PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold])}
                    {showComparison && renderDonutWithLegend(`Likvid — ${sammenligningProfil}`, sammLikvidData, [PENSUM_COLORS.darkBlue, PENSUM_COLORS.gold])}
                    {renderDonutWithLegend(showComparison ? `Aktiva — ${risikoprofil}` : 'Aktivafordeling', renterAksjerData, undefined)}
                    {showComparison && renderDonutWithLegend(`Aktiva — ${sammenligningProfil}`, sammAktivaData, undefined)}
                  </div>
                );
              })()}
            </div>

            {/* Rebalansering panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between cursor-pointer" style={{ backgroundColor: PENSUM_COLORS.darkBlue }} onClick={() => setRebalanseringAktiv(!rebalanseringAktiv)}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Årlig rebalansering</h3>
                  {!rebalanseringAktiv && <span className="text-xs text-blue-200">(klikk for å aktivere)</span>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <span className="text-sm text-white">{rebalanseringAktiv ? 'Aktiv' : 'Inaktiv'}</span>
                  <div className="relative">
                    <input type="checkbox" checked={rebalanseringAktiv} onChange={(e) => setRebalanseringAktiv(e.target.checked)} className="sr-only" />
                    <div className={"w-11 h-6 rounded-full transition-colors " + (rebalanseringAktiv ? "bg-green-500" : "bg-gray-400")}></div>
                    <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (rebalanseringAktiv ? "translate-x-5" : "")}></div>
                  </div>
                </label>
              </div>
              {rebalanseringAktiv && (
                <div className="p-6 space-y-4">
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
                        <p>{reb.prosentPerAar}% av {reb.fraAktiva} → {reb.tilAktiva}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Startkapital" value={formatCurrency(effektivtInvestertBelop)} />
              <StatCard label="Forventet avkastning" value={formatPercent(vektetAvkastning)} subtext="årlig" />
              <StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((verdiutvikling[verdiutvikling.length - 1]?.total || 0) - effektivtInvestertBelop - (nettoKontantstrom * horisont))} color={PENSUM_COLORS.green} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">{showComparison ? "Utvikling - Sammenligning" : "Utvikling i formuesverdi"}</h3></div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={kombinertVerdiutvikling} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={showComparison ? "20%" : "40%"}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v, n) => [formatCurrency(v), n === 'total_alt' ? 'Total (' + sammenligningProfil + ')' : n]} />
                    <Legend iconType="circle" />
                    {aktiveAktiva.map((a) => <Bar key={a.navn} dataKey={a.navn} stackId="a" fill={ASSET_COLORS[a.navn] || CATEGORY_COLORS[a.kategori]} />)}
                    {showComparison && <Bar dataKey="total_alt" stackId="b" fill={PENSUM_COLORS.teal} name={"Total (" + sammenligningProfil + ")"} opacity={0.7} />}
                  </BarChart>
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
                    </tr>
                  </thead>
                  <tbody>
                    {verdiutvikling.map((row, idx) => (
                      <tr key={row.year} className={"border-b border-gray-100 " + (idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                        <td className="py-3 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                        <td className={"py-3 px-3 text-right " + (row.kontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{idx === 0 ? '—' : formatCurrency(row.kontantstrom)}</td>
                        {aktiveAktiva.map(a => <td key={a.navn} className="py-3 px-3 text-right text-gray-600">{formatCurrency(row[a.navn] || 0)}</td>)}
                        <td className="py-3 px-4 text-right font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Pessimistisk</div>
                      <div className="text-4xl font-bold text-red-700 mb-1">{formatPercent(scenarioParams.pessimistisk)}</div>
                      <input type="range" min="-10" max={vektetAvkastning} step="0.5" value={scenarioParams.pessimistisk}
                        onChange={(e) => setScenarioParams(p => ({...p, pessimistisk: parseFloat(e.target.value)}))}
                        className="w-full h-2 bg-red-200 rounded-lg cursor-pointer mt-3" />
                      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-red-100">
                        <div><div className="text-xs text-red-400">Gevinst</div><div className="font-semibold text-red-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.pessimistisk||0) - effektivtInvestertBelop)}</div></div>
                        <div><div className="text-xs text-red-400">CAGR</div><div className="font-semibold text-red-700 text-sm">{formatPercent(scenarioParams.pessimistisk)}</div></div>
                      </div>
                    </div>
                  )}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#0D2240' }}>
                    <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">Forventet</div>
                    <div className="text-4xl font-bold text-white mb-1">{formatCurrency(scenarioData[scenarioData.length-1]?.forventet || 0)}</div>
                    <div className="text-blue-300 text-sm mb-3">etter {horisont} år</div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-800">
                      <div><div className="text-xs text-blue-400">Gevinst</div><div className="font-semibold text-white text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.forventet||0) - effektivtInvestertBelop)}</div></div>
                      <div><div className="text-xs text-blue-400">CAGR</div><div className="font-semibold text-white text-sm">{formatPercent(vektetAvkastning)}</div></div>
                    </div>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-3">Optimistisk</div>
                    <div className="text-4xl font-bold text-green-700 mb-1">{formatCurrency(scenarioData[scenarioData.length-1]?.optimistisk || 0)}</div>
                    <div className="text-green-500 text-sm mb-3">etter {horisont} år</div>
                    <input type="range" min={vektetAvkastning} max="25" step="0.5" value={scenarioParams.optimistisk}
                      onChange={(e) => setScenarioParams(p => ({...p, optimistisk: parseFloat(e.target.value)}))}
                      className="w-full h-2 rounded-lg cursor-pointer bg-green-200" />
                    <div className="mt-2 text-center font-bold text-green-600">{formatPercent(scenarioParams.optimistisk)} p.a.</div>
                    <div className="mt-2 grid grid-cols-2 gap-3 pt-3 border-t border-green-100">
                      <div><div className="text-xs text-green-400">Gevinst</div><div className="font-semibold text-green-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.optimistisk||0) - effektivtInvestertBelop)}</div></div>
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
                      <input type="number" value={skattepliktigFormue} onChange={(e) => setSkattepliktigFormue(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Årlig forbruk (uttak)</label>
                      <input type="number" value={aarligForbruk} onChange={(e) => setAarligForbruk(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Inflasjon (%)</label>
                      <input type="number" step="0.1" value={inflasjon} onChange={(e) => setInflasjon(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bankrente (%)</label>
                      <input type="number" step="0.1" value={renteAvkastning} onChange={(e) => setRenteAvkastning(Number(e.target.value) || 0)}
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
        )}

        {activeTab === 'losninger' && (
          <div className="space-y-6 no-print">
            {/* Header med standardporteføljer og innstillinger */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Pensum Porteføljesammensetning</h3>
                  <div className="flex items-center gap-4">
                    {/* Innstillinger */}
                    <div className="flex items-center gap-4 pr-4 border-r border-blue-400">
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={brukBasis} onChange={(e) => setBrukBasis(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Inkluder Basis</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={visAlternative} onChange={(e) => setVisAlternative(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Alternative investeringer</span>
                      </label>
                    </div>
                    {/* Standardporteføljer */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-200">Standardportefølje:</span>
                      {Object.keys(pensumStandardPortefoljer).map(profil => (
                        <button key={profil} onClick={() => velgPensumStandardPortefolje(profil)} className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (valgtPensumProfil === profil ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}>
                          {profil}
                        </button>
                      ))}
                    </div>
                  </div>
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
                              const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 0;
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
                        {pensumLikviditet.illikvid > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            {pensumLikviditet.illikvid}% illikvid
                          </span>
                        )}
                        <span className={"text-sm px-3 py-1 rounded-full " + (Math.abs(pensumTotalVekt - 100) < 0.2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          Total: {pensumTotalVekt.toFixed(1)}%
                        </span>
                      </div>
                    </h4>
                    
                    {/* Valgte produkter */}
                    <div className="space-y-2 mb-6">
                      {pensumAllokering.map(produkt => {
                        const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
                        const produktInfo = alleProdukt.find(p => p.id === produkt.id);
                        const erIllikvid = produktInfo?.likviditet === 'illikvid';
                        const harEksponering = produktEksponering[produkt.id];
                        return (
                          <div key={produkt.id} className={"flex items-center gap-3 p-3 rounded-xl transition-colors " + (erIllikvid ? "bg-amber-50/80 border border-amber-200" : "bg-gray-50/80 border border-gray-100 hover:bg-gray-100/50")}>
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
                                {harEksponering && (
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                {erIllikvid && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Illikvid</span>}
                              </p>
                              <p className="text-xs text-gray-500">{produkt.kategori === 'enkeltfond' ? 'Enkeltfond' : produkt.kategori === 'alternative' ? 'Alternativ investering' : 'Fondsportefølje'}</p>
                            </div>
                            <div className="flex items-center gap-2">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legg til produkter */}
                    <div className="border-t border-gray-200 pt-5 mt-2">
                      <h5 className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: '#94A3B8' }}>Legg til produkt</h5>
                      <div className={"grid gap-4 " + (visAlternative ? "grid-cols-3" : "grid-cols-2")}>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">ENKELTFOND</p>
                          <div className="space-y-1">
                            {pensumProdukter.enkeltfond.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'enkeltfond')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">FONDSPORTEFØLJER</p>
                          <div className="space-y-1">
                            {pensumProdukter.fondsportefoljer.filter(p => !pensumAllokering.find(a => a.id === p.id) && (brukBasis || p.id !== 'basis')).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'fondsportefoljer')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        {visAlternative && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 mb-2">ALTERNATIVE INVESTERINGER</p>
                            <div className="space-y-1">
                              {pensumProdukter.alternative.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                                <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'alternative')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-amber-50 border border-amber-200 flex items-center justify-between">
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

                  {/* Høyre: Kakediagrammer */}
                  <div className="space-y-8">
                    {/* Porteføljefordeling */}
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                      <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljefordeling</h4>
                      <div className="flex items-center gap-6">
                        <div className="shrink-0">
                          <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                              <Pie data={pensumAllokering.filter(p => p.vekt > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="vekt" paddingAngle={2} cornerRadius={4}>
                                {pensumAllokering.filter(p => p.vekt > 0).map((entry, idx) => (
                                  <Cell key={entry.id} fill={[PENSUM_COLORS.navy, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => v + '%'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1">
                          {pensumAllokering.filter(p => p.vekt > 0).map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-2.5 text-sm">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: [PENSUM_COLORS.navy, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7] }}></div>
                              <span className="flex-1 truncate text-gray-700">{p.navn}</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{p.vekt}%</span>
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
                              <Pie data={pensumAktivafordeling.filter(p => p.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                {pensumAktivafordeling.filter(p => p.value > 0).map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => v + '%'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2.5 flex-1">
                          {pensumAktivafordeling.filter(a => a.value > 0).map(a => (
                            <div key={a.name} className="flex items-center gap-2.5 text-sm">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }}></div>
                              <span className="flex-1 text-gray-700">{a.name}</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{a.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Vis likviditet toggle */}
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer px-1">
                      <input type="checkbox" checked={visLikviditetPensum} onChange={e => setVisLikviditetPensum(e.target.checked)} className="w-3.5 h-3.5 rounded" style={{ accentColor: PENSUM_COLORS.teal }} />
                      <span>Vis likviditetsfordeling</span>
                    </label>

                    {/* Likviditet donut */}
                    {visLikviditetPensum && (
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                        <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Likviditet</h4>
                        <div className="flex items-center gap-6">
                          <div className="shrink-0">
                            <ResponsiveContainer width={160} height={160}>
                              <PieChart>
                                <Pie data={[{ name: 'Likvid', value: pensumLikviditet.likvid }, { name: 'Illikvid', value: pensumLikviditet.illikvid }].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                  <Cell fill={PENSUM_COLORS.darkBlue} />
                                  {pensumLikviditet.illikvid > 0 && <Cell fill={PENSUM_COLORS.gold} />}
                                </Pie>
                                <Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2.5 text-sm">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                              <span className="flex-1 text-gray-700">Likvid (daglig)</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{pensumLikviditet.likvid.toFixed(1)}%</span>
                            </div>
                            {pensumLikviditet.illikvid > 0 && (
                              <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.gold }}></div>
                                <span className="flex-1 text-gray-700">Illikvid</span>
                                <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{pensumLikviditet.illikvid.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Hvor er pengene investert? (kun aksjedelen) */}
                {(() => {
                  // Beregn vektet aggregert eksponering for hele porteføljen (ekskl. høyrente/rente)
                  const aksjeProdukter = pensumAllokering.filter(a => {
                    if (a.vekt <= 0) return false;
                    const alle = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
                    const p = alle.find(pp => pp.id === a.id);
                    // Ekskluder rente/høyrente-produkter
                    if (p?.aktivatype === 'rente') return false;
                    if (a.id === 'global-hoyrente' || a.id === 'nordisk-hoyrente') return false;
                    return true;
                  });
                  const totalAksjeVekt = aksjeProdukter.reduce((s, a) => s + a.vekt, 0) || 1;

                  const aggreger = (key) => {
                    const sumMap = {};
                    aksjeProdukter.forEach(a => {
                      const eks = produktEksponering?.[a.id]?.[key];
                      if (!eks) return;
                      const relVekt = a.vekt / totalAksjeVekt;
                      eks.forEach(row => {
                        if (!sumMap[row.navn]) sumMap[row.navn] = 0;
                        sumMap[row.navn] += (Number(row.vekt) || 0) * relVekt;
                      });
                    });
                    return Object.entries(sumMap)
                      .map(([navn, vekt]) => ({ navn, vekt: parseFloat(vekt.toFixed(1)) }))
                      .sort((a, b) => b.vekt - a.vekt)
                      .slice(0, 10);
                  };

                  const aggRegioner = aggreger('regioner');
                  const aggSektorer = aggreger('sektorer');
                  const aggStil = aggreger('stil');

                  if (aksjeProdukter.length === 0) return null;

                  return (
                    <div className="mt-8 rounded-2xl border border-blue-200/60 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #EBF3FF 50%, #DBEAFE 100%)' }}>
                      <div className="px-5 py-4 border-b border-blue-200/50" style={{ backgroundColor: 'rgba(13, 34, 64, 0.04)' }}>
                        <h4 className="font-semibold text-base" style={{ color: PENSUM_COLORS.darkBlue }}>Hvor er pengene investert?</h4>
                        <p className="text-xs text-gray-500 mt-1">Vektet eksponering for den samlede porteføljen. <em>Gjelder aksjedelen ({aksjeProdukter.map(a => a.navn?.replace('Pensum ', '')).join(', ')}).</em></p>
                      </div>
                      <div className="p-5">
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
                                      <span className="text-xs min-w-0 flex-1 truncate">{row.navn}</span>
                                      <div className="w-24 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(row.vekt, 100)}%`, backgroundColor: block.color }}></div>
                                      </div>
                                      <span className="text-xs font-medium w-10 text-right">{row.vekt}%</span>
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
                                <p className="text-sm text-slate-600 mt-3 max-w-3xl">{aktivtEksponeringsProdukt.rapport?.pitch || aktivtEksponeringsProdukt.rapport?.caseText || 'Ingen produktpitch registrert.'}</p>
                              </div>
                              <div className="xl:col-span-5 grid grid-cols-2 xl:grid-cols-3 gap-3 shrink-0">
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Porteføljevekt</p>
                                  <p className="text-xl font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(aktivtEksponeringsProdukt.vekt)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Forv. avkastning</p>
                                  <p className="text-xl font-semibold" style={{ color: PENSUM_COLORS.green }}>{erGyldigTall(aktivtEksponeringsProdukt.rapport?.expectedReturn) ? `${aktivtEksponeringsProdukt.rapport.expectedReturn}%` : '—'}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right col-span-2 xl:col-span-1">
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Forv. yield</p>
                                  <p className="text-xl font-semibold" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(aktivtEksponeringsProdukt.rapport?.expectedYield) ? `${aktivtEksponeringsProdukt.rapport.expectedYield}%` : '—'}</p>
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
                                            <span className="text-xs min-w-0 flex-1 truncate">{row.navn}</span>
                                            <div className="w-28 bg-slate-100 rounded-full h-4 overflow-hidden">
                                              <div className="h-full rounded-full" style={{ width: `${Math.min(Number(row.vekt) || 0, 100)}%`, backgroundColor: block.color }}></div>
                                            </div>
                                            <span className="text-xs font-medium w-10 text-right">{row.vekt}%</span>
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

            {/* Prognose */}
            {(() => {
              const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
              let yieldSum = 0; let yieldTotal = 0;
              pensumAllokering.forEach(a => {
                const p = alleProdukt.find(pp => pp.id === a.id);
                const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
                if (erGyldigTall(y) && a.vekt > 0) { yieldSum += y * a.vekt; yieldTotal += a.vekt; }
              });
              const vektetYield = yieldTotal > 0 ? yieldSum / yieldTotal : 0;
              return (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <StatCard label="Startkapital" value={formatCurrency(effektivtInvestertBelop)} />
                  <StatCard label="Forventet avkastning" value={formatPercent(pensumForventetAvkastning)} subtext="årlig" color={PENSUM_COLORS.green} />
                  <StatCard label="Forventet yield" value={formatPercent(vektetYield)} subtext="løpende" color={PENSUM_COLORS.teal} />
                  <StatCard label="Sluttverdi" value={formatCurrency(pensumPrognose[pensumPrognose.length - 1]?.verdi || 0)} subtext={"etter " + horisont + " år"} />
                  <StatCard label="Total avkastning" value={formatCurrency((pensumPrognose[pensumPrognose.length - 1]?.verdi || 0) - effektivtInvestertBelop)} color={PENSUM_COLORS.green} />
                </div>
              );
            })()}

            {/* Prognosegraf — stacked per Pensum-produkt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Utvikling i formuesverdi</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={pensumPrognose} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                    <Legend iconType="circle" iconSize={8} />
                    {valgteProdukterForChart.map((p, idx) => <Bar key={p.id} dataKey={p.navn} stackId="a" fill={pensumProduktFarger[idx % pensumProduktFarger.length]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ====== SAMMENLIGN PORTEFØLJE MOT BENCHMARKS ====== */}
            {(() => {
              const PORT_COMP_INDEKS_CONFIG = {
                'MSCI World': { farge: PENSUM_COLORS.lightBlue, feedKey: 'msci-world' },
                'Oslo Børs': { farge: PENSUM_COLORS.navy, feedKey: 'oslo-bors' },
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

              return (
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
                          <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + '%'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step - step, Math.ceil(dataMax / step) * step + step]; }} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                            labelFormatter={(d) => formatHistorikkEtikett(d)}
                            formatter={(v, n) => [v?.toFixed(1).replace('.', ',') + '%', n]} />
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
              );
            })()}

            {/* Historisk avkastning */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Historisk avkastning</h3>
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
                          {erGyldigTall(beregnPensumHistorikk[key]) ? (beregnPensumHistorikk[key] >= 0 ? '+' : '') + beregnPensumHistorikk[key].toFixed(1) + '%' : '—'}
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
                        const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
                        const vektetYield = (() => {
                          let sum = 0; let totalV = 0;
                          pensumAllokering.forEach(a => {
                            const p = alleProdukt.find(pp => pp.id === a.id);
                            const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
                            if (erGyldigTall(y) && a.vekt > 0) { sum += y * a.vekt; totalV += a.vekt; }
                          });
                          return totalV > 0 ? sum / totalV : null;
                        })();
                        return (
                          <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                            <td className="py-3 px-4 font-bold text-white">Vektet portefølje</td>
                            <td className="py-3 px-3 text-right text-white font-bold">{pensumTotalVekt.toFixed(0)}%</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2026) ? (beregnPensumHistorikk.aar2026 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2026) ? beregnPensumHistorikk.aar2026.toFixed(1) + '%' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2025) ? (beregnPensumHistorikk.aar2025 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2025) ? beregnPensumHistorikk.aar2025.toFixed(1) + '%' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2024) ? (beregnPensumHistorikk.aar2024 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2024) ? beregnPensumHistorikk.aar2024.toFixed(1) + '%' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2023) ? (beregnPensumHistorikk.aar2023 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2023) ? beregnPensumHistorikk.aar2023.toFixed(1) + '%' : '—'}</td>
                            <td className={"py-3 px-3 text-right font-bold " + (erGyldigTall(beregnPensumHistorikk.aar2022) ? (beregnPensumHistorikk.aar2022 >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{erGyldigTall(beregnPensumHistorikk.aar2022) ? beregnPensumHistorikk.aar2022.toFixed(1) + '%' : '—'}</td>
                            <td className="py-3 px-3 text-right text-white font-bold">—</td>
                            <td className="py-3 px-3 text-right text-white font-bold">—</td>
                            <td className="py-3 px-2 text-right text-white font-bold" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>—</td>
                            <td className="py-3 px-2 text-right text-white font-bold">—</td>
                            <td className="py-3 px-3 text-right font-bold text-white" style={{ borderLeft: '2px solid rgba(255,255,255,0.3)' }}>{formatPercent(pensumForventetAvkastning)}</td>
                            <td className="py-3 px-3 text-right font-bold text-white">{erGyldigTall(vektetYield) ? vektetYield.toFixed(1) + '%' : '—'}</td>
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
                        const pStat = beregnProduktStatistikk(produktHistorikk[p.id], new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1));
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1) + '%' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1) + '%' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1) + '%' : '—'}</td></>; })()}
                          <td className="py-2 px-2 text-right" style={{ borderLeft: '2px solid #E5E7EB' }}>{pStat ? <span className={"font-semibold px-1.5 py-0.5 rounded text-xs " + (pStat.sharpe >= 1 ? "bg-green-100 text-green-700" : pStat.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{pStat.sharpe.toFixed(2)}</span> : '—'}</td>
                          <td className="py-2 px-2 text-right text-red-600 text-xs font-medium">{pStat ? pStat.maxDrawdown.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1) + '%' : '—'}</td>
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
                        const pStat = beregnProduktStatistikk(produktHistorikk[p.id], new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1));
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1) + '%' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1) + '%' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1) + '%' : '—'}</td></>; })()}
                          <td className="py-2 px-2 text-right" style={{ borderLeft: '2px solid #E5E7EB' }}>{pStat ? <span className={"font-semibold px-1.5 py-0.5 rounded text-xs " + (pStat.sharpe >= 1 ? "bg-green-100 text-green-700" : pStat.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{pStat.sharpe.toFixed(2)}</span> : '—'}</td>
                          <td className="py-2 px-2 text-right text-red-600 text-xs font-medium">{pStat ? pStat.maxDrawdown.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1) + '%' : '—'}</td>
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
                              <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                              <td className="py-2 px-3 text-right text-gray-500">{allok ? allok.vekt.toFixed(1) + '%' : '—'}</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-2 text-right text-gray-400" style={{ borderLeft: '2px solid #E5E7EB' }}>—</td>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right font-medium" style={{ borderLeft: '2px solid #E5E7EB', color: PENSUM_COLORS.green }}>{erGyldigTall(fAvk) ? fAvk.toFixed(1) + '%' : '—'}</td>
                              <td className="py-2 px-3 text-right font-medium" style={{ color: PENSUM_COLORS.teal }}>{erGyldigTall(fYield) ? fYield.toFixed(1) + '%' : '—'}</td>
                            </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* Scenarioanalyse */}
            {(() => {
              const kapital = investertBelop !== null ? investertBelop : totalKapital;
              const baseAvk = erGyldigTall(pensumForventetAvkastning) ? pensumForventetAvkastning : 8;
              const pessAvk = scenarioLosninger.pessimistisk !== null ? scenarioLosninger.pessimistisk : Math.round((baseAvk * 0.45) * 10) / 10;
              const optAvk = scenarioLosninger.optimistisk !== null ? scenarioLosninger.optimistisk : Math.round((baseAvk * 1.4) * 10) / 10;
              const scenarioer = [
                { id: 'pessimistisk', tittel: 'Pessimistisk', undertittel: 'Vedvarende uro', avk: pessAvk, farge: '#DC2626', borderColor: '#DC2626', beskrivelse: 'Langvarig lavvekst, geopolitisk uro, utvidet volatilitet. Rentedelen beskytter, men aksjedelen gir begrenset avkastning.' },
                { id: 'hoved', tittel: 'Hovedscenario', undertittel: 'Forventet utfall', avk: Math.round(baseAvk * 10) / 10, farge: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue, beskrivelse: 'Gradvis normalisering av renter, moderat global vekst, sterk aktiv fondsseleksjon som leverer meravkastning over indeks.' },
                { id: 'optimistisk', tittel: 'Optimistisk', undertittel: 'Sterk medvind', avk: optAvk, farge: '#059669', borderColor: '#059669', beskrivelse: 'Sterkere vekst enn forventet, tiltagende produktivitet (AI), god renteutvikling. Satellittene kapitaliserer på oppside.' },
              ];
              const scData = [];
              for (let i = 0; i <= horisont; i++) {
                const year = new Date().getFullYear() + i;
                const row = { year };
                scenarioer.forEach(s => {
                  row[s.id] = Math.round(kapital * Math.pow(1 + s.avk / 100, i));
                });
                scData.push(row);
              }
              const formatSluttverdi = (v) => v > 1000000 ? (v / 1000000).toFixed(1) + ' MNOK' : formatCurrency(v);

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
                          const sluttverdi = Math.round(kapital * Math.pow(1 + s.avk / 100, horisont));
                          const gevinst = sluttverdi - kapital;
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
                                  <div><div className="text-xs text-red-400">Gevinst</div><div className="font-semibold text-red-700 text-sm">{formatCurrency(gevinst)}</div></div>
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
                          const sluttverdi = Math.round(kapital * Math.pow(1 + s.avk / 100, horisont));
                          const gevinst = sluttverdi - kapital;
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
                                  <div><div className="text-xs text-blue-400">Gevinst</div><div className="font-semibold text-white text-sm">{formatCurrency(gevinst)}</div></div>
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
                          const sluttverdi = Math.round(kapital * Math.pow(1 + s.avk / 100, horisont));
                          const gevinst = sluttverdi - kapital;
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
                                  <div><div className="text-xs text-green-400">Gevinst</div><div className="font-semibold text-green-700 text-sm">{formatCurrency(gevinst)}</div></div>
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
                            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(0) + 'M' : (v / 1000).toFixed(0) + 'k'} />
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

            {/* Portefølje-snapshots: 1, 3, 5 år */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setVisPortefoljSnapshots(!visPortefoljSnapshots)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: visPortefoljSnapshots ? PENSUM_COLORS.darkBlue : undefined }}
              >
                <div className="flex items-center gap-3">
                  <svg className={"w-5 h-5 transition-transform " + (visPortefoljSnapshots ? "rotate-180 text-white" : "text-gray-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  <h3 className={"text-lg font-semibold " + (visPortefoljSnapshots ? "text-white" : "")} style={{ color: visPortefoljSnapshots ? undefined : PENSUM_COLORS.darkBlue }}>Historisk avkastning — benchmark</h3>
                </div>
                <span className={"text-sm " + (visPortefoljSnapshots ? "text-blue-200" : "text-gray-400")}>
                  {visPortefoljSnapshots ? 'Skjul' : 'Vis 1, 3 og 5 års historikk for Pensum-forslaget'}
                </span>
              </button>
              {visPortefoljSnapshots && (() => {
                const SNAPSHOT_FARGER = {
                  'global-core-active': PENSUM_COLORS.navy, 'global-edge': PENSUM_COLORS.lightBlue, 'basis': PENSUM_COLORS.salmon,
                  'global-hoyrente': PENSUM_COLORS.teal, 'nordisk-hoyrente': PENSUM_COLORS.purple, 'norge-a': PENSUM_COLORS.red,
                  'energy-a': PENSUM_COLORS.gold, 'banking-d': PENSUM_COLORS.midBlue, 'financial-d': PENSUM_COLORS.gray,
                  'turnstone-pe': PENSUM_COLORS.green, 'amaron-re': PENSUM_COLORS.gold, 'unoterte-aksjer': PENSUM_COLORS.purple
                };
                const valgteProdukterIds = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
                const totalVektSnap = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;

                // Referanseindekser for snapshot-grafene
                const SNAPSHOT_INDEKSER = {
                  'MSCI World': { feedKey: 'msci-world', farge: PENSUM_COLORS.lightBlue, dash: '6 3' },
                  'Oslo Børs': { feedKey: 'oslo-bors', farge: PENSUM_COLORS.salmon, dash: '4 3' },
                  'Norske Statsobl.': { feedKey: 'norske-statsobl', farge: PENSUM_COLORS.gray, dash: '2 2' },
                };

                const buildSnapshotData = (periodYears) => {
                  const startDato = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - periodYears, RAPPORT_DATO_OBJEKT.getMonth(), 1);
                  const alleDatoer = new Set();

                  // Bygg produktdata for vektet portefølje
                  const produktMaps = {};
                  valgteProdukterIds.forEach(id => {
                    const hist = produktHistorikk[id];
                    if (hist?.data) {
                      const dMap = new Map();
                      hist.data.forEach(d => { const dt = parseHistorikkDato(d.dato); if (dt && dt >= startDato) { alleDatoer.add(d.dato); dMap.set(d.dato, d.verdi); } });
                      produktMaps[id] = { dMap, startVerdi: finnStartVerdiVedPeriode(hist.data, startDato) };
                    }
                  });

                  // Bygg indeksdata
                  const indeksMaps = {};
                  Object.entries(SNAPSHOT_INDEKSER).forEach(([navn, cfg]) => {
                    const hist = DATAFEED_INDEKS_HISTORIKK?.[cfg.feedKey];
                    if (hist?.data) {
                      const dMap = new Map();
                      hist.data.forEach(d => { const dt = parseHistorikkDato(d.dato); if (dt && dt >= startDato && erGyldigTall(d.verdi)) { alleDatoer.add(d.dato); dMap.set(d.dato, d.verdi); } });
                      const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                      if (startVerdi) indeksMaps[navn] = { dMap, startVerdi };
                    }
                  });

                  const sorterteDatoer = Array.from(alleDatoer).sort();
                  const chartData = sorterteDatoer.map(dato => {
                    const punkt = { dato };
                    // Vektet portefølje — prosentvis avkastning fra start
                    let vektetPct = 0; let totalProdVekt = 0;
                    valgteProdukterIds.forEach(id => {
                      const pm = produktMaps[id];
                      if (pm) {
                        const verdi = pm.dMap.get(dato);
                        if (verdi !== undefined && pm.startVerdi) {
                          const pctReturn = ((verdi / pm.startVerdi) - 1) * 100;
                          const allok = pensumAllokering.find(a => a.id === id);
                          if (allok) { vektetPct += pctReturn * (allok.vekt / totalVektSnap); totalProdVekt += allok.vekt / totalVektSnap; }
                        }
                      }
                    });
                    if (totalProdVekt > 0) punkt['portefolje'] = vektetPct / totalProdVekt;
                    // Indekser — prosentvis avkastning fra start
                    Object.entries(indeksMaps).forEach(([navn, im]) => {
                      const verdi = im.dMap.get(dato);
                      if (verdi !== undefined) punkt[navn] = ((verdi / im.startVerdi) - 1) * 100;
                    });
                    return punkt;
                  });

                  // Beregn avkastning
                  const avkastninger = {};
                  // Portefølje
                  let vektetAvk = 0;
                  valgteProdukterIds.forEach(id => {
                    const hist = produktHistorikk[id];
                    if (hist?.data && hist.data.length >= 2) {
                      const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                      const sluttVerdi = hist.data[hist.data.length - 1].verdi;
                      if (startVerdi) {
                        const avk = ((sluttVerdi / startVerdi) - 1) * 100;
                        const allok = pensumAllokering.find(a => a.id === id);
                        if (allok) vektetAvk += avk * (allok.vekt / totalVektSnap);
                      }
                    }
                  });
                  avkastninger['portefolje'] = vektetAvk;
                  // Indekser
                  Object.entries(indeksMaps).forEach(([navn, im]) => {
                    const sortert = Array.from(im.dMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
                    if (sortert.length >= 2) {
                      const sluttVerdi = sortert[sortert.length - 1][1];
                      avkastninger[navn] = ((sluttVerdi / im.startVerdi) - 1) * 100;
                    }
                  });
                  return { chartData, avkastninger };
                };

                const perioder = [
                  { label: '1 år', years: 1 },
                  { label: '3 år', years: 3 },
                  { label: '5 år', years: 5 }
                ];

                return (
                  <div className="p-6 space-y-8">
                    {perioder.map(({ label, years }) => {
                      const { chartData, avkastninger } = buildSnapshotData(years);
                      if (chartData.length < 2) return null;
                      return (
                        <div key={years} className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0', background: 'linear-gradient(to bottom, #FAFBFC, #FFFFFF)' }}>
                          <div className="px-5 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <h4 className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Siste {label} — prosentvis avkastning</h4>
                          </div>
                          <div className="p-5">
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                                  tickFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return ''; const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                  interval={Math.max(1, Math.floor(chartData.length / (years <= 1 ? 6 : years <= 3 ? 8 : 10)))} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + '%'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 20 ? 5 : 10; return [Math.floor(dataMin / step) * step - step, Math.ceil(dataMax / step) * step + step]; }} ticks={(() => { const allKeys2 = ['portefolje', ...Object.keys(SNAPSHOT_INDEKSER)]; const vals = chartData.flatMap(d => allKeys2.map(k => d[k]).filter(v => v !== undefined && v !== null)); if (vals.length === 0) return [0]; const min = Math.min(...vals); const max = Math.max(...vals); const step = max - min <= 20 ? 5 : 10; const lo = Math.floor(min / step) * step - step; const hi = Math.ceil(max / step) * step + step; const t = []; for (let i = lo; i <= hi; i += step) t.push(i); return t; })()} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                                  labelFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return dato; const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                  formatter={(v, name) => [(v >= 0 ? '+' : '') + v.toFixed(1) + '%', name === 'Pensum-forslaget' ? 'Pensum-forslaget' : name]} />
                                <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="portefolje" stroke="#1B3A5F" strokeWidth={3} dot={false} name="Pensum-forslaget" />
                                {Object.entries(SNAPSHOT_INDEKSER).map(([navn, cfg]) => (
                                  <Line key={navn} type="monotone" dataKey={navn} stroke={cfg.farge} strokeWidth={1.5} dot={false} strokeDasharray={cfg.dash} connectNulls />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 justify-center">
                              <div className="flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#1B3A5F10', color: '#1B3A5F' }}>
                                <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: '#1B3A5F' }}></div>
                                Pensum-forslaget: <span className={erGyldigTall(avkastninger.portefolje) ? (avkastninger.portefolje >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}>
                                  {erGyldigTall(avkastninger.portefolje) ? (avkastninger.portefolje >= 0 ? '+' : '') + avkastninger.portefolje.toFixed(1) + '%' : '—'}
                                </span>
                              </div>
                              {Object.entries(SNAPSHOT_INDEKSER).map(([navn, cfg]) => {
                                const avk = avkastninger[navn];
                                return (
                                  <div key={navn} className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <div className="w-4 h-0" style={{ borderTop: '2px dashed ' + cfg.farge }}></div>
                                    <span>{navn}:</span>
                                    <span className={erGyldigTall(avk) ? (avk >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}>
                                      {erGyldigTall(avk) ? (avk >= 0 ? '+' : '') + avk.toFixed(1) + '%' : '—'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Nedsiderisiko (drawdown) graf — siste 5 år */}
                    {(() => {
                      const ddStartDato = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1);
                      // Bygg drawdown-serier for portefølje + indekser
                      const INDEKS_DD = {
                        'MSCI World': { feedKey: 'msci-world', farge: PENSUM_COLORS.navy, dash: '6 3' },
                        'Oslo Børs': { feedKey: 'oslo-bors', farge: PENSUM_COLORS.salmon, dash: '3 3' },
                      };

                      // Hjelpefunksjon: konverter daglige verdier til drawdown-serie
                      const byggDrawdownSerie = (data, startDato) => {
                        if (!data?.length) return [];
                        const filtrert = data.filter(d => {
                          const dt = parseHistorikkDato(d.dato);
                          return dt && dt >= startDato && erGyldigTall(d.verdi);
                        });
                        if (filtrert.length < 2) return [];
                        let peak = filtrert[0].verdi;
                        return filtrert.map(d => {
                          if (d.verdi > peak) peak = d.verdi;
                          return { dato: d.dato, dd: peak > 0 ? parseFloat((((d.verdi - peak) / peak) * 100).toFixed(2)) : 0 };
                        });
                      };

                      // Portefølje: vektet drawdown fra daglige data
                      const portProdIds = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
                      const ddTotalVekt = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;
                      const portDaglig = {};
                      const allePortDatoer = new Set();
                      portProdIds.forEach(id => {
                        const hist = produktHistorikk?.[id];
                        if (!hist?.data?.length) return;
                        portDaglig[id] = {};
                        hist.data.forEach(d => {
                          const dt = parseHistorikkDato(d.dato);
                          if (dt && dt >= ddStartDato && erGyldigTall(d.verdi)) {
                            allePortDatoer.add(d.dato);
                            portDaglig[id][d.dato] = d.verdi;
                          }
                        });
                      });
                      // Bygg vektet porteføljeserie (daglig)
                      const portDatoerSortert = Array.from(allePortDatoer).sort();
                      const portStartVerdier = {};
                      portProdIds.forEach(id => {
                        if (portDaglig[id]) {
                          const forsteDato = portDatoerSortert.find(d => portDaglig[id][d] !== undefined);
                          if (forsteDato) portStartVerdier[id] = portDaglig[id][forsteDato];
                        }
                      });
                      const portVektetSerie = portDatoerSortert.map(dato => {
                        let vektet = 0; let totV = 0;
                        portProdIds.forEach(id => {
                          const v = portDaglig[id]?.[dato];
                          const sv = portStartVerdier[id];
                          if (v !== undefined && sv) {
                            const allok = pensumAllokering.find(a => a.id === id);
                            if (allok) {
                              vektet += (v / sv) * (allok.vekt / ddTotalVekt);
                              totV += allok.vekt / ddTotalVekt;
                            }
                          }
                        });
                        return { dato, verdi: totV > 0 ? vektet / totV : null };
                      }).filter(d => d.verdi !== null);

                      // Beregn drawdown for porteføljen
                      let portPeak = 0;
                      const portDD = portVektetSerie.map(d => {
                        if (d.verdi > portPeak) portPeak = d.verdi;
                        return { dato: d.dato, dd: portPeak > 0 ? parseFloat((((d.verdi - portPeak) / portPeak) * 100).toFixed(2)) : 0 };
                      });

                      // Bygg indeks-drawdowns
                      const indeksDD = {};
                      Object.entries(INDEKS_DD).forEach(([navn, cfg]) => {
                        const hist = DATAFEED_INDEKS_HISTORIKK?.[cfg.feedKey];
                        if (hist?.data) {
                          indeksDD[navn] = byggDrawdownSerie(hist.data, ddStartDato);
                        }
                      });

                      // Samle alle datoer og bygg chartData
                      const alleDDDatoer = new Set();
                      portDD.forEach(d => alleDDDatoer.add(d.dato));
                      Object.values(indeksDD).forEach(serie => serie.forEach(d => alleDDDatoer.add(d.dato)));
                      const ddSorterteDatoer = Array.from(alleDDDatoer).sort();

                      // Lag lookup maps
                      const portDDMap = {};
                      portDD.forEach(d => { portDDMap[d.dato] = d.dd; });
                      const indeksDDMaps = {};
                      Object.entries(indeksDD).forEach(([navn, serie]) => {
                        indeksDDMaps[navn] = {};
                        serie.forEach(d => { indeksDDMaps[navn][d.dato] = d.dd; });
                      });

                      // Sample ned til ca månedlig for ytelse (ta hver ~20. punkt)
                      const sampleRate = Math.max(1, Math.floor(ddSorterteDatoer.length / 200));
                      const ddChartData = ddSorterteDatoer
                        .filter((_, i) => i % sampleRate === 0 || i === ddSorterteDatoer.length - 1)
                        .map(dato => {
                          const punkt = { dato };
                          if (portDDMap[dato] !== undefined) punkt['Pensum-forslaget'] = portDDMap[dato];
                          Object.keys(indeksDDMaps).forEach(navn => {
                            if (indeksDDMaps[navn][dato] !== undefined) punkt[navn] = indeksDDMaps[navn][dato];
                          });
                          return punkt;
                        });

                      if (ddChartData.length < 5) return null;

                      // Finn maks drawdown per serie for oppsummering
                      const portMaxDD = portDD.length > 0 ? Math.min(...portDD.map(d => d.dd)) : 0;
                      const indeksMaxDD = {};
                      Object.entries(indeksDD).forEach(([navn, serie]) => {
                        indeksMaxDD[navn] = serie.length > 0 ? Math.min(...serie.map(d => d.dd)) : 0;
                      });

                      return (
                        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #FEE2E2', background: 'linear-gradient(to bottom, #FFF5F5, #FFFFFF)' }}>
                          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #FEE2E2' }}>
                            <div>
                              <h4 className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Risiko og nedsidebeskyttelse</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Drawdown fra løpende toppverdi (0% = all-time high i perioden)</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                Portefølje maks: {portMaxDD.toFixed(1)}%
                              </span>
                              {Object.entries(indeksMaxDD).map(([navn, dd]) => (
                                <span key={navn} className="text-xs text-gray-500">
                                  {navn}: {dd.toFixed(1)}%
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="p-5">
                            <ResponsiveContainer width="100%" height={280}>
                              <ComposedChart data={ddChartData} margin={{ top: 5, right: 30, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                                <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                                  tickFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return ''; const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                  interval={Math.max(1, Math.floor(ddChartData.length / 10))} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1) + '%'} domain={['dataMin - 1', 0]} />
                                <Tooltip
                                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #FEE2E2' }}
                                  labelFormatter={formatHistorikkEtikett}
                                  formatter={(v, name) => [v.toFixed(2) + '%', name]} />
                                <Legend verticalAlign="bottom" height={36} />
                                <ReferenceLine y={0} stroke="#D1D5DB" strokeWidth={1.5} />
                                <Area type="monotone" dataKey="Pensum-forslaget" stroke={PENSUM_COLORS.teal} fill={PENSUM_COLORS.teal} fillOpacity={0.15} strokeWidth={2.5} dot={false} name="Pensum-forslaget" />
                                {Object.entries(INDEKS_DD).map(([navn, cfg]) => (
                                  <Line key={navn} type="monotone" dataKey={navn} stroke={cfg.farge} strokeWidth={1.5} dot={false} strokeDasharray={cfg.dash} name={navn} />
                                ))}
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="text-xs text-gray-400 p-4 bg-gray-50/80 rounded-lg border border-gray-100">
                      <strong>Merk:</strong> Alle grafer viser prosentvis avkastning fra periodens start. Den tykke linjen viser Pensum-forslagets vektede portefølje. Historisk avkastning er ingen garanti for fremtidig avkastning. Kilde: {DATAFEED_KILDE}.
                    </div>
                  </div>
                );
              })()}
            </div>

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
            'Oslo Børs': { farge: PENSUM_COLORS.navy, feedKey: 'oslo-bors' },
            'Norske Statsobl.': { farge: PENSUM_COLORS.gray, feedKey: 'norske-statsobl' },
          };

          // Beregn årsavkastning fra historiske daglige data
          const beregnAarsavkastningFraIndeks = (feedKey, aar) => {
            const indeks = DATAFEED_INDEKS_HISTORIKK?.[feedKey];
            if (!indeks?.data?.length) return null;
            const startDato = new Date(aar, 0, 1);
            const sluttDato = aar === 2026 ? RAPPORT_DATO_OBJEKT : new Date(aar, 11, 31);
            const sortert = indeks.data.filter(d => {
              const dato = parseHistorikkDato(d.dato);
              return dato && erGyldigTall(d.verdi);
            });
            const startKandidat = sortert.filter(d => parseHistorikkDato(d.dato) <= startDato).slice(-1)[0]
              || sortert.find(d => parseHistorikkDato(d.dato) >= startDato);
            const sluttKandidat = sortert.filter(d => {
              const dato = parseHistorikkDato(d.dato);
              return dato && dato >= startDato && dato <= sluttDato;
            }).slice(-1)[0];
            if (!startKandidat || !sluttKandidat || startKandidat === sluttKandidat || !erGyldigTall(startKandidat.verdi) || startKandidat.verdi === 0) return null;
            return ((sluttKandidat.verdi / startKandidat.verdi) - 1) * 100;
          };

          // Bygg REFERANSE_DATA med årlige avkastninger fra historikk
          const REFERANSE_DATA = Object.entries(INDEKS_CONFIG).reduce((acc, [navn, cfg]) => {
            const data = {};
            for (let aar = 2016; aar <= 2026; aar++) {
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
            const produktMap = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].reduce((acc, p) => {
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

                    const AAR_KOLONNER = [2022, 2023, 2024, 2025, 2026];

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
          const periodeStartDato = (() => {
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
          const pensumProdListe = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer];
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
                return dato && dato >= periodeStartDato;
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
                  return dato && dato >= periodeStartDato;
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

            // External funds — build yearly series from annual returns (a15-a25), then filter by periodeStartDato
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
                // Filter by periodeStartDato and convert to % from start
                const filtrert = rawSerie.filter(d => {
                  const parsed = parseHistorikkDato(d.dato);
                  return parsed && parsed >= periodeStartDato;
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
                return parsed && parsed >= periodeStartDato;
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
                return parsed && parsed >= periodeStartDato;
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
            const vektede = pensumAllokering.filter(a => a.vekt > 0);
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
            return regioner.map(r => {
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

              // Beregn månedlige avkastninger (differanser i indekserte verdier)
              const maanedligAvk = [];
              for (let i = 1; i < verdier.length; i++) {
                maanedligAvk.push(verdier[i] - verdier[i - 1]);
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

              // Sharpe ratio (risikofri rente ~ 3%)
              const risikofriRente = 3;
              const sharpe = annualVol > 0 ? (annualisert - risikofriRente) / annualVol : 0;

              // Max drawdown
              let maxDD = 0;
              let peak = verdier[0];
              for (let i = 1; i < verdier.length; i++) {
                if (verdier[i] > peak) peak = verdier[i];
                const dd = peak > 0 ? ((verdier[i] - peak) / (100 + peak)) * 100 : 0;
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
                                          {f.r1y !== undefined ? `${f.r1y > 0 ? '+' : ''}${f.r1y.toFixed(1)}%` : '\u2014'}
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums" style={{ color: f.r3y > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                                          {f.r3y !== undefined ? `${f.r3y > 0 ? '+' : ''}${f.r3y.toFixed(1)}%` : '\u2014'}
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums" style={{ color: f.r5y > 0 ? PENSUM_COLORS.teal : PENSUM_COLORS.salmon }}>
                                          {f.r5y !== undefined ? `${f.r5y > 0 ? '+' : ''}${f.r5y.toFixed(1)}%` : '\u2014'}
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
                                        <span className="text-gray-400 w-10 text-right">{andel}%</span>
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
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + '%'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step - step, Math.ceil(dataMax / step) * step + step]; }} />
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
                                    {p.value >= 0 ? '+' : ''}{p.value.toFixed(1).replace('.', ',')}%
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
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
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
                                          {p.value >= 0 ? '+' : ''}{p.value.toFixed(2).replace('.', ',')}%
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
                                  return <text x={x + width / 2} y={y - 4} fill="#4B5563" textAnchor="middle" fontSize={8} fontWeight={600}>{value >= 0 ? '+' : ''}{value.toFixed(1)}%</text>;
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
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
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
                                          {p.value >= 0 ? '+' : ''}{p.value.toFixed(2).replace('.', ',')}%
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
                                  return <text x={x + width / 2} y={y - 4} fill="#4B5563" textAnchor="middle" fontSize={8} fontWeight={600}>{value >= 0 ? '+' : ''}{value.toFixed(1)}%</text>;
                                }} />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        )}

                        {/* Nøkkeltall — risikometrikker */}
                        {fondSammenligningVisning === 'nokkeltall' && nokkeltallData && nokkeltallData.length > 0 && (() => {
                          const metrikker = [
                            { key: 'totalAvk', label: 'Total avkastning', suffix: '%', desc: 'Indeksert avkastning i valgt periode' },
                            { key: 'annualisert', label: 'Annualisert avk.', suffix: '% p.a.', desc: 'Geometrisk gjennomsnittlig årlig avkastning' },
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
                                              {m.key === 'sharpe' ? val.toFixed(2) : (val >= 0 && m.key !== 'maxDrawdown' ? '+' : '') + val.toFixed(1).replace('.', ',') + m.suffix}
                                            </span>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-3 text-[10px] text-gray-400 px-1">
                                Beregnet fra månedlige datapunkter i valgt periode. Sharpe ratio bruker risikofri rente på 3%. Volatilitet er annualisert standardavvik.
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
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
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
                                          <span className="font-semibold tabular-nums ml-3 text-gray-800">{p.value.toFixed(1)}%</span>
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
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
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
                                          <span className="font-semibold tabular-nums ml-3 text-gray-800">{p.value.toFixed(1)}%</span>
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
                                    <td className="py-2 px-3 text-right text-gray-600 tabular-nums">{f.sd3y ? `${f.sd3y.toFixed(1)}%` : '\u2014'}</td>
                                    <td className="py-2 px-3 text-gray-600">
                                      {f.stVal || f.stCore || f.stGro ? (
                                        <div className="flex gap-1">
                                          {f.stVal ? <span className="text-[10px] px-1 py-0.5 rounded bg-blue-50 text-blue-600">V {f.stVal.toFixed(0)}%</span> : null}
                                          {f.stCore ? <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">C {f.stCore.toFixed(0)}%</span> : null}
                                          {f.stGro ? <span className="text-[10px] px-1 py-0.5 rounded bg-green-50 text-green-600">G {f.stGro.toFixed(0)}%</span> : null}
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
                        {AAR_KOLONNER.map(a => <th key={a} className="py-3 px-2 text-center font-semibold text-gray-600 min-w-[56px]">{a === 2026 ? '2026 YTD' : a}</th>)}
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
                                    {v >= 0 ? '+' : ''}{v.toFixed(1)}%
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
                        {AAR_KOLONNER.map(a => <th key={a} className="py-3 px-2 text-center font-semibold text-gray-600 min-w-[56px]">{a === 2026 ? '2026 YTD' : a}</th>)}
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
                                    {v >= 0 ? '+' : ''}{v.toFixed(1)}%
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
                  '1y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                  '3y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                  '5y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1),
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
                const alleProdukter2 = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer];
                const sortedBySharpe = [...allStatistikk].sort((a, b) => b.sharpe - a.sharpe);
                const sortedByAvk = [...allStatistikk].sort((a, b) => b.aarligAvkastning - a.aarligAvkastning);
                const sortedByVol = [...allStatistikk].sort((a, b) => a.standardavvik - b.standardavvik);
                const sortedByDD = [...allStatistikk].sort((a, b) => a.maxDrawdown - b.maxDrawdown);

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
                              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(1).replace('.', ',') + '%'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 30 ? 10 : dataMax - dataMin <= 100 ? 20 : 50; return [Math.floor(dataMin / step) * step - step, Math.ceil(dataMax / step) * step + step]; }} />
                              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                                labelFormatter={(d) => formatHistorikkEtikett(d)}
                                formatter={(v, name) => [v.toFixed(1).replace('.', ',') + '%', produktNavn2[name] || name]} />
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
                                  {s.aarligAvkastning >= 0 ? "+" : ""}{s.aarligAvkastning.toFixed(2)}%
                                </td>
                                <td className={"py-3 px-3 text-right " + (erGyldigTall(s.avkSidenOppstart) ? (s.avkSidenOppstart >= 0 ? "text-green-600" : "text-red-600") : "text-gray-400")}>
                                  {erGyldigTall(s.avkSidenOppstart) ? (s.avkSidenOppstart >= 0 ? "+" : "") + s.avkSidenOppstart.toFixed(2) + "% p.a." : "—"}
                                </td>
                                <td className="py-3 px-3 text-right text-gray-700">{s.standardavvik.toFixed(1)}%</td>
                                <td className="py-3 px-3 text-right">
                                  <span className={"font-bold px-2 py-0.5 rounded text-xs " + (s.sharpe >= 1 ? "bg-green-100 text-green-700" : s.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                                    {s.sharpe.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right text-red-600 font-medium">{s.maxDrawdown.toFixed(1)}%</td>
                                <td className={"py-3 px-3 text-right " + (s.totalAvkastning >= 0 ? "text-green-600" : "text-red-600")}>
                                  {s.totalAvkastning >= 0 ? "+" : ""}{s.totalAvkastning.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                        Sharpe beregnet med risikofri rente 3%. Volatilitet = annualisert standardavvik (månedlig). Maks DD = størst kursfall fra topp til bunn. Siden oppstart = annualisert avkastning fra desember 2019.
                      </div>
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
                              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(0) + "%"} domain={["dataMin - 2", 0]} />
                              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                                formatter={(v, name) => [v.toFixed(1) + "%", produktNavn2[name] || name]} />
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
                                          {v !== null ? v.toFixed(2) : '—'}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.teal }}></span> Lav (&lt;-0.2)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#D6E8E8' }}></span> Moderat (-0.2 – 0.2)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#E8D8CE' }}></span> Middels (0.2 – 0.5)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#D4B8A8' }}></span> Høy (0.5 – 0.8)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: PENSUM_COLORS.salmon }}></span> Svært høy (&gt;0.8)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                          <h3 className="text-base font-semibold text-white">Sharpe Ratio (høyere er bedre)</h3>
                        </div>
                        <div className="p-4">
                          <ResponsiveContainer width="100%" height={Math.max(200, allStatistikk.length * 38)}>
                            <BarChart data={sortedBySharpe} layout="vertical" margin={{ left: 120, right: 50, top: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(1)} />
                              <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn2[id] || id} width={120} />
                              <Tooltip formatter={(v) => [v.toFixed(2), "Sharpe"]} labelFormatter={id => produktNavn2[id] || id} />
                              <ReferenceLine x={1} stroke={PENSUM_COLORS.teal} strokeDasharray="4 4" />
                              <ReferenceLine x={0.5} stroke={PENSUM_COLORS.gold} strokeDasharray="4 4" />
                              <Bar dataKey="sharpe" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: v => v.toFixed(2) }}>
                                {sortedBySharpe.map(s => (
                                  <Cell key={s.id} fill={s.sharpe >= 1 ? PENSUM_COLORS.teal : s.sharpe >= 0.5 ? PENSUM_COLORS.gold : PENSUM_COLORS.salmon} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                          <h3 className="text-base font-semibold text-white">Volatilitet — annualisert standardavvik</h3>
                        </div>
                        <div className="p-4">
                          <ResponsiveContainer width="100%" height={Math.max(200, allStatistikk.length * 38)}>
                            <BarChart data={sortedByVol} layout="vertical" margin={{ left: 120, right: 50, top: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(0) + "%"} />
                              <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn2[id] || id} width={120} />
                              <Tooltip formatter={(v) => [v.toFixed(1) + "%", "Volatilitet"]} labelFormatter={id => produktNavn2[id] || id} />
                              <Bar dataKey="standardavvik" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: v => v.toFixed(1) + "%" }}>
                                {sortedByVol.map(s => (
                                  <Cell key={s.id} fill={produktFarger2[s.id] || PENSUM_COLORS.darkBlue} fillOpacity={0.85} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <h3 className="text-base font-semibold text-white">Maksimalt kursfall (Max Drawdown) — lavere er bedre</h3>
                      </div>
                      <div className="p-4">
                        <ResponsiveContainer width="100%" height={Math.max(180, allStatistikk.length * 38)}>
                          <BarChart data={sortedByDD} layout="vertical" margin={{ left: 120, right: 70, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(0) + "%"} />
                            <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn2[id] || id} width={120} />
                            <Tooltip formatter={(v) => [v.toFixed(1) + "%", "Maks drawdown"]} labelFormatter={id => produktNavn2[id] || id} />
                            <Bar dataKey="maxDrawdown" radius={[0, 4, 4, 0]} fill={PENSUM_COLORS.salmon} fillOpacity={0.85}
                              label={{ position: "right", fontSize: 10, fill: PENSUM_COLORS.salmon, formatter: v => v.toFixed(1) + "%" }} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {allStatistikk.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#E8F0F0', borderColor: '#B8D4D4' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.teal }}>Beste Sharpe Ratio</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedBySharpe[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.teal }}>{sortedBySharpe[0].sharpe.toFixed(2)}</div>
                          <div className="text-xs mt-1" style={{ color: '#4A8A8A' }}>{sortedBySharpe[0].aarligAvkastning.toFixed(1)}% p.a. / {sortedBySharpe[0].standardavvik.toFixed(1)}% vol.</div>
                        </div>
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#E8F0F4', borderColor: '#B8D0DB' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.lightBlue }}>Høyest avkastning</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedByAvk[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.lightBlue }}>{sortedByAvk[0].aarligAvkastning.toFixed(2)}% p.a.</div>
                          <div className="text-xs mt-1" style={{ color: '#5A8DA5' }}>{sortedByAvk[0].sharpe.toFixed(2)} Sharpe / {sortedByAvk[0].standardavvik.toFixed(1)}% vol.</div>
                        </div>
                        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#FDF6F2', borderColor: '#E8CFC2' }}>
                          <div className="text-xs font-medium mb-2" style={{ color: PENSUM_COLORS.salmon }}>Lavest risiko</div>
                          <div className="font-bold text-lg" style={{ color: PENSUM_COLORS.darkBlue }}>{produktNavn2[sortedByVol[0].id]}</div>
                          <div className="font-semibold" style={{ color: PENSUM_COLORS.salmon }}>{sortedByVol[0].standardavvik.toFixed(1)}% vol.</div>
                          <div className="text-xs mt-1" style={{ color: '#B8917D' }}>{sortedByVol[0].aarligAvkastning.toFixed(1)}% p.a. / Sharpe: {sortedByVol[0].sharpe.toFixed(2)}</div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <strong>Viktig informasjon:</strong> Historisk avkastning er ingen garanti for fremtidig avkastning. Sharpe Ratio er beregnet med risikofri rente på 3% p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det størst relative kursfallet fra topp til bunn i den valgte perioden. Korrelasjonsmatrise viser samvariasjon mellom produkter — lav korrelasjon indikerer bedre diversifisering. Store deler av historikken før fondenes oppstart er estimert. Kilde: {DATAFEED_KILDE}.
                    </div>
                  </>
                );
              })()}

            </div>
          );
        })()}

        {activeTab === 'rapport' && (() => {
          // Beregn alle data for rapporten
          const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
          const valgteProdukterRapport = pensumAllokering.filter(a => a.vekt > 0).map(a => {
            const produkt = alleProdukt.find(p => p.id === a.id);
            const stat1y = beregnProduktStatistikk(produktHistorikk[a.id], new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1));
            const stat3y = beregnProduktStatistikk(produktHistorikk[a.id], new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1));
            const stat5y = beregnProduktStatistikk(produktHistorikk[a.id], new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1));
            const fAvk = produkt?.forventetAvkastning ?? produktRapportMeta?.[a.id]?.expectedReturn;
            const fYield = produkt?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
            return { ...a, produkt, stat1y, stat3y, stat5y, fAvk, fYield };
          }).sort((a, b) => b.vekt - a.vekt);

          // Vektede porteføljenøkkeltall
          let yieldSum = 0, yieldTotal = 0;
          pensumAllokering.forEach(a => {
            const p = alleProdukt.find(pp => pp.id === a.id);
            const y = p?.forventetYield ?? produktRapportMeta?.[a.id]?.expectedYield;
            if (erGyldigTall(y) && a.vekt > 0) { yieldSum += y * a.vekt; yieldTotal += a.vekt; }
          });
          const vektetYield = yieldTotal > 0 ? yieldSum / yieldTotal : 0;

          const produktFarger = [PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green, PENSUM_COLORS.midBlue, PENSUM_COLORS.gray];

          const formatAvk = (v) => erGyldigTall(v) ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—';
          const avkFarge = (v) => erGyldigTall(v) ? (v >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400';

          return (
          <div className="space-y-6 max-w-4xl mx-auto" id="rapport-container">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* === FORSIDE (cover) === */}
              <div data-rapport-slide="cover" className="relative overflow-hidden flex" style={{ backgroundColor: PENSUM_COLORS.darkBlue, minHeight: '520px' }}>
                {/* Left: Main content area */}
                <div className="relative z-10 flex-1 p-10 flex flex-col justify-between" style={{ minHeight: '520px' }}>
                  {/* Top: Logo */}
                  <div>
                    <img src={PENSUM_LOGO} alt="Pensum" className="h-14" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>

                  {/* Center: Title & Client */}
                  <div className="flex-1 flex flex-col justify-center py-8">
                    <div className="text-sm font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: PENSUM_COLORS.salmon }}>Investeringsforslag</div>
                    <h1 className="text-4xl font-bold text-white mb-1" style={{ lineHeight: '1.15' }}>{kundeNavn || kundeSelskap || 'Investor'}</h1>
                    {kundeNavn && kundeSelskap && <p className="text-lg text-blue-200 mt-1">{kundeSelskap}</p>}
                  </div>

                  {/* Bottom: Metadata — advisor + date together */}
                  <div className="border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex flex-wrap gap-x-12 gap-y-3">
                      <div><span className="text-xs uppercase tracking-wider" style={{ color: PENSUM_COLORS.lightBlue }}>Rådgiver</span><p className="text-sm font-semibold text-white mt-0.5">{radgiver || '—'}</p></div>
                      <div><span className="text-xs uppercase tracking-wider" style={{ color: PENSUM_COLORS.lightBlue }}>Dato</span><p className="text-sm font-semibold text-white mt-0.5">{formatDateEuro(dato)}</p></div>
                    </div>
                  </div>
                </div>

                {/* Right: Decorative panel — atmospheric only */}
                <div className="relative w-2/5 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <div className="absolute" style={{ top: '-5%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>
                  <div className="absolute" style={{ top: '15%', right: '5%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
                  <div className="absolute bottom-8 right-10">
                    <div className="text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Pensum Asset Management</div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-10">

                {renderTilleggsmodulerVedPosisjon('etter-cover')}

                {/* === PERSONLIG FØLGEBREV === */}
                {isStandardModulAktiv('folgebrev') && renderTilleggsmodulInnhold('folgebrev')}

                {/* === UTGANGSPUNKT OG INVESTERINGSMANDAT === */}
                {isStandardModulAktiv('utgangspunkt') && <div data-rapport-slide="utgangspunkt" className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Utgangspunkt og investeringsmandat</h2>
                    <div className="h-0.5 mt-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Forutsetninger */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                      <h3 className="text-lg font-bold mb-5" style={{ color: PENSUM_COLORS.darkBlue }}>Forutsetninger</h3>
                      <div className="space-y-0">
                        {[
                          { label: 'Investerbar kapital', value: formatCurrency(investertBelop !== null ? investertBelop : totalKapital) },
                          { label: 'Risikoprofil', value: valgtPensumProfil },
                          { label: 'Tidshorisont', value: horisont + ' år' },
                          { label: 'Målsetting', value: erGyldigTall(pensumForventetAvkastning) ? pensumForventetAvkastning.toFixed(1) + '% p.a.' : '—' },
                          { label: 'Likviditet', value: (() => { const likvide = valgteProdukterRapport.filter(p => p.produkt?.likviditet === 'likvid').reduce((s, p) => s + p.vekt, 0); return likvide >= 90 ? 'Daglig' : likvide >= 50 ? 'Delvis daglig' : 'Begrenset'; })() },
                        ].map((row, i) => (
                          <div key={i} className="flex items-baseline justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-500">{row.label}</span>
                            <span className="text-sm font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Porteføljelogikk */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                      <h3 className="text-lg font-bold mb-5" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljelogikk</h3>
                      <div className="space-y-5">
                        {[
                          { num: '1', title: 'Bygg robust kjerne', desc: 'Kjerneporteføljen gir bred global eksponering og fungerer som hovedmotor for langsiktig verdiskaping.', color: PENSUM_COLORS.darkBlue },
                          { num: '2', title: 'Stabiliser porteføljen', desc: 'Rentedelen skal bidra med løpende avkastning og redusere svingningene i samlet portefølje.', color: PENSUM_COLORS.teal },
                          { num: '3', title: 'Bruk satellitter selektivt', desc: 'Utvalgte satellitter brukes for å øke diversifiseringen og styrke avkastningspotensialet over tid.', color: PENSUM_COLORS.salmon },
                        ].map((step) => (
                          <div key={step.num} className="flex gap-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: step.color }}>{step.num}</div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{step.title}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rådgivers vurdering */}
                    <div className="rounded-xl p-6 text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                      <h3 className="text-lg font-bold mb-4">Rådgivers vurdering</h3>
                      <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        Forslaget er satt sammen for å gi en robust og balansert portefølje, der hver byggestein har en tydelig rolle i helheten.
                      </p>
                      <div className="space-y-3">
                        {[
                          { color: PENSUM_COLORS.lightBlue, text: 'Porteføljen er bygget for å stå bedre gjennom svingninger enn en ren aksjeportefølje' },
                          { color: PENSUM_COLORS.teal, text: 'Sammensetningen kombinerer langsiktig verdiskaping med løpende avkastning og stabilitet' },
                          { color: PENSUM_COLORS.salmon, text: 'De utvalgte løsningene utfyller hverandre på tvers av aktivaklasse, geografi og investeringsstil' },
                        ].map((punkt, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: punkt.color }}></div>
                            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{punkt.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>}

                {renderTilleggsmodulerVedPosisjon('etter-utgangspunkt')}

                {/* === HVORDAN PORTEFØLJEN ER BYGGET === */}
                {isStandardModulAktiv('byggesteiner') && <div data-rapport-slide="byggesteiner" className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Hvordan porteføljen er bygget</h2>
                    <div className="h-0.5 mt-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">Porteføljen er bygget rundt tre tydelige roller: en bred kjerne, en stabiliserende rentedel og utvalgte satellitter som kan bidra til meravkastning.</p>
                  </div>

                  {(() => {
                    // Klassifiser produkter i byggesteiner
                    const kjerne = valgteProdukterRapport.filter(p => {
                      const cat = produktRapportMeta?.[p.id]?.category;
                      return cat === 'equity-core' || cat === 'balanced';
                    });
                    const stabilisator = valgteProdukterRapport.filter(p => {
                      const cat = produktRapportMeta?.[p.id]?.category;
                      return cat === 'fixed-income' || cat === 'fixed-income-specialist';
                    });
                    const satellitter = valgteProdukterRapport.filter(p => {
                      const cat = produktRapportMeta?.[p.id]?.category;
                      return cat === 'equity-satellite' || cat === 'equity-nordic' || cat === 'equity-thematic' || cat === 'equity-sector';
                    });

                    const kjerneVekt = kjerne.reduce((s, p) => s + p.vekt, 0);
                    const stabVekt = stabilisator.reduce((s, p) => s + p.vekt, 0);
                    const satVekt = satellitter.reduce((s, p) => s + p.vekt, 0);

                    const byggesteiner = [
                      {
                        type: 'KJERNE',
                        vekt: kjerneVekt,
                        produkter: kjerne,
                        color: PENSUM_COLORS.darkBlue,
                        borderColor: PENSUM_COLORS.lightBlue,
                        tittel: kjerne.map(p => p.navn?.replace('Pensum ', '')).join(', ') || 'Kjerneeksponering',
                        beskrivelse: 'Gir bred eksponering og fungerer som hovedmotor for langsiktig verdiskaping.',
                        bidrag: ['Global basiseksponering', 'God forvalterdiversifisering', 'Tydelig rolle som hovedmotor']
                      },
                      {
                        type: 'STABILISATOR',
                        vekt: stabVekt,
                        produkter: stabilisator,
                        color: PENSUM_COLORS.teal,
                        borderColor: PENSUM_COLORS.teal,
                        tittel: stabilisator.map(p => p.navn?.replace('Pensum ', '')).join(', ') || 'Rentedel',
                        beskrivelse: 'Skal dempe svingninger og bidra med løpende avkastning i samlet portefølje.',
                        bidrag: ['Forv. yield ' + (stabilisator.length > 0 ? (stabilisator.reduce((s, p) => s + (p.produkt?.forventetYield || 0) * p.vekt, 0) / Math.max(stabVekt, 1)).toFixed(1) : '0') + '%', 'Lavere svingninger enn aksjer', 'Demper total porteføljerisiko']
                      },
                      {
                        type: 'SATELLITTER',
                        vekt: satVekt,
                        produkter: satellitter,
                        color: PENSUM_COLORS.salmon,
                        borderColor: PENSUM_COLORS.salmon,
                        tittel: satellitter.map(p => p.navn?.replace('Pensum ', '')).join(', ') || 'Satellitter',
                        beskrivelse: 'Kompletterer kjernen med mer selektive investeringer som kan styrke diversifiseringen og øke avkastningspotensialet.',
                        bidrag: ['Meravkastningspotensial', 'Norsk eksponering og lokal innsikt', 'Tematisk diversifisering']
                      }
                    ].filter(b => b.vekt > 0);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {byggesteiner.map((b) => (
                          <div key={b.type} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="w-full h-1" style={{ backgroundColor: b.borderColor }}></div>
                            <div className="p-5">
                              <div className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-3" style={{ backgroundColor: b.color }}>{b.type}</div>
                              <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{b.vekt.toFixed(0)}%</span>
                                <span className="text-sm text-gray-400">av porteføljen</span>
                              </div>
                              <p className="text-sm font-bold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>{b.tittel}</p>
                              <p className="text-xs text-gray-500 leading-relaxed mb-4">{b.beskrivelse}</p>
                              <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-semibold text-gray-400 mb-2">Rolle i porteføljen</p>
                                <div className="space-y-2">
                                  {b.bidrag.map((punkt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }}></div>
                                      <span className="text-xs text-gray-600">{punkt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>}

                {renderTilleggsmodulerVedPosisjon('etter-byggesteiner')}

                {/* === PENSUM PORTEFØLJESAMMENSETNING (kombinert allokering + historisk) === */}
                {(isStandardModulAktiv('allokering') || isStandardModulAktiv('historisk')) && <><div data-rapport-slide="allokering">
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">Porteføljesammensetningen kombinerer bred eksponering, løpende avkastning og utvalgte aktive valg.</p>

                  {/* Two equal donuts: Porteføljefordeling + Aktivafordeling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Porteføljefordeling */}
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                      <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljefordeling</h4>
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          <ResponsiveContainer width={150} height={150}>
                            <PieChart>
                              <Pie data={valgteProdukterRapport} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="vekt" paddingAngle={2} cornerRadius={4}>
                                {valgteProdukterRapport.map((p, idx) => (
                                  <Cell key={p.id} fill={produktFarger[idx % produktFarger.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          {valgteProdukterRapport.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: produktFarger[idx % produktFarger.length] }}></div>
                              <span className="flex-1 text-gray-700 leading-tight">{p.navn}</span>
                              <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: PENSUM_COLORS.darkBlue }}>{p.vekt.toFixed(0)}%</span>
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
                              <Pie data={pensumAktivafordeling.filter(p => p.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2} cornerRadius={4}>
                                {pensumAktivafordeling.filter(p => p.value > 0).map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => v + '%'} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2.5 flex-1">
                          {pensumAktivafordeling.filter(a => a.value > 0).map(a => (
                            <div key={a.name} className="flex items-center gap-2.5 text-sm">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }}></div>
                              <span className="flex-1 text-gray-700">{a.name}</span>
                              <span className="font-semibold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{a.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product table with dark header and Sharpe pills */}
                  <h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Pensum Porteføljesammensetning</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                          <th className="py-3 px-3 text-left text-white text-xs">Produkt</th>
                          <th className="py-3 px-2 text-center text-white text-xs">Vekt</th>
                          <th className="py-3 px-2 text-right text-blue-200 text-xs" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>1 år</th>
                          <th className="py-3 px-2 text-right text-blue-200 text-xs">3 år p.a.</th>
                          <th className="py-3 px-2 text-right text-blue-200 text-xs">5 år p.a.</th>
                          <th className="py-3 px-2 text-right text-white text-xs" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Volatilitet</th>
                          <th className="py-3 px-2 text-right text-white text-xs">Sharpe</th>
                          <th className="py-3 px-2 text-right text-white text-xs">Maks DD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valgteProdukterRapport.map((p, idx) => (
                          <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2.5 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: produktFarger[idx % produktFarger.length] }}></div>
                                {p.navn}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center text-xs text-gray-500">{p.vekt.toFixed(1)}%</td>
                            <td className={"py-2.5 px-2 text-right text-xs font-semibold " + avkFarge(p.stat1y?.totalAvkastning)} style={{ borderLeft: '1px solid #E5E7EB' }}>{formatAvk(p.stat1y?.totalAvkastning)}</td>
                            <td className={"py-2.5 px-2 text-right text-xs font-semibold " + avkFarge(p.stat3y?.aarligAvkastning)}>{formatAvk(p.stat3y?.aarligAvkastning)}</td>
                            <td className={"py-2.5 px-2 text-right text-xs font-semibold " + avkFarge(p.stat5y?.aarligAvkastning)}>{formatAvk(p.stat5y?.aarligAvkastning)}</td>
                            <td className="py-2.5 px-2 text-right text-xs text-gray-600" style={{ borderLeft: '1px solid #E5E7EB' }}>{p.stat5y ? p.stat5y.standardavvik.toFixed(1) + '%' : '—'}</td>
                            <td className="py-2.5 px-2 text-right">{p.stat5y ? <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " + (p.stat5y.sharpe >= 1 ? "bg-green-100 text-green-700" : p.stat5y.sharpe >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{p.stat5y.sharpe.toFixed(2)}</span> : <span className="text-gray-400 text-xs">—</span>}</td>
                            <td className="py-2.5 px-2 text-right text-xs text-red-600 font-medium">{p.stat5y ? p.stat5y.maxDrawdown.toFixed(1) + '%' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const totalVekt = valgteProdukterRapport.reduce((s, p) => s + p.vekt, 0);
                          const vektet1y = valgteProdukterRapport.reduce((s, p) => s + (erGyldigTall(p.stat1y?.totalAvkastning) ? p.vekt / 100 * p.stat1y.totalAvkastning : 0), 0);
                          const har1y = valgteProdukterRapport.some(p => erGyldigTall(p.stat1y?.totalAvkastning));
                          const vektet3y = valgteProdukterRapport.reduce((s, p) => s + (erGyldigTall(p.stat3y?.aarligAvkastning) ? p.vekt / 100 * p.stat3y.aarligAvkastning : 0), 0);
                          const har3y = valgteProdukterRapport.some(p => erGyldigTall(p.stat3y?.aarligAvkastning));
                          const vektet5y = valgteProdukterRapport.reduce((s, p) => s + (erGyldigTall(p.stat5y?.aarligAvkastning) ? p.vekt / 100 * p.stat5y.aarligAvkastning : 0), 0);
                          const har5y = valgteProdukterRapport.some(p => erGyldigTall(p.stat5y?.aarligAvkastning));
                          return (
                            <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                              <td className="py-2.5 px-3 font-bold text-white text-xs">Portefølje (vektet)</td>
                              <td className="py-2.5 px-2 text-center text-xs text-blue-200">{totalVekt.toFixed(1)}%</td>
                              <td className={"py-2.5 px-2 text-right text-xs font-bold " + (har1y ? (vektet1y >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')} style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>{har1y ? (vektet1y >= 0 ? '+' : '') + vektet1y.toFixed(1) + '%' : '—'}</td>
                              <td className={"py-2.5 px-2 text-right text-xs font-bold " + (har3y ? (vektet3y >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{har3y ? (vektet3y >= 0 ? '+' : '') + vektet3y.toFixed(1) + '%' : '—'}</td>
                              <td className={"py-2.5 px-2 text-right text-xs font-bold " + (har5y ? (vektet5y >= 0 ? 'text-green-300' : 'text-red-300') : 'text-gray-400')}>{har5y ? (vektet5y >= 0 ? '+' : '') + vektet5y.toFixed(1) + '%' : '—'}</td>
                              <td className="py-2.5 px-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}></td>
                              <td className="py-2.5 px-2"></td>
                              <td className="py-2.5 px-2"></td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400">Avkastning beregnet fra månedlige indeksverdier per {RAPPORT_DATO}. Sharpe (risikofri rente 3%). Volatilitet og maks drawdown basert på 5-årsperioden.</div>
                </div>

                {/* === PORTEFØLJENS HISTORISKE AVKASTNING (vektet) === */}
                <div data-rapport-slide="kalenderaar" className="rounded-xl p-5 border-2" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#F8FAFC' }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum-forslagets historiske avkastning (vektet)</h3>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    {[
                      { aar: '2026 YTD', key: 'aar2026' },
                      { aar: '2025', key: 'aar2025' },
                      { aar: '2024', key: 'aar2024' },
                      { aar: '2023', key: 'aar2023' },
                      { aar: '2022', key: 'aar2022' }
                    ].map(({ aar, key }) => (
                      <div key={aar} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] text-gray-500 mb-1 font-medium">{aar}</p>
                        <p className={"text-xl font-bold " + (erGyldigTall(beregnPensumHistorikk[key]) ? (beregnPensumHistorikk[key] >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>
                          {erGyldigTall(beregnPensumHistorikk[key]) ? (beregnPensumHistorikk[key] >= 0 ? '+' : '') + beregnPensumHistorikk[key].toFixed(1) + '%' : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div></>}

                {renderTilleggsmodulerVedPosisjon('etter-allokering')}
                {renderTilleggsmodulerVedPosisjon('etter-historisk')}

                {/* === SCENARIOANALYSE === */}
                {isStandardModulAktiv('scenarioanalyse') && (() => {
                  const kapital = investertBelop !== null ? investertBelop : totalKapital;
                  const baseAvk = erGyldigTall(pensumForventetAvkastning) ? pensumForventetAvkastning : 8;
                  const rapportPessAvk = scenarioLosninger.pessimistisk !== null ? scenarioLosninger.pessimistisk : Math.round((baseAvk * 0.45) * 10) / 10;
                  const rapportOptAvk = scenarioLosninger.optimistisk !== null ? scenarioLosninger.optimistisk : Math.round((baseAvk * 1.4) * 10) / 10;
                  const scenarioer = [
                    { id: 'pessimistisk', tittel: 'Pessimistisk', undertittel: 'Vedvarende uro', avk: rapportPessAvk, farge: '#DC2626', borderColor: '#DC2626', beskrivelse: 'Langvarig lavvekst, geopolitisk uro, utvidet volatilitet. Rentedelen beskytter, men aksjedelen gir begrenset avkastning.' },
                    { id: 'hoved', tittel: 'Hovedscenario', undertittel: 'Forventet utfall', avk: Math.round(baseAvk * 10) / 10, farge: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue, beskrivelse: 'Gradvis normalisering av renter, moderat global vekst, sterk aktiv fondsseleksjon som leverer meravkastning over indeks.' },
                    { id: 'optimistisk', tittel: 'Optimistisk', undertittel: 'Sterk medvind', avk: rapportOptAvk, farge: '#059669', borderColor: '#059669', beskrivelse: 'Sterkere vekst enn forventet, tiltagende produktivitet (AI), god renteutvikling. Satellittene kapitaliserer på oppside.' },
                  ];
                  // Generate scenario projection data for chart
                  const scenarioData = [];
                  for (let i = 0; i <= horisont; i++) {
                    const year = new Date().getFullYear() + i;
                    const row = { year };
                    scenarioer.forEach(s => {
                      row[s.id] = Math.round(kapital * Math.pow(1 + s.avk / 100, i));
                    });
                    scenarioData.push(row);
                  }
                  const formatSluttverdi = (v) => v > 1000000 ? (v / 1000000).toFixed(1) + ' MNOK' : formatCurrency(v);

                  return (
                    <div data-rapport-slide="scenarioanalyse" className="space-y-5 page-break-before">
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Scenarioanalyse</h2>
                        <div className="h-0.5 mt-2 w-32" style={{ backgroundColor: PENSUM_COLORS.teal }}></div>
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">Scenarioanalysen illustrerer mulig verdiutvikling i porteføljen over tid, basert på forutsetningene i modellen. Hensikten er å synliggjøre spennvidden i mulige utfall – ikke å forutsi faktisk avkastning.</p>
                      </div>

                      {/* Scenario cards */}
                      <div className="grid grid-cols-3 gap-5">
                        {scenarioer.map(s => {
                          const sluttverdi = Math.round(kapital * Math.pow(1 + s.avk / 100, horisont));
                          const erHoved = s.id === 'hoved';
                          return (
                            <div key={s.id} className={"rounded-xl overflow-hidden " + (erHoved ? "border-2 shadow-sm" : "border border-gray-100")} style={erHoved ? { borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#F8FAFC' } : { backgroundColor: 'white' }}>
                              <div className="w-full h-1.5" style={{ backgroundColor: s.borderColor }}></div>
                              <div className="p-5 space-y-3">
                                <div>
                                  <h3 className="text-lg font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{s.tittel}</h3>
                                  <p className="text-xs text-gray-400">{s.undertittel}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Forv. avkastning</p>
                                  <p className="text-2xl font-bold" style={{ color: s.farge }}>{s.avk}% p.a.</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Sluttverdi</p>
                                  <p className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatSluttverdi(sluttverdi)}</p>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.beskrivelse}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Scenario projection chart */}
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5">
                        <h4 className="text-sm font-semibold mb-4" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet utvikling over {horisont} år</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={scenarioData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(0) + 'M' : (v / 1000).toFixed(0) + 'k'} />
                            <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `År ${l}`} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }} />
                            <Area type="monotone" dataKey="optimistisk" name="Optimistisk" stroke="#059669" fill="#05966915" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                            <Area type="monotone" dataKey="hoved" name="Hovedscenario" stroke={PENSUM_COLORS.darkBlue} fill={PENSUM_COLORS.darkBlue + '20'} strokeWidth={2.5} dot={false} />
                            <Area type="monotone" dataKey="pessimistisk" name="Pessimistisk" stroke="#DC2626" fill="#DC262610" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <p className="text-[10px] text-gray-400 italic">Scenarioene er modellbaserte illustrasjoner. Faktisk avkastning vil kunne avvike vesentlig.</p>
                    </div>
                  );
                })()}

                {/* === PORTEFØLJE-AVKASTNING — STANDARDBILDER === */}
                {(isStandardModulAktiv('snapshot-1y') || isStandardModulAktiv('snapshot-3y') || isStandardModulAktiv('snapshot-5y') || isStandardModulAktiv('snapshot-drawdown')) && (() => {
                  const SNAP_FARGER = {
                    'global-core-active': PENSUM_COLORS.navy, 'global-edge': PENSUM_COLORS.lightBlue, 'basis': PENSUM_COLORS.salmon,
                    'global-hoyrente': PENSUM_COLORS.teal, 'nordisk-hoyrente': PENSUM_COLORS.purple, 'norge-a': PENSUM_COLORS.red,
                    'energy-a': PENSUM_COLORS.gold, 'banking-d': PENSUM_COLORS.midBlue, 'financial-d': PENSUM_COLORS.gray,
                  };
                  const rapValgteProdIds = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
                  const rapTotalVekt = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;

                  const RAP_INDEKSER = {
                    'MSCI World': { feedKey: 'msci-world', farge: PENSUM_COLORS.lightBlue, dash: '6 3' },
                    'Oslo Børs': { feedKey: 'oslo-bors', farge: PENSUM_COLORS.salmon, dash: '4 3' },
                    'Norske Statsobl.': { feedKey: 'norske-statsobl', farge: PENSUM_COLORS.gray, dash: '2 2' },
                  };

                  const buildRapSnapshotData = (periodYears) => {
                    const startDato = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - periodYears, RAPPORT_DATO_OBJEKT.getMonth(), 1);
                    const alleDatoer = new Set();
                    const produktMaps = {};
                    rapValgteProdIds.forEach(id => {
                      const hist = produktHistorikk[id];
                      if (hist?.data) {
                        const dMap = new Map();
                        hist.data.forEach(d => { const dt = parseHistorikkDato(d.dato); if (dt && dt >= startDato) { alleDatoer.add(d.dato); dMap.set(d.dato, d.verdi); } });
                        produktMaps[id] = { dMap, startVerdi: finnStartVerdiVedPeriode(hist.data, startDato) };
                      }
                    });
                    const indeksMaps = {};
                    Object.entries(RAP_INDEKSER).forEach(([navn, cfg]) => {
                      const hist = DATAFEED_INDEKS_HISTORIKK?.[cfg.feedKey];
                      if (hist?.data) {
                        const dMap = new Map();
                        hist.data.forEach(d => { const dt = parseHistorikkDato(d.dato); if (dt && dt >= startDato && erGyldigTall(d.verdi)) { alleDatoer.add(d.dato); dMap.set(d.dato, d.verdi); } });
                        const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                        if (startVerdi) indeksMaps[navn] = { dMap, startVerdi };
                      }
                    });
                    const sorterteDatoer = Array.from(alleDatoer).sort();
                    const chartData = sorterteDatoer.map(dato => {
                      const punkt = { dato };
                      let vektetPct = 0; let totalProdVekt = 0;
                      rapValgteProdIds.forEach(id => {
                        const pm = produktMaps[id];
                        if (pm) {
                          const verdi = pm.dMap.get(dato);
                          if (verdi !== undefined && pm.startVerdi) {
                            const pctReturn = ((verdi / pm.startVerdi) - 1) * 100;
                            const allok = pensumAllokering.find(a => a.id === id);
                            if (allok) { vektetPct += pctReturn * (allok.vekt / rapTotalVekt); totalProdVekt += allok.vekt / rapTotalVekt; }
                          }
                        }
                      });
                      if (totalProdVekt > 0) punkt['portefolje'] = vektetPct / totalProdVekt;
                      Object.entries(indeksMaps).forEach(([navn, im]) => {
                        const verdi = im.dMap.get(dato);
                        if (verdi !== undefined) punkt[navn] = ((verdi / im.startVerdi) - 1) * 100;
                      });
                      return punkt;
                    });
                    const avkastninger = {};
                    let vektetAvkR = 0;
                    rapValgteProdIds.forEach(id => {
                      const hist = produktHistorikk[id];
                      if (hist?.data && hist.data.length >= 2) {
                        const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                        const sluttVerdi = hist.data[hist.data.length - 1].verdi;
                        if (startVerdi) {
                          const avk = ((sluttVerdi / startVerdi) - 1) * 100;
                          const allok = pensumAllokering.find(a => a.id === id);
                          if (allok) vektetAvkR += avk * (allok.vekt / rapTotalVekt);
                        }
                      }
                    });
                    avkastninger['portefolje'] = vektetAvkR;
                    Object.entries(indeksMaps).forEach(([navn, im]) => {
                      const sortert = Array.from(im.dMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
                      if (sortert.length >= 2) {
                        const sluttVerdi = sortert[sortert.length - 1][1];
                        avkastninger[navn] = ((sluttVerdi / im.startVerdi) - 1) * 100;
                      }
                    });
                    return { chartData, avkastninger };
                  };

                  const rapPerioder = [
                    { label: '1 år', years: 1, modulId: 'snapshot-1y' },
                    { label: '3 år', years: 3, modulId: 'snapshot-3y' },
                    { label: '5 år', years: 5, modulId: 'snapshot-5y' }
                  ];

                  // Drawdown computation
                  const ddStartDato = new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1);
                  const INDEKS_DD_RAP = {
                    'MSCI World': { feedKey: 'msci-world', farge: PENSUM_COLORS.navy, dash: '6 3' },
                    'Oslo Børs': { feedKey: 'oslo-bors', farge: PENSUM_COLORS.salmon, dash: '3 3' },
                  };
                  const byggDrawdownSerieRap = (data, startDato) => {
                    if (!data?.length) return [];
                    const filtrert = data.filter(d => { const dt = parseHistorikkDato(d.dato); return dt && dt >= startDato && erGyldigTall(d.verdi); });
                    if (filtrert.length < 2) return [];
                    let peak = filtrert[0].verdi;
                    return filtrert.map(d => { if (d.verdi > peak) peak = d.verdi; return { dato: d.dato, dd: peak > 0 ? parseFloat((((d.verdi - peak) / peak) * 100).toFixed(2)) : 0 }; });
                  };
                  const portProdIdsDD = pensumAllokering.filter(a => a.vekt > 0).map(a => a.id);
                  const ddTotalVektR = pensumAllokering.filter(a => a.vekt > 0).reduce((s, a) => s + a.vekt, 0) || 1;
                  const portDagligR = {};
                  const allePortDatoerR = new Set();
                  portProdIdsDD.forEach(id => {
                    const hist = produktHistorikk?.[id];
                    if (!hist?.data?.length) return;
                    portDagligR[id] = {};
                    hist.data.forEach(d => { const dt = parseHistorikkDato(d.dato); if (dt && dt >= ddStartDato && erGyldigTall(d.verdi)) { allePortDatoerR.add(d.dato); portDagligR[id][d.dato] = d.verdi; } });
                  });
                  const portDatoerSortertR = Array.from(allePortDatoerR).sort();
                  const portStartVerdierR = {};
                  portProdIdsDD.forEach(id => {
                    if (portDagligR[id]) {
                      const forsteDato = portDatoerSortertR.find(d => portDagligR[id][d] !== undefined);
                      if (forsteDato) portStartVerdierR[id] = portDagligR[id][forsteDato];
                    }
                  });
                  const portVektetSerieR = portDatoerSortertR.map(dato => {
                    let vektet = 0; let totV = 0;
                    portProdIdsDD.forEach(id => {
                      const v = portDagligR[id]?.[dato]; const sv = portStartVerdierR[id];
                      if (v !== undefined && sv) { const allok = pensumAllokering.find(a => a.id === id); if (allok) { vektet += (v / sv) * (allok.vekt / ddTotalVektR); totV += allok.vekt / ddTotalVektR; } }
                    });
                    return { dato, verdi: totV > 0 ? vektet / totV : null };
                  }).filter(d => d.verdi !== null);
                  let portPeakR = 0;
                  const portDDR = portVektetSerieR.map(d => { if (d.verdi > portPeakR) portPeakR = d.verdi; return { dato: d.dato, dd: portPeakR > 0 ? parseFloat((((d.verdi - portPeakR) / portPeakR) * 100).toFixed(2)) : 0 }; });
                  const indeksDDR = {};
                  Object.entries(INDEKS_DD_RAP).forEach(([navn, cfg]) => {
                    const hist = DATAFEED_INDEKS_HISTORIKK?.[cfg.feedKey];
                    if (hist?.data) indeksDDR[navn] = byggDrawdownSerieRap(hist.data, ddStartDato);
                  });
                  const alleDDDatoerR = new Set();
                  portDDR.forEach(d => alleDDDatoerR.add(d.dato));
                  Object.values(indeksDDR).forEach(serie => serie.forEach(d => alleDDDatoerR.add(d.dato)));
                  const ddSorterteDatoerR = Array.from(alleDDDatoerR).sort();
                  const portDDMapR = {};
                  portDDR.forEach(d => { portDDMapR[d.dato] = d.dd; });
                  const indeksDDMapsR = {};
                  Object.entries(indeksDDR).forEach(([navn, serie]) => { indeksDDMapsR[navn] = {}; serie.forEach(d => { indeksDDMapsR[navn][d.dato] = d.dd; }); });
                  const sampleRateR = Math.max(1, Math.floor(ddSorterteDatoerR.length / 200));
                  const ddChartDataR = ddSorterteDatoerR
                    .filter((_, i) => i % sampleRateR === 0 || i === ddSorterteDatoerR.length - 1)
                    .map(dato => {
                      const punkt = { dato };
                      if (portDDMapR[dato] !== undefined) punkt['Pensum-forslaget'] = portDDMapR[dato];
                      Object.keys(indeksDDMapsR).forEach(navn => { if (indeksDDMapsR[navn][dato] !== undefined) punkt[navn] = indeksDDMapsR[navn][dato]; });
                      return punkt;
                    });
                  const portMaxDDR = portDDR.length > 0 ? Math.min(...portDDR.map(d => d.dd)) : 0;
                  const indeksMaxDDR = {};
                  Object.entries(indeksDDR).forEach(([navn, serie]) => { indeksMaxDDR[navn] = serie.length > 0 ? Math.min(...serie.map(d => d.dd)) : 0; });

                  return (
                    <div data-rapport-slide="snapshot-charts">
                      <h2 className="text-xl font-bold mb-2 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Historisk avkastning — benchmark</h2>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">Historikken understøtter en robust kombinasjon av avkastning og risiko over tid.</p>
                      <div className="space-y-6">
                        {rapPerioder.map(({ label, years, modulId }) => {
                          if (!isStandardModulAktiv(modulId)) return null;
                          const { chartData, avkastninger } = buildRapSnapshotData(years);
                          if (chartData.length < 2) return null;
                          return (
                            <div key={years} data-chart-type="performance" className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0', background: 'linear-gradient(to bottom, #FAFBFC, #FFFFFF)' }}>
                              <div className="px-5 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <h4 className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Siste {label} — prosentvis avkastning</h4>
                              </div>
                              <div className="p-5">
                                <ResponsiveContainer width="100%" height={380}>
                                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                                      tickFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return ''; const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                      interval={Math.max(1, Math.floor(chartData.length / (years <= 1 ? 6 : years <= 3 ? 8 : 10)))} />
                                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1).replace('.', ',') + '%'} domain={([dataMin, dataMax]) => { const step = dataMax - dataMin <= 20 ? 5 : 10; return [Math.floor(dataMin / step) * step - step, Math.ceil(dataMax / step) * step + step]; }} ticks={(() => { const allKeys = ['portefolje', ...Object.keys(RAP_INDEKSER)]; const vals = chartData.flatMap(d => allKeys.map(k => d[k]).filter(v => v !== undefined && v !== null)); if (vals.length === 0) return [0]; const min = Math.min(...vals); const max = Math.max(...vals); const step = max - min <= 20 ? 5 : 10; const lo = Math.floor(min / step) * step - step; const hi = Math.ceil(max / step) * step + step; const t = []; for (let i = lo; i <= hi; i += step) t.push(i); return t; })()} />
                                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                                      labelFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return dato; const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                      formatter={(v, name) => [(v >= 0 ? '+' : '') + v.toFixed(1) + '%', name === 'Pensum-forslaget' ? 'Pensum-forslaget' : name]} />
                                    <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" />
                                    <Line type="monotone" dataKey="portefolje" stroke="#1B3A5F" strokeWidth={3} dot={false} name="Pensum-forslaget" />
                                    {Object.entries(RAP_INDEKSER).map(([navn, cfg]) => (
                                      <Line key={navn} type="monotone" dataKey={navn} stroke={cfg.farge} strokeWidth={1.5} dot={false} strokeDasharray={cfg.dash} connectNulls />
                                    ))}
                                  </LineChart>
                                </ResponsiveContainer>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 justify-center">
                                  <div className="flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#1B3A5F10', color: '#1B3A5F' }}>
                                    <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: '#1B3A5F' }}></div>
                                    Pensum-forslaget: <span className={erGyldigTall(avkastninger.portefolje) ? (avkastninger.portefolje >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}>
                                      {erGyldigTall(avkastninger.portefolje) ? (avkastninger.portefolje >= 0 ? '+' : '') + avkastninger.portefolje.toFixed(1) + '%' : '—'}
                                    </span>
                                  </div>
                                  {Object.entries(RAP_INDEKSER).map(([navn, cfg]) => {
                                    const avk = avkastninger[navn];
                                    return (
                                      <div key={navn} className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <div className="w-4 h-0" style={{ borderTop: '2px dashed ' + cfg.farge }}></div>
                                        <span>{navn}:</span>
                                        <span className={erGyldigTall(avk) ? (avk >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}>
                                          {erGyldigTall(avk) ? (avk >= 0 ? '+' : '') + avk.toFixed(1) + '%' : '—'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Drawdown chart */}
                        {isStandardModulAktiv('snapshot-drawdown') && ddChartDataR.length >= 5 && (
                          <div data-chart-type="drawdown" className="rounded-xl overflow-hidden" style={{ border: '1px solid #FEE2E2', background: 'linear-gradient(to bottom, #FFF5F5, #FFFFFF)' }}>
                            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #FEE2E2' }}>
                              <div>
                                <h4 className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Risiko og nedsidebeskyttelse</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Ved markedsfall har porteføljen historisk falt klart mindre enn en ren aksjeeksponering.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                  Portefølje maks: {portMaxDDR.toFixed(1)}%
                                </span>
                                {Object.entries(indeksMaxDDR).map(([navn, dd]) => (
                                  <span key={navn} className="text-xs text-gray-500">{navn}: {dd.toFixed(1)}%</span>
                                ))}
                              </div>
                            </div>
                            <div className="p-5">
                              <ResponsiveContainer width="100%" height={360}>
                                <ComposedChart data={ddChartDataR} margin={{ top: 5, right: 30, left: 0, bottom: 10 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                                  <XAxis dataKey="dato" tick={{ fontSize: 10, fill: '#6B7280' }}
                                    tickFormatter={(dato) => { const p = parseHistorikkDato(dato); if (!p) return ''; const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']; return `${months[p.getMonth()]} ${p.getFullYear()}`; }}
                                    interval={Math.max(1, Math.floor(ddChartDataR.length / 10))} />
                                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(1) + '%'} domain={['dataMin - 1', 0]} />
                                  <Tooltip
                                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #FEE2E2' }}
                                    labelFormatter={formatHistorikkEtikett}
                                    formatter={(v, name) => [v.toFixed(2) + '%', name]} />
                                  <Legend verticalAlign="bottom" height={36} />
                                  <ReferenceLine y={0} stroke="#D1D5DB" strokeWidth={1.5} />
                                  <Area type="monotone" dataKey="Pensum-forslaget" stroke={PENSUM_COLORS.teal} fill={PENSUM_COLORS.teal} fillOpacity={0.15} strokeWidth={2.5} dot={false} name="Pensum-forslaget" />
                                  {Object.entries(INDEKS_DD_RAP).map(([navn, cfg]) => (
                                    <Line key={navn} type="monotone" dataKey={navn} stroke={cfg.farge} strokeWidth={1.5} dot={false} strokeDasharray={cfg.dash} name={navn} />
                                  ))}
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-400 p-3 bg-gray-50/80 rounded-lg border border-gray-100">
                          <strong>Merk:</strong> Alle grafer viser prosentvis avkastning fra periodens start. Den tykke linjen viser Pensum-forslagets vektede portefølje. Historisk avkastning er ingen garanti for fremtidig avkastning.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {renderTilleggsmodulerVedPosisjon('etter-snapshot')}


                {/* === AGGREGERT PORTEFØLJEEKSPONERING === */}
                {isStandardModulAktiv('eksponering') && (() => {
                  const aksjeProdRap = pensumAllokering.filter(a => {
                    if (a.vekt <= 0) return false;
                    const alle = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
                    const p = alle.find(pp => pp.id === a.id);
                    if (p?.aktivatype === 'rente') return false;
                    if (a.id === 'global-hoyrente' || a.id === 'nordisk-hoyrente') return false;
                    return true;
                  });
                  const totalAksjeVektRap = aksjeProdRap.reduce((s, a) => s + a.vekt, 0) || 1;

                  const aggregerRap = (key) => {
                    const sumMap = {};
                    aksjeProdRap.forEach(a => {
                      const eks = produktEksponering?.[a.id]?.[key];
                      if (!eks) return;
                      const relVekt = a.vekt / totalAksjeVektRap;
                      eks.forEach(row => {
                        if (!sumMap[row.navn]) sumMap[row.navn] = 0;
                        sumMap[row.navn] += (Number(row.vekt) || 0) * relVekt;
                      });
                    });
                    return Object.entries(sumMap)
                      .map(([navn, vekt]) => ({ navn, vekt: parseFloat(vekt.toFixed(1)) }))
                      .sort((a, b) => b.vekt - a.vekt)
                      .slice(0, 10);
                  };

                  const aggRegionerRap = aggregerRap('regioner');
                  const aggSektorerRap = aggregerRap('sektorer');
                  const aggStilRap = aggregerRap('stil');

                  if (aksjeProdRap.length === 0) return null;

                  // MSCI World benchmark eksponering (fra Morningstar-data)
                  const MSCI_WORLD_REGIONER = [
                    { navn: 'United States', vekt: 59.3 }, { navn: 'United Kingdom', vekt: 5.8 },
                    { navn: 'France', vekt: 5.3 }, { navn: 'Japan', vekt: 5.0 },
                    { navn: 'Germany', vekt: 3.6 }, { navn: 'China', vekt: 2.5 },
                    { navn: 'Sweden', vekt: 1.6 }, { navn: 'Denmark', vekt: 1.3 },
                    { navn: 'Norway', vekt: 1.1 }, { navn: 'Other', vekt: 14.5 },
                  ];
                  const MSCI_WORLD_SEKTORER = [
                    { navn: 'Technology', vekt: 25.3 }, { navn: 'Financial Services', vekt: 17.5 },
                    { navn: 'Industrials', vekt: 13.8 }, { navn: 'Healthcare', vekt: 10.9 },
                    { navn: 'Consumer Cyclical', vekt: 8.7 }, { navn: 'Communication Services', vekt: 8.4 },
                    { navn: 'Consumer Defensive', vekt: 4.5 }, { navn: 'Basic Materials', vekt: 3.7 },
                    { navn: 'Energy', vekt: 3.5 }, { navn: 'Utilities', vekt: 2.5 },
                  ];

                  const MSCI_WORLD_STIL = [
                    { navn: 'Large Core', vekt: 24.1 }, { navn: 'Large Value', vekt: 24.1 },
                    { navn: 'Large Growth', vekt: 12.6 }, { navn: 'Small Core', vekt: 11.1 },
                    { navn: 'Mid Core', vekt: 8.8 }, { navn: 'Mid Value', vekt: 6.3 },
                    { navn: 'Mid Growth', vekt: 5.6 }, { navn: 'Small Value', vekt: 5.0 },
                    { navn: 'Small Growth', vekt: 3.2 },
                  ];

                  const renderComparisonBars = (title, pensumData, msciData, color, msciColor) => {
                    // Merge all unique names, pensum first
                    const allNames = [...new Set([...pensumData.map(r => r.navn), ...msciData.map(r => r.navn)])];
                    const pensumMap = {}; pensumData.forEach(r => { pensumMap[r.navn] = r.vekt; });
                    const msciMap = {}; msciData.forEach(r => { msciMap[r.navn] = r.vekt; });
                    const merged = allNames.slice(0, 10).map(navn => ({
                      navn, pensum: pensumMap[navn] || 0, msci: msciMap[navn] || 0
                    })).sort((a, b) => b.pensum - a.pensum || b.msci - a.msci);

                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{title}</p>
                          <div className="flex items-center gap-3 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ backgroundColor: color }}></div>Pensum</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ backgroundColor: msciColor }}></div>MSCI World</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {merged.map((row, idx) => (
                            <div key={idx} className="py-0.5">
                              <div className="flex items-center gap-2" style={{ lineHeight: '1.2' }}>
                                <span className="text-xs text-gray-700 w-36 flex-shrink-0 truncate">{row.navn}</span>
                                <div className="flex-1 flex gap-0.5" style={{ height: '8px' }}>
                                  <div className="rounded-full" style={{ width: `${Math.min(row.pensum, 100) * 0.9}%`, backgroundColor: color, minWidth: row.pensum > 0 ? '3px' : '0', height: '100%' }}></div>
                                  <div className="rounded-full" style={{ width: `${Math.min(row.msci, 100) * 0.9}%`, backgroundColor: msciColor, opacity: 0.4, minWidth: row.msci > 0 ? '3px' : '0', height: '100%' }}></div>
                                </div>
                                <span className="text-xs font-semibold w-11 text-right flex-shrink-0" style={{ color }}>{row.pensum > 0 ? row.pensum + '%' : '—'}</span>
                                <span className="text-xs text-gray-400 w-11 text-right flex-shrink-0">{row.msci > 0 ? row.msci + '%' : '—'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div data-rapport-slide="eksponering">
                      <h2 className="text-xl font-bold mb-2 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Porteføljens eksponering</h2>
                      <p className="text-xs text-gray-500 mb-5">Vektet eksponering for aksjedelen sammenlignet med MSCI World. <em>Gjelder {aksjeProdRap.map(a => a.navn?.replace('Pensum ', '')).join(', ')}.</em></p>

                      {/* Pensum vs MSCI World — side by side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        {renderComparisonBars('Regioner', aggRegionerRap, MSCI_WORLD_REGIONER, PENSUM_COLORS.teal, '#94A3B8')}
                        {renderComparisonBars('Sektorer', aggSektorerRap, MSCI_WORLD_SEKTORER, PENSUM_COLORS.lightBlue, '#94A3B8')}
                      </div>

                      {/* Stil — Pensum vs MSCI World */}
                      {aggStilRap.length > 0 && (
                        renderComparisonBars('Stil', aggStilRap, MSCI_WORLD_STIL, PENSUM_COLORS.gold, '#94A3B8')
                      )}
                    </div>
                  );
                })()}

                {renderTilleggsmodulerVedPosisjon('etter-eksponering')}

                {/* === VERDIUTVIKLING (STACKED BAR) === */}
                {isStandardModulAktiv('verdiutvikling') && <><div data-rapport-slide="verdiutvikling">
                  <h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Forventet verdiutvikling per produkt</h2>
                  {(() => {
                    const pensumProdNavn = valgteProdukterRapport.map(p => p.navn);
                    const pensumProdFarger = valgteProdukterRapport.map((p, idx) => produktFarger[idx % produktFarger.length]);
                    return (
                      <>
                        <ResponsiveContainer width="100%" height={340}>
                          <BarChart data={pensumPrognose} barCategoryGap="40%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                            <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} />
                            <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 10 }} width={90} />
                            <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                            <Legend iconType="circle" iconSize={8} />
                            {pensumProdNavn.map((navn, i) => <Bar key={navn} dataKey={navn} stackId="a" fill={pensumProdFarger[i]} />)}
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    );
                  })()}
                </div>

                {/* === DETALJERT VERDIUTVIKLING === */}
                <div data-rapport-slide="verdi-tabell">
                  <h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Detaljert verdiutvikling</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="py-2 px-2 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>År</th>
                          {valgteProdukterRapport.map(p => <th key={p.id} className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn?.replace('Pensum ', '')}</th>)}
                          <th className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pensumPrognose.map((row, idx) => (
                          <tr key={row.year} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-2 px-2 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                            {valgteProdukterRapport.map(p => <td key={p.id} className="py-2 px-2 text-right text-gray-600">{formatCurrency(row[p.navn] || 0)}</td>)}
                            <td className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.verdi)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div></>}

                {renderTilleggsmodulerVedPosisjon('etter-verdiutvikling')}

                {/* === PRODUKTFAKTAARK === */}
                {isStandardModulAktiv('faktaark') && valgteProdukterRapport.map((p, pIdx) => {
                  const eks = produktEksponering?.[p.id] || {};
                  const meta = produktRapportMeta?.[p.id] || {};
                  const pColor = produktFarger[pIdx % produktFarger.length];
                  const isFixedIncome = meta.category === 'fixed-income' || meta.category === 'fixed-income-specialist';
                  return (
                    <div key={p.id} data-rapport-slide={`faktaark-${p.id}`} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      {/* Product header bar */}
                      <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pColor }}></div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{p.navn}{meta.slideTitle ? ` — ${meta.slideTitle}` : ''}</h3>
                            {meta.slideSubtitle && <p className="text-xs text-blue-200 mt-0.5">{meta.slideSubtitle}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{p.vekt.toFixed(1)}%</div>
                          <div className="text-xs text-blue-300 uppercase tracking-wider">Porteføljevekt</div>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* KPI row — different for fixed income */}
                        {isFixedIncome ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { label: 'Forv. yield', value: erGyldigTall(p.fYield) ? p.fYield.toFixed(1) + '%' : '—', color: PENSUM_COLORS.teal },
                              { label: 'Forv. avkastning', value: erGyldigTall(p.fAvk) ? p.fAvk.toFixed(1) + '%' : '—', color: PENSUM_COLORS.green },
                              { label: '1 år avk.', value: formatAvk(p.stat1y?.totalAvkastning), color: erGyldigTall(p.stat1y?.totalAvkastning) && p.stat1y.totalAvkastning >= 0 ? PENSUM_COLORS.green : PENSUM_COLORS.red },
                              { label: '3 år p.a.', value: formatAvk(p.stat3y?.aarligAvkastning), color: erGyldigTall(p.stat3y?.aarligAvkastning) && p.stat3y.aarligAvkastning >= 0 ? PENSUM_COLORS.green : PENSUM_COLORS.red },
                              { label: 'Volatilitet', value: erGyldigTall(p.stat3y?.stdDev) ? p.stat3y.stdDev.toFixed(1) + '%' : (erGyldigTall(p.produkt?.volatilitet) ? p.produkt.volatilitet.toFixed(1) + '%' : '—'), color: PENSUM_COLORS.darkBlue },
                            ].map((kpi, ki) => (
                              <div key={ki} className="rounded-lg p-3 text-center" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                                <div className="text-xs uppercase tracking-wider text-gray-500">{kpi.label}</div>
                                <div className="text-lg font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { label: 'Forv. avkastning', value: erGyldigTall(p.fAvk) ? p.fAvk.toFixed(1) + '%' : '—', color: PENSUM_COLORS.green },
                              { label: 'Forv. yield', value: erGyldigTall(p.fYield) ? p.fYield.toFixed(1) + '%' : '—', color: PENSUM_COLORS.teal },
                              { label: '1 år avk.', value: formatAvk(p.stat1y?.totalAvkastning), color: erGyldigTall(p.stat1y?.totalAvkastning) && p.stat1y.totalAvkastning >= 0 ? PENSUM_COLORS.green : PENSUM_COLORS.red },
                              { label: '3 år p.a.', value: formatAvk(p.stat3y?.aarligAvkastning), color: erGyldigTall(p.stat3y?.aarligAvkastning) && p.stat3y.aarligAvkastning >= 0 ? PENSUM_COLORS.green : PENSUM_COLORS.red },
                              { label: '5 år p.a.', value: formatAvk(p.stat5y?.aarligAvkastning), color: erGyldigTall(p.stat5y?.aarligAvkastning) && p.stat5y.aarligAvkastning >= 0 ? PENSUM_COLORS.green : PENSUM_COLORS.red },
                            ].map((kpi, ki) => (
                              <div key={ki} className="rounded-lg p-3 text-center" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                                <div className="text-xs uppercase tracking-wider text-gray-500">{kpi.label}</div>
                                <div className="text-lg font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fixed Income: Investeringscase + Rolle */}
                        {isFixedIncome ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-lg border border-slate-100 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringscase</p>
                              <p className="text-sm text-slate-600 leading-relaxed">{meta.caseText || meta.pitch || 'Mandatet investerer i kredittobligasjoner og søker attraktiv løpende yield gjennom aktiv kredittseleksjon og god diversifisering.'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-100 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Rolle i porteføljen</p>
                              <p className="text-sm text-slate-600 leading-relaxed">{meta.role || 'Rentedelen skal stabilisere totalen, bidra med løpende avkastning og redusere svingningene i samlet portefølje.'}</p>
                            </div>
                          </div>
                        ) : (
                          meta.pitch && <p className="text-sm text-slate-600 leading-relaxed">{meta.pitch}</p>
                        )}

                        {/* Exposure bars — different layout for fixed income */}
                        {isFixedIncome ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Underliggende fond / Kreditteksponering */}
                            {[
                              { key: 'underliggende', title: 'Kreditteksponering', color: PENSUM_COLORS.salmon },
                              { key: 'stil', title: 'Nøkkelkarakteristika', color: PENSUM_COLORS.gold },
                              { key: 'regioner', title: 'Regioner', color: PENSUM_COLORS.teal },
                              { key: 'sektorer', title: 'Sektorer', color: PENSUM_COLORS.lightBlue },
                            ].map(block => {
                              const rows = (eks[block.key] || []).slice(0, 8);
                              if (rows.length === 0) return null;
                              return (
                                <div key={block.key} className="rounded-lg border border-slate-100 p-4">
                                  <p className="text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: PENSUM_COLORS.darkBlue }}>{block.title}</p>
                                  <div className="space-y-2.5">
                                    {rows.map((row, ri) => (
                                      <div key={ri} className="flex items-center gap-2" style={{ lineHeight: '1.2' }}>
                                        <span className="text-xs min-w-0 flex-1" style={{ overflow: 'visible', whiteSpace: 'normal' }}>{row.navn}</span>
                                        <div className="w-20 bg-slate-100 rounded-full overflow-hidden flex-shrink-0" style={{ height: '10px' }}>
                                          <div className="h-full rounded-full" style={{ width: `${Math.min(row.vekt, 100)}%`, backgroundColor: block.color }}></div>
                                        </div>
                                        <span className="text-xs font-medium w-9 text-right flex-shrink-0">{row.vekt}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            {/* Nøkkelrisiko for fixed income */}
                            {meta.riskText && (
                              <div className="rounded-lg border border-slate-100 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Nøkkelrisiko</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{meta.riskText}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: 'regioner', title: 'Regioner', color: PENSUM_COLORS.teal },
                              { key: 'sektorer', title: 'Sektorer', color: PENSUM_COLORS.lightBlue },
                              { key: 'underliggende', title: 'Underliggende fond', color: PENSUM_COLORS.salmon },
                              { key: 'stil', title: 'Stil', color: PENSUM_COLORS.gold },
                            ].map(block => {
                              const rows = (eks[block.key] || []).slice(0, 8);
                              if (rows.length === 0) return null;
                              return (
                                <div key={block.key} className="rounded-lg border border-slate-100 p-4">
                                  <p className="text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: PENSUM_COLORS.darkBlue }}>{block.title}</p>
                                  <div className="space-y-2.5">
                                    {rows.map((row, ri) => (
                                      <div key={ri} className="flex items-center gap-2" style={{ lineHeight: '1.2' }}>
                                        <span className="text-xs min-w-0 flex-1" style={{ overflow: 'visible', whiteSpace: 'normal' }}>{row.navn}</span>
                                        <div className="w-20 bg-slate-100 rounded-full overflow-hidden flex-shrink-0" style={{ height: '10px' }}>
                                          <div className="h-full rounded-full" style={{ width: `${Math.min(row.vekt, 100)}%`, backgroundColor: block.color }}></div>
                                        </div>
                                        <span className="text-xs font-medium w-9 text-right flex-shrink-0">{row.vekt}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Role, benchmark, risk — equity only (fixed income shows these above) */}
                        {!isFixedIncome && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {meta.role && (
                              <div className="rounded-lg border border-slate-100 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Rolle i porteføljen</p>
                                <p className="text-xs text-slate-700 mt-1.5">{meta.role}</p>
                              </div>
                            )}
                            {meta.benchmark && (
                              <div className="rounded-lg border border-slate-100 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Referanseindeks</p>
                                <p className="text-xs text-slate-700 mt-1.5">{meta.benchmark}</p>
                              </div>
                            )}
                            {meta.riskText && (
                              <div className="rounded-lg border border-slate-100 p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Nøkkelrisiko</p>
                                <p className="text-xs text-slate-700 mt-1.5">{meta.riskText}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fixed income: benchmark as subtle footer */}
                        {isFixedIncome && meta.benchmark && (
                          <div className="text-xs text-gray-400">Referanseindeks: {meta.benchmark}</div>
                        )}

                        {/* Product disclaimer */}
                        {eks.disclaimer && (
                          <p className="text-[10px] text-gray-400 italic">{eks.disclaimer}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {renderTilleggsmodulerVedPosisjon('etter-faktaark')}

                {renderTilleggsmodulerVedPosisjon('foer-disclaimer')}

                {/* === HONORARSTRUKTUR === */}
                {isStandardModulAktiv('honorarstruktur') && renderTilleggsmodulInnhold('honorarstruktur')}

                {/* === NESTE STEG === */}
                {isStandardModulAktiv('neste-steg') && renderTilleggsmodulInnhold('neste-steg')}

                {/* === APPENDIX MODULES === */}
                {renderTilleggsmodulerVedPosisjon('appendix')}

                {/* === DISCLAIMER === */}
                {isStandardModulAktiv('disclaimer') && <div data-rapport-slide="disclaimer" className="page-break-before pt-16 pb-6">
                  <div className="flex justify-center mb-12">
                    <img src={PENSUM_LOGO} alt="Pensum Asset Management" className="h-16" style={{ opacity: 0.2 }} />
                  </div>
                  <div className="border-t border-gray-200 pt-8 space-y-5 text-sm text-gray-500 leading-relaxed max-w-3xl mx-auto">
                    <h3 className="font-bold text-base text-gray-700">Viktig informasjon</h3>
                    <p>Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke. Sharpe Ratio er beregnet med risikofri rente på 3% p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det største kursfallet fra topp til bunn. Avkastningstall er oppdatert til og med {RAPPORT_DATO}.</p>
                    <p>Pensum Asset Management AS er regulert av Finanstilsynet og innehar konsesjon som verdipapirforetak. Investeringsrådgivning gis i henhold til verdipapirhandelloven. Kostnader og gebyrer kan påvirke netto avkastning. For fullstendig informasjon om risiko, kostnader og vilkår, se Pensums nøkkelinformasjonsdokumenter (KID) og prospekter som er tilgjengelige på forespørsel.</p>
                    <p>Dette dokumentet utgjør ikke et tilbud om kjøp eller salg av finansielle instrumenter, men er ment som beslutningsgrunnlag for diskusjon mellom rådgiver og kunde.</p>
                  </div>
                </div>}
              </div>

              {/* === FOOTER === */}
              <div className="px-10 py-5 text-center text-sm border-t border-gray-100" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum Asset Management</span>
                <span className="mx-3 text-gray-300">|</span><span className="text-gray-500">pensumgroup.no</span>
                <span className="mx-3 text-gray-300">|</span><span className="text-gray-500">+47 23 89 68 44</span>
              </div>
            </div>

            {/* === TILLEGGSMODULER PANEL === */}
            <div className="no-print">
              <button
                onClick={() => setVisModulPanel(!visModulPanel)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 border-dashed transition-all hover:border-solid"
                style={{ borderColor: visModulPanel ? PENSUM_COLORS.darkBlue : '#CBD5E1', backgroundColor: visModulPanel ? '#F0F4F8' : 'white' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>Tilpass innhold</span>
                    <p className="text-xs text-gray-400">Velg hvilke sider som skal inkluderes i forslaget</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(tilleggsmoduler.filter(m => m.aktiv).length > 0 || rapportModuler.filter(m => !m.aktiv).length > 0) && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: PENSUM_COLORS.teal }}>
                      {rapportModuler.filter(m => !m.aktiv).length > 0 ? `${rapportModuler.filter(m => !m.aktiv).length} skjult` : ''}{rapportModuler.filter(m => !m.aktiv).length > 0 && tilleggsmoduler.filter(m => m.aktiv).length > 0 ? ' · ' : ''}{tilleggsmoduler.filter(m => m.aktiv).length > 0 ? `${tilleggsmoduler.filter(m => m.aktiv).length} tillegg` : ''}
                    </span>
                  )}
                  <svg className={"w-5 h-5 transition-transform " + (visModulPanel ? "rotate-180" : "")} style={{ color: PENSUM_COLORS.darkBlue }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {visModulPanel && (
                <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Tilleggsmoduler */}
                  <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: '#F8FAFB' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: PENSUM_COLORS.darkBlue }}>Tilleggsmoduler</p>
                    <p className="text-xs text-gray-400 mt-0.5">Valgfrie sider som kan legges til i forslaget.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {tilleggsmoduler.map((modul, idx) => (
                      <div key={modul.id} className={"px-5 py-4 transition-colors " + (modul.aktiv ? 'bg-blue-50/40' : 'hover:bg-gray-50')}>
                        <div className="flex items-center gap-3">
                          {/* Rekkefølge-knapper */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                setTilleggsmoduler(prev => {
                                  const ny = [...prev];
                                  [ny[idx - 1], ny[idx]] = [ny[idx], ny[idx - 1]];
                                  return ny;
                                });
                              }}
                              className={"w-6 h-6 rounded flex items-center justify-center transition-colors " + (idx === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')}
                              title="Flytt opp"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <span className="text-[9px] text-gray-400 text-center font-mono leading-none">{idx + 1}</span>
                            <button
                              disabled={idx === tilleggsmoduler.length - 1}
                              onClick={() => {
                                setTilleggsmoduler(prev => {
                                  const ny = [...prev];
                                  [ny[idx], ny[idx + 1]] = [ny[idx + 1], ny[idx]];
                                  return ny;
                                });
                              }}
                              className={"w-6 h-6 rounded flex items-center justify-center transition-colors " + (idx === tilleggsmoduler.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')}
                              title="Flytt ned"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                          {/* Av/på toggle */}
                          <button
                            onClick={() => {
                              setTilleggsmoduler(prev => prev.map(m =>
                                m.id === modul.id ? { ...m, aktiv: !m.aktiv } : m
                              ));
                            }}
                            className={"w-10 h-6 rounded-full transition-colors relative flex-shrink-0 " + (modul.aktiv ? '' : 'bg-gray-200')}
                            style={modul.aktiv ? { backgroundColor: PENSUM_COLORS.teal } : {}}>
                            <span className={"absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform " + (modul.aktiv ? 'translate-x-4' : 'translate-x-0.5')}></span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>{modul.label}</span>
                              {modul.aktiv && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#E0F2F1', color: PENSUM_COLORS.teal }}>Inkludert</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {TILLEGGSMODUL_BESKRIVELSER[modul.id] || ''}
                            </p>
                          </div>
                          {modul.aktiv && (
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5" style={{ color: PENSUM_COLORS.teal }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </div>
                        {modul.aktiv && (
                          <div className="mt-2 ml-20">
                            <label className="text-[10px] text-gray-500 font-medium">Plassering i forslaget:</label>
                            <select
                              value={modul.posisjon || 'foer-disclaimer'}
                              onChange={(e) => {
                                setTilleggsmoduler(prev => prev.map(m =>
                                  m.id === modul.id ? { ...m, posisjon: e.target.value } : m
                                ));
                              }}
                              className="ml-2 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                              style={{ color: PENSUM_COLORS.darkBlue }}
                            >
                              {TILLEGGSMODUL_POSISJONER.map(pos => (
                                <option key={pos.value} value={pos.value}>{pos.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 text-[10px] text-gray-400" style={{ backgroundColor: '#FAFBFC' }}>
                    Bruk pilene til venstre for å endre rekkefølgen på modulene. Moduler med samme plassering vises i den rekkefølgen de står i listen.
                  </div>

                  {/* Standardsider */}
                  <div className="px-5 py-3 border-b border-t border-gray-100" style={{ backgroundColor: '#F8FAFB' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: PENSUM_COLORS.darkBlue }}>Standardsider</p>
                    <p className="text-xs text-gray-400 mt-0.5">Disse sidene er med som standard. Skru av for å fjerne fra forslaget.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {rapportModuler.filter(m => m.id !== 'cover').map((modul) => (
                      <div key={modul.id} className={"px-5 py-3 flex items-center justify-between " + (modul.aktiv ? '' : 'bg-gray-50')}>
                        <span className={"text-sm " + (modul.aktiv ? 'font-medium' : 'text-gray-400')} style={modul.aktiv ? { color: PENSUM_COLORS.darkBlue } : {}}>{modul.label}</span>
                        <button
                          onClick={() => setRapportModuler(prev => prev.map(m => m.id === modul.id ? { ...m, aktiv: !m.aktiv } : m))}
                          className={"w-9 h-5 rounded-full transition-colors relative flex-shrink-0 " + (modul.aktiv ? '' : 'bg-gray-200')}
                          style={modul.aktiv ? { backgroundColor: PENSUM_COLORS.teal } : {}}>
                          <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform " + (modul.aktiv ? 'translate-x-4' : 'translate-x-0.5')}></span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* === NEDLASTING === */}
            <div className="flex flex-col items-center gap-4 no-print">
              <button onClick={handleGenerateRapportPPTX} disabled={rapportPptxLoading} className="px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg flex items-center gap-3" style={{ backgroundColor: rapportPptxLoading ? '#6B7280' : PENSUM_COLORS.salmon }}>
                {rapportPptxLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                )}
                {rapportPptxLoading ? 'Genererer PowerPoint...' : 'Last ned PowerPoint'}
              </button>
              {rapportPptxLoading && (
                <div className="text-center space-y-2 max-w-sm">
                  <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: PENSUM_COLORS.teal, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">{rapportPptxProgress}</p>
                  <p className="text-[10px] text-gray-400">Dette kan ta 10-20 sekunder avhengig av antall sider</p>
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* ADMIN-FANE */}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') { if (adminPassord === ADMIN_PASSORD) { setErAdmin(true); setAdminMelding(''); } else { setAdminMelding('Feil passord'); } }}}
                      className="w-full border border-gray-200 rounded-lg py-3 px-4"
                    />
                    {adminMelding && <p className="text-red-500 text-sm">{adminMelding}</p>}
                    <button 
                      onClick={() => { if (adminPassord === ADMIN_PASSORD) { setErAdmin(true); setAdminMelding(''); } else { setAdminMelding('Feil passord'); } }}
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
                            await storageSet('pensum_admin_produkter', JSON.stringify(oppdaterteProdukter));
                            
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
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.5"
                              value={avkastningsrater[key]}
                              onChange={(e) => setAvkastningsrater(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                              className="w-full border border-gray-200 rounded-lg py-2 px-3 text-right"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await storageSet('pensum_admin_avkastningsrater', JSON.stringify(avkastningsrater));
                          setAdminMelding('Avkastningsrater lagret!');
                        } catch (err) {
                          setAdminMelding('Feil ved lagring: ' + err.message);
                        }
                      }}
                      className="mt-4 px-6 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                    >
                      Lagre avkastningsrater
                    </button>
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
                          await storageSet('pensum_admin_produkter', JSON.stringify(pensumProdukter));
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
                            const resp = await fetch('/api/brukere');
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
                              <th className="py-2 px-3 text-left font-medium">PIN</th>
                              <th className="py-2 px-3 text-left font-medium">Opprettet</th>
                              <th className="py-2 px-3 text-center font-medium">Handlinger</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(adminBrukere).map((b) => (
                              <tr key={b.epost} className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{b.navn || '–'}</td>
                                <td className="py-2 px-3 text-gray-600">{b.epost}</td>
                                <td className="py-2 px-3">
                                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{b.pin}</span>
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs">{b.opprettet ? new Date(b.opprettet).toLocaleDateString('nb-NO') : '–'}</td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={async () => {
                                      if (!confirm('Slette bruker ' + b.epost + '?')) return;
                                      // Try API first
                                      try {
                                        await fetch('/api/brukere', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ epost: b.epost })
                                        });
                                      } catch (apiErr) {
                                        console.log('API slett feilet:', apiErr);
                                      }
                                      const oppdatert = { ...adminBrukere };
                                      delete oppdatert[b.epost];
                                      await storageSet('pensum_brukere', JSON.stringify(oppdatert));
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
                        setAvkastningsrater({
                          globaleAksjer: 9, norskeAksjer: 10, hoyrente: 8,
                          investmentGrade: 5, privateEquity: 15, eiendom: 8
                        });
                        setAvkastningsraterLaast(false);
                        try {
                          await storageDelete('pensum_admin_produkter');
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

      <footer className="mt-12 py-6 text-center border-t border-gray-200 bg-white no-print">
        <img src={PENSUM_LOGO} alt="Pensum" className="h-14 mx-auto mb-3" />
        <div className="text-xs text-gray-500">Frøyas gate 15, 0273 Oslo • (+47) 23 89 68 44 • pensumgroup.no</div>
      </footer>
    </div>
  );
}
