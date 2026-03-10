import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DATAFEED_KILDE, DATAFEED_PRODUKT_HISTORIKK } from '../data/pensumDatafeedHistorikk';
import { defaultPensumProdukter, defaultProduktEksponering, defaultProduktRapportMeta } from '../data/pensumDefaults';
import { ASSET_COLORS, CATEGORY_COLORS, DEFAULT_EIENDOM, DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_TEMPLATE_FILENAME, HISTORIKK_ARFELT, HISTORIKK_2026_YTD, PENSUM_COLORS, RAPPORT_DATO, RAPPORT_DATO_ISO, RAPPORT_DATO_OBJEKT, RAPPORT_MAANED, RISK_PROFILES, beregnAllokering, beregnProduktNokkeltall, byggMaanedssluttSerie, erGyldigTall, erPptTemplateFilnavn, finnStartVerdiVedPeriode, formatCurrency, formatDateEuro, formatHistorikkEtikett, formatNumber, formatPercent, inferPerioderPerAarFraHistorikk, oppdaterHistorikkTilRapportDato, parseHistorikkDato, skalerVekterTilHundreListe, fordelRestVektListe, validerSiderFormat } from '../lib/pensumCore';
import { AllokeringRow, CollapsibleSection, CurrencyInput, KategoriHeaderRow, SammenligningRow, StatCard } from './pensum/PensumFieldComponents';

const PENSUM_LOGO = 'data:image/webp;base64,UklGRrgYAABXRUJQVlA4WAoAAAAwAAAASwIAHQEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBIcQ0AAA3wn22bl2bb/s1VwT0dyFmB04GkAkkFYAVoBcYKDBUoFQQrCHYwqeCadMBVwb0Mc/ziRyJy/yAiHEqy2jYkjkvaA6NHkb5ALf4/Fv9l8V8W/2XxXxb/ZfFf/n+ELP7LJXqZkSRyavH/sbwli/8SJVuj+5Y6iPtWdWNnBsnyIbDGwPdXKtbG2a+6ng+2zeBsatZxXN8rOwu8e5SgH4QfN4muCvf0y3FM2V7uyuuTLwnSYSRfT+PTc3+gRxep40M1JzU2znr39P/duH7mXDztX6rjMYbrszo0z7kU+Th7ZemT/qmqyUapjbnsnvOe6WGTjLMs/Tg85c9mp3Mz0udzfngtbDxI+NSryC9r6PS87J7HH+t77cogCwxs8+2sMvHWyDtcl5dBe1hPeWC29c0l20TKmOmh7YnOLW9VN5vlsii7d7PMPI67lsKDC+iVzjAff7+dY8kP5Kd2+m+W+cDOnCWXajvXTCa/l5+CT53ngq8M0p44nA2/WMG3Oeab5+nCH+ZFu2ZqtvmJD/aZWL9SYb45LM+j3T3nk4qabb5nVzXjPHZnzfW2YtR0n2e6pWXOAdne5pzdWxZxH/Yvc86jTLnTaAQ995gqUEM1yqnFtdJ8H41cbRMhrNSSCQ2xs9HfAHi145SFCzBI/QBmTuMuWCZj332vRrf7JN2yunFFBD9j9EKWGyn0qxdiZtv3cMMYw8AhqnOCVIpVVThSWdj2JfUDmDmNITbSxiGxCLpNwkoHcEjN/cj6a2it2BGxjV97JFgo2TsDihsCHwEDOkjyXT2IJeqGSkqn5+ltywWpkUzfkK52OfT9PJaug3/jre+QyBM+Faanp1QJ5ye6j6Slb4K7vHYF2ufMNhGYUUgcyA6bO+HNU/SHneEIbDBhk/m7UqtEw5TqKgAlE8K1Gp6SOaerCqXMJtbKB+GhXibL+UjcLR7l6f1Tqe/6w0AGEoDqiPmyk4qBWxky97uNdY/8LG4Dx1NUvtaM/OufMVHt7gMybJ9INcjmpUynYURFCCsqd+9VLTCkMLuGwWCmn3Cpc8Sxjh2XSr1rUuTgK4XYPyG7DmUH4LE6CqfoPDj1fTs5T/pLAgcjoKZXG7gsEF9+6jIi9s116AIn0ha+BBzn6dmAH/ELaqH3qvRrroOf1lYmjQFpXNRrd4PPEDcq7MA5bMRMSmFzlUBGg+Q/HZoHEgGx8w2320N9wShtb3mXfzgdYa5+dkVvhQmv1tVXCmHeHJzDBvH0/FE9Rl1Wf5QyaGqk5yUP70kU3FQLppBCJGzayAu4LG8ObiCuD6emcej8uZlAp2f1KLp1PQ+o07nLbrfxT3RwLN8HPUXno1/YM0V7sIdecQaO8lMqIcPL3oTP5qJRmDzq3VCzC+EUnz9dW5i5kffbIxnSA9jlNyf0wUPmqwJEubr/Q5yZxbaB58/WUQEaB/3026lYbNE/+IabTJP3MjlqWDqchjx9Zs5llAfIp4c5ReHO+2igO1eupOPiWhz9fwQ3N/WAp0/OuWCqb1ASLXNId11SP/+fsAVH1sAQB57igw01aXMszHVO1/NfaCrsLQP/IN3DycAUtuDI3lzAEeHnGjZn5dMLGqSC90kqXFvr5wUc6VcEFUGItsrPIzOmaug+L6RQNCohZNvB/T2dTs4XXMT9DFMM8A8yAx3j+lYBBCnto2gSJuTy25ODTTXgo13mleE2gaUZowjmboie1V8ddlLmTraJbVpTQQtZksXb1Cx899g0PlfAix26zKFP12+z1PP1c2zR+R/kkAyRCpzYopOFJet6wXnkSfqC82NO3A82BuuS3aFdG8bri7PmYEkGI/JdP68Mt2n6TVZ+jeZqWIvAWkRrer6wYV2zOMb8jJH8FJ5P1E8O/jUeuLSQYFMriYc6AJeIjJGGZiEZ7hRvjB9xoLt5h3TGHB7UNjZABetLg04a+94rlY/6rC9UPVNR2on6Ee3xYigKk8TPeJoiPbTkcLw2khFQ3a3tNnpute2iMcmcZAy30/LFL0ph21pzziMic2vQhJ51xKfWM9KLb2yz35519nsSB+j2zDrvo09TdfqcIxfBqqJZ6Bqehn2Q20SdtUkFTcgZZxMsKJmHNmL1yIyzSabiHu42IaeScwSFXj4y17TZj359h+TaXHP1KFsNMs9MAcbhSHLtMMccZakUz2GG+e1tAhFJfnGEY+Wi/jiahfMErKWxhZMC+STHk23LWy7wH/hxeKrJKahIqRcyC/1bH94ZlLd3CoRXgZwH/VvtgMVJKHlsgKb2htp8Z0MaBKu9I236oYNdOOO1hkCgAVisQXnFipAAf1dBPmM2sRAU8KQRTianSmXYPcB9w9qvDlIgpFFso7ThIr9l/CxSal1QMALkmhypSuUFg3JTOgIErUKu1PbGFUN4kBuzLSuIQJMGEamdQLswxguGwKDTXSsIhHNYEQrgb5kfY7tG0ToyImjUvRnZL+L7nJbUfY5Uc7JKmU1SCoAQN/OOQSvlIJojAhNJqN0SjJQBSKRnBrVrxjXPO2l8APhJfB8hNNydUmadYGdHRgDqU4ipuQmYrFDG45UzyRu3CAQOqE38wyv2f49JHy5yjeJDAj9yUWQqCkbzCjS81zwQytnuZGRykEvfGDAkrKj1IsKJPAzg49jRtHJRShN8o2PzLtuCApC1idBYe28H9viqI9IInNrQptjvY1ptZCdG6eONZPMwSBwIqRv19qOzt19xoziqXBsftwhOJiJIwwPpYXmNUGziwyfliXXMDZ/ymFUNiVJFR3+JEsr5K5V4b6fXa9Seo7A9BAahFWkHCWHh5pZ2MBGwyWX30AoBbniO6xuUX1X/pK0jjc9WmITKLRE+t6r+swqCnSp4JpMkNqez7FJk1K1JOdbuzduqJKkbDPZ66Qbx63PfXnqUchiDn8mYxiqbtY5EkEJsoX4kkF4VFuQ++0R7RoLunKgy8BGZtRWqbmmOcrng1LGGmRWNsF2R0a74aRGihL3PMrrIW5tCC6hW7Y4YT2mU39wDkU5RYhy0L2OaQjU1jn/hNusPWJMzQISq9cpIKLZVGTd8glpG0VrtzvriBys/0LzLBoQtsxFy6+92udjbFO2tf4sQaff54muOh3jpfSwfkzFNcA8i/l2NMRcHinspEFBRveAUuydG0nGFki22cC2UqmLtf1jgR4L4X7ZjgQrDq7YvIB2SGWsQYFNt4ae9fjLj1VAF2LrbtzXHg5M2wR1RMSxiGuBIIG6Bamm7V0kaF++NDAjiow0q/XsZWIGFgpe2XOSdiPtl4NPXrKU57lJCODvO73yXCVUPqNNA+SxyWSwpaxA0SEBCCrURGM/XxeSlXPua42FdQnfkNFKzhhsbghR2JJx2V8dE6zw7XQVACEMgO+helAPhs3EgtnE6+1wLxu6WLpl09EhdwvkdcMlbqB4Q/xE+y7ms73DxBmkThxDbwafh3eSNFz3US7aox6cT1TUMjcEgqnUkashUSRrr8/0qB+InNvpTDg4QlRchtpXs8NH7YNaGOw39CX08cPF/1fpV8EHP2tDVNOGzoM1ONmvEsT300DB5C4wnqDkejuCbVJXNiLVq/co3yvEaCO9ITNfDnNX5IADSq+0YRsqurc96QmKHT7KGEFq6ZFJSE2euZoJwhloYbc8EdA3Wyljos2C2risH6La1FXpoXYKKoOb4/UU2Om+j/DzNNETurE1bxjGOpPba1DyQIcxAhM82I2QLV0tUg34n9CNcLFIIUe/eGhXLTSDbxc5lft9lwD2+S67yyej4dcvbYgLPq9GOBLMiD5IFMuBQNFF6j3z7gB0+r0iOcdsmZS9F6YkizuaFWN7gjQM648Hte1MbFp6N8u/0hlLHia9OH8ln3d2O24oU0yCSAMUZMflKpcIckIFbW2vlCL5FjQmSLpPWwWjujc3+k/g09j6iCRb6Y1HeR6CnbJr6X+mWfAnY2P76EgZh86XqnzAYSabhHCkUXg1ynTQk1CwQwa3ttenNf5qix2voyLN+dPHICIQeMVM9oBpzvzp1Tqfo1pbpes7XHNFvJLgz9OtQtYBpqNaW+azvtnHGpKALxQKh2ovEBH5/Te82tjGtqjB8KNeM2YTc3lApgloYPGs3rx96n9a3EGWNo3ukpEFom6qGuPe88cDiA7bmUNPowaVKLUlwjhT4Z2M8HRBuwAGh2otIfD+xP0bysY0fPhxd4iwK+1USikKis8qEYfiXlyhKtgp7G9EjZQxC8Sj5Pm88vyhKdGl6yaqmb3SxVlmtbLkFbtHU0HNIINiV6NjvuwAEGGEe52kOJ9LqmwTSVn8eB4mujtJvAEpTfpQqjRCCEIrwK505aI/XeJsgkrwj8XPftEGgItCjV+oLIsMdMTKBIUBH1KUNbUXP1VNI/EyxZM66uZLtDwyETxWE+UOH1TkwFhJAoC8WHAE5vJaH7HaiQEdPHoeak9LpxqfxfupboDZunRLICDtJ7wJWdvxLjBb/H4v/svgv/yUpi//iZh6pEnqbexiwyEk5zT1Su4zEMPukZrtNhrfC5/nzz9Pl4Qu2mHmOCR6s1OL/45eUxX9x0ZwkOzcnyeL/Y/FfFv9l8V8W/2XxXxb/5b+BZPFfFABWUDggUAkAADBKAJ0BKkwCHgE+USiSRiOioaEik1lQcAoJZ27hc95rWCB8gHX/n1b/l+2C0H6r+q+kNyn3FPF9DvT/ly83efT+weoT9SewF4s36Ue4P7L/cB+yvrJ/8P1Bf331AP8F/pPWe/3P/////wBfu37Df7OenT7J3978+D1AP//6gH//67/oB/APoA/P3v8FNZUsbDDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpILMe7rPT71lSxsMMUkGKSDFJBikf7iZ6fesqWNhhikgxSQYd6fyZdl2XZGrAo9wetrAcd56fesqWNhhikgth5uC7LkfVkJ0hFjllNQD7VCzsxyEa1J1vWt1p4blTjZadBK0DEND3Xeen3rKljYX1J1CY/qAfaozXxRTtbZhf2a2S+VZ2QYpIMUkGKEi7t5JtfExPJz48VazxHkT2sMNbvgLkFUsbDDFI/lIkrEcfx+VdC2ZxMbokT2orWHYU9phzVx+DyDCq70Fr54fHmykCNkF//4sh+UwEgju6KB0U5SFKEma4YJCwgk57YiWNoZZ0nBexkFAMA85KfSk271JDDDxSSn32E33yPwQ6nsdfEAReRjI0ogrZU57HX20FCbhY2ETznJkenfI/fZWNhhikgxSQYpIMOqa+79MobxkySAHeen3rKljYYYpIMUkGKSDDzlrfFQcd56fesqWNhhikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKSDFJBikgxSQYpIMUkGKR+gAAP79SkAAAAAAHZuwA2VaBRfArf/69s08t0BYXfxPfEXIGr5KHyi3EsvlB6OoXIwRp6WHLpRp3m0TjCBRw+4sV1RrwhnB4Wc61k/oIqlzPitE7dXqj+7AAASeVDZL4kPoqfFpSk6Wr0AG2R+4HOwxNvWLIX5U3tJTpTPkqMFjBYAvxIzaCsYQ42iTPavnTLwxfHNRiF7TabEySrMsYF83XE0SSizTAC45NJ+Gl1craUZ+JYLPottcGPhwBfLgZ8w/sTdcvSSTwpRV+DzYQpicELAW5F9Dp0Hn0RW+QxeysWg91fNzXcbmnxGcWlvaF/tLikguvwUBfQo7rZVI0utFQNHkr9Au6B60XhqQ44LkklEj0Jd4Tb82foFZLyi1Y24uJDfis80lonJ5eji4AyOa8TA+/CPNgInlzbBSYQUOybwxQ3pF6I6864sLUJo4IHrkcFyL/08hBtwwVP9xDGcfwFAxmvrT+Px75WsQZKzkUJ1h/RHeHCcq+5TV2JgK5PD9WCHhu5EF0WiOwvMzg57MY7VB71ne0aQCBIgTM3ShLVnk7PvMk0uWww9Hy/EPUnvSBLECGcNLZf7ivHIIYMDlSnmv1qYuKlTJsVabdAuMkd4AVDXULelTaNx4cDur7/hIzRnbAr2jvEUVSLvjMAXbAJ/CJOjlfhQ9fgjTDI+mBpOlfbPv/+rl+hnfUKncu8Avzus1k//1jDkTiR2IQ/GsBejGyxtZQqDb0NVIylJjCgwUwXfLPFhHaGHzrTbmFuxhw4gsvUlv9bY78co3B9c7qvbRmaoFDqPw7ZbPYABw4oyjr81Ns/Ioh5pk7kOd2FT1tvoNtrwAy6Qk6ekPET1B7uIsqyPExrcb9MU1hj6tMkf6afUhK+pME4UaBz8MpInFCG0ixATttQwXhYjqlQoqmRavsBC+HkaWe5UXti21OgrNI/Ugk8NYq6h3OcutLMYXLG8hPAZPwh8HhctUrtdwT8vnl5on7H/k9uVDO0+2MyhZ8Ns6www1BtUAN0pz+vFqABojLbfkojH7huP2NrtlQWLRoN+kiD9+NyBrG7PscXMN62uTHI6dOyEBDV5wZAYVYZNgNAzugAYgQoxf0ZZk165WN3M/OwodpbLeaPC4Fh0bBibCus2EkC+RhfaZ0FBkznAtRfpDBCVLLkCwOTXjAdlk4DB7JfmYaJdLoPT6E/oWsu5l5DN0s5acWMgnDDIup/qRQuYO+jurVOW+rxvT9PPc5jPVQMOZGowP7IO344lNqKsBTszdVVzPuVHugBT+5VSPvKv9rbRcKQBBZPZS2rJydTx5FRQZolKK4fqbEFSpyy1wXIKfsoRVxEF4dYGweDkXBjguscpGkgvP4wRwY+nPLO2c7X1SKZJf8zycLacv/8YBbcmj+heUQOqjMqDxI32mVRVnH6FS1wV3GbTEml9GiytPATjEU5Nn8+x3LA2DuBQpye9w80VOhivsU+n//WJD62+zF+kqlXDVgTpeEcLYTYbskebfyL9qabAhjW/NnILaE+i6jWAQQgxTFgdsoWWfBxN4HAcZ2fEtTqx7vc2yUVm0a0h8b1HoK5FinnF0uA6lFjnytzcWVoXsusX8fjvBmsDX18JfJmTxxY0cPpN7/WGCu5rmlsmE1danVxC93WZfbRlMv2Om3D22UR3Bt2x7GSTEJIEaM+mEa4YkmerlKQIiPOV61fRqnXwlFT1Zt750N4sft7WS8oSasSV3PEh39e6anKcCcOy6RFVnhYfiWp5BogzPM4CXLDZSD7gXsAKvU+9u1zov32aqGfGZxq927LBF/hAGNZD+znLaGRFJ/lRyl4nlcrbyqMFsxe3Yyv6VwACsFqwfbL5z3oau8O/rmfkvjY/cGKVpIxXLp6brXpjEHxiTHM/EAsnf7nlY5rkW17PE81Y7DD5Ba/S1MC4mbuAjHazGYhKqN8dvsxCFrekRLEoMQcsYcHdEVvOIuar2shAJ4ZHTs8sQv3uEzaq/D6pJw9Zmnp3Gjkx/8/Vmvv7mrR2BTrjKbf3uIt4w/vBm8c+vO8CNEXMh4H9NcEqzf5/BBElth44vKBJw55EZ4jF6QkLpQKXtZIojU6gSd/BY+xz3UsOG5nqKmeEorWfJdPJ8O9Ai/wgNc8WAKvKAF3QIpBDeyYdE2+YK+ysQcXPXVV6oXe9jsJ/zia3sqBjTNlg0hiLN4oVebht1TLyfB4oDgR71s/QbN8I8yq7e9ICua59FWOx2vdWlu/HxA+alQmvGLxUJXJlLr4n2N//6H1Ci5g76GoDF/vaAQkA3ZI/NnJUH/PcBjBCzVMAAAAAAAAAAAAAAAlRwDsfAiqDUYtQDTNhEFfdbUalHtktoRlfoKH9fa7d2xWkgAAAAAAAAAAAA';

export default function PensumPrognoseModell() {
  const [activeTab, setActiveTab] = useState('input');
  const [showPessimistic, setShowPessimistic] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [autoRebalanserAllokering, setAutoRebalanserAllokering] = useState(true);
  const [autoRebalanserPensum, setAutoRebalanserPensum] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({ aksjer: false, renter: false });
  const [expandedKundeKategorier, setExpandedKundeKategorier] = useState({ likvide: true, illikvide: true, pe: false, eiendom: false });

  // Bruker-autentisering
  const [bruker, setBruker] = useState(null); // { epost, pin, navn }
  const [visLoginModal, setVisLoginModal] = useState(false);
  const [visRegistrerModal, setVisRegistrerModal] = useState(false);
  const [loginEpost, setLoginEpost] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [registrerEpost, setRegistrerEpost] = useState('');
  const [registrerPin, setRegistrerPin] = useState('');
  const [registrerNavn, setRegistrerNavn] = useState('');
  const [authFeilmelding, setAuthFeilmelding] = useState('');
  const [ventPaaRegistrering, setVentPaaRegistrering] = useState(false); // Venter på registrering før lagring

  const [kundeNavn, setKundeNavn] = useState('');
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
  
  const [scenarioParams, setScenarioParams] = useState({ pessimistisk: -2, optimistisk: 12 });
  const [dashboardPeriode, setDashboardPeriode] = useState('5y');
  const [dashboardProdukter, setDashboardProdukter] = useState(['basis', 'global-core-active', 'global-edge', 'global-hoyrente', 'nordisk-hoyrente', 'norge-a', 'energy-a']);
  const [sammenligningPeriodeScen, setSammenligningPeriodeScen] = useState('max');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfProduktValg, setPdfProduktValg] = useState([]);
  const [valgtePensumScen, setValgtePensumScen] = useState(['Global Core Active', 'Basis', 'Global Høyrente', 'Norske Aksjer', 'Global Energy']);
  const [valgteIndekserScen, setValgteIndekserScen] = useState([]);
  const [sammenligningProfil, setSammenligningProfil] = useState('Offensiv');
  const [sammenligningAllokering, setSammenligningAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Offensiv'));
  const [allokering, setAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Moderat'));

  // Rebalansering - årlig endring i allokering
  const [rebalanseringAktiv, setRebalanseringAktiv] = useState(false);
  const [rebalansering, setRebalansering] = useState({
    fraAktiva: 'Eiendom',
    tilAktiva: 'Globale Aksjer',
    prosentPerAar: 10
  });

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
  const [valgteProdukterHistorikk, setValgteProdukterHistorikk] = useState(['global-core-active', 'global-edge', 'basis']);
  
  // Valgt produkt for detaljvisning
  const [valgtProduktDetalj, setValgtProduktDetalj] = useState(null);
  
  const [pensumProdukter, setPensumProdukter] = useState(() => JSON.parse(JSON.stringify(defaultPensumProdukter)));
  
  // Admin-innstillinger
  const [adminPassord, setAdminPassord] = useState('');
  const [erAdmin, setErAdmin] = useState(false);
  const [adminMelding, setAdminMelding] = useState('');
  const ADMIN_PASSORD = 'pensum2024'; // Enkelt passord - kan endres

  const storageGet = async (key) => {
    if (typeof window === 'undefined') return null;
    if (window.storage && window.storage.get) {
      const result = await window.storage.get(key);
      return result && result.value ? result.value : null;
    }
    return window.localStorage.getItem(key);
  };

  const storageSet = async (key, value) => {
    if (typeof window === 'undefined') return false;
    if (window.storage && window.storage.set) {
      await window.storage.set(key, value);
      return true;
    }
    window.localStorage.setItem(key, value);
    return true;
  };

  const storageDelete = async (key) => {
    if (typeof window === 'undefined') return false;
    if (window.storage && window.storage.delete) {
      await window.storage.delete(key);
      return true;
    }
    window.localStorage.removeItem(key);
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
    globaleAksjer: 9,
    norskeAksjer: 10,
    hoyrente: 8,
    investmentGrade: 5,
    privateEquity: 15,
    eiendom: 8
  });
  
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
      } catch (e) {
        console.log('Kunne ikke laste admin-data:', e);
      }
    };
    lastAdminData();
  }, []);

  // Innstillinger for Pensum Løsninger
  const [visAlternative, setVisAlternative] = useState(false);
  const [brukBasis, setBrukBasis] = useState(true);

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
      { name: 'Aksjer', value: aksjeVekt, color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: renteVekt, color: PENSUM_COLORS.salmon },
      { name: 'Alternativer', value: alternativVekt, color: PENSUM_COLORS.teal },
      { name: 'Blandet', value: blandetVekt, color: PENSUM_COLORS.gold }
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
        // Bruk 3-års annualisert eller forventet avkastning
        const nokkeltall = beregnProduktNokkeltall(produkt);
        const avkastning = nokkeltall.aarlig3ar || produkt.forventetAvkastning || produkt.aar2024 || 0;
        vektetSum += avkastning * allok.vekt;
        totalVekt += allok.vekt;
      }
    });
    
    return totalVekt > 0 ? vektetSum / totalVekt : 0;
  }, [pensumAllokering, pensumProdukter]);

  
  const valgtLosning = null; // Fjernet gammel state

  // Last lagrede kunder ved oppstart
  useEffect(() => {
    const lastKunder = async () => {
      if (radgiver) {
        const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
        try {
          // Prøv window.storage først (Claude's persistent storage)
          if (window.storage && window.storage.get) {
            const result = await window.storage.get(storageKey);
            if (result && result.value) {
              setLagredeKunder(JSON.parse(result.value));
              return;
            }
          }
        } catch (e) {
          console.log('Storage not available:', e);
        }
        // Fallback: ingen lagrede kunder
        setLagredeKunder([]);
      }
    };
    lastKunder();
  }, [radgiver]);

  // Hent alle data som objekt
  const getKundeData = useCallback(() => ({
    id: aktivKundeId || Date.now().toString(),
    kundeNavn,
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
    sistEndret: new Date().toISOString()
  }), [aktivKundeId, kundeNavn, radgiver, dato, risikoprofil, horisont, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, innskudd, uttak, allokering, scenarioParams]);

  // Last inn kundedata
  const lastKundeData = useCallback((data) => {
    setAktivKundeId(data.id);
    setKundeNavn(data.kundeNavn || '');
    setDato(data.dato || new Date().toISOString().split('T')[0]);
    setRisikoprofil(data.risikoprofil || 'Moderat');
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
    setVisKundeliste(false);
    setActiveTab('input');
  }, []);

  // ============ BRUKER-AUTENTISERING ============
  
  // Last bruker fra storage ved oppstart
  useEffect(() => {
    const lastBruker = async () => {
      try {
        if (window.storage && window.storage.get) {
          const result = await window.storage.get('pensum_aktiv_bruker');
          if (result && result.value) {
            const brukerData = JSON.parse(result.value);
            setBruker(brukerData);
            if (brukerData.navn) setRadgiver(brukerData.navn);
          }
        }
      } catch (e) {
        console.log('Kunne ikke laste bruker:', e);
      }
    };
    lastBruker();
  }, []);

  // Registrer ny bruker
  const registrerBruker = useCallback(async () => {
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
      // Sjekk om e-post allerede er registrert
      const brukereKey = 'pensum_brukere';
      let brukere = {};
      
      if (window.storage && window.storage.get) {
        const result = await window.storage.get(brukereKey);
        if (result && result.value) {
          brukere = JSON.parse(result.value);
        }
      }

      const epostNormalisert = registrerEpost.toLowerCase().trim();
      if (brukere[epostNormalisert]) {
        setAuthFeilmelding('Denne e-postadressen er allerede registrert');
        return;
      }

      // Lagre ny bruker
      const nyBruker = {
        epost: epostNormalisert,
        pin: registrerPin,
        navn: registrerNavn,
        opprettet: new Date().toISOString()
      };
      
      brukere[epostNormalisert] = nyBruker;
      
      if (window.storage && window.storage.set) {
        await window.storage.set(brukereKey, JSON.stringify(brukere));
        await window.storage.set('pensum_aktiv_bruker', JSON.stringify(nyBruker));
      }

      setBruker(nyBruker);
      setRadgiver(nyBruker.navn);
      setVisRegistrerModal(false);
      setRegistrerEpost('');
      setRegistrerPin('');
      setRegistrerNavn('');
      
      // Hvis vi ventet på registrering for å lagre, gjør det nå
      if (ventPaaRegistrering) {
        setVentPaaRegistrering(false);
        setTimeout(() => lagreKundeEtterAuth(), 100);
      }
    } catch (e) {
      setAuthFeilmelding('Kunne ikke registrere bruker. Prøv igjen.');
      console.error('Registreringsfeil:', e);
    }
  }, [registrerEpost, registrerPin, registrerNavn, ventPaaRegistrering]);

  // Logg inn bruker
  const loggInnBruker = useCallback(async () => {
    setAuthFeilmelding('');
    
    if (!loginEpost || !loginPin) {
      setAuthFeilmelding('Vennligst fyll inn e-post og PIN');
      return;
    }

    try {
      const brukereKey = 'pensum_brukere';
      let brukere = {};
      
      if (window.storage && window.storage.get) {
        const result = await window.storage.get(brukereKey);
        if (result && result.value) {
          brukere = JSON.parse(result.value);
        }
      }

      const epostNormalisert = loginEpost.toLowerCase().trim();
      const brukerData = brukere[epostNormalisert];
      
      if (!brukerData) {
        setAuthFeilmelding('Fant ingen bruker med denne e-postadressen');
        return;
      }
      
      if (brukerData.pin !== loginPin) {
        setAuthFeilmelding('Feil PIN-kode');
        return;
      }

      // Lagre aktiv bruker
      if (window.storage && window.storage.set) {
        await window.storage.set('pensum_aktiv_bruker', JSON.stringify(brukerData));
      }

      setBruker(brukerData);
      setRadgiver(brukerData.navn);
      setVisLoginModal(false);
      setLoginEpost('');
      setLoginPin('');
      
      // Hvis vi ventet på innlogging for å lagre, gjør det nå
      if (ventPaaRegistrering) {
        setVentPaaRegistrering(false);
        setTimeout(() => lagreKundeEtterAuth(), 100);
      }
    } catch (e) {
      setAuthFeilmelding('Kunne ikke logge inn. Prøv igjen.');
      console.error('Innloggingsfeil:', e);
    }
  }, [loginEpost, loginPin, ventPaaRegistrering]);

  // Logg ut bruker
  const loggUtBruker = useCallback(async () => {
    try {
      if (window.storage && window.storage.delete) {
        await window.storage.delete('pensum_aktiv_bruker');
      }
    } catch (e) {
      console.log('Kunne ikke slette bruker fra storage:', e);
    }
    setBruker(null);
    setRadgiver('');
  }, []);

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
    
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, JSON.stringify(oppdatertListe));
        setLagredeKunder(oppdatertListe);
        setAktivKundeId(kundeData.id);
        setLagringsStatus('Lagret!');
        setTimeout(() => setLagringsStatus(''), 2000);
      } else {
        throw new Error('Storage not available');
      }
    } catch (e) {
      setLagredeKunder(oppdatertListe);
      setAktivKundeId(kundeData.id);
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
    
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, JSON.stringify(oppdatertListe));
      }
    } catch (e) {
      console.log('Could not save to storage:', e);
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
    const avkastning = pensumForventetAvkastning / 100;
    const prognose = [];
    let verdi = totalKapital;
    
    for (let i = 0; i <= horisont; i++) {
      prognose.push({
        year: new Date().getFullYear() + i,
        verdi: Math.round(verdi)
      });
      verdi = verdi * (1 + avkastning);
    }
    
    return prognose;
  }, [pensumForventetAvkastning, totalKapital, horisont]);

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
  }, [likvideTotal, peTotal, eiendomTotal, risikoprofil, effektivVisAlternative]);

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

  // Likvid vs Illikvid beregning (PE og Eiendom er illikvide)
  const likviditetData = useMemo(() => {
    const illikvideKategorier = ['privateMarkets', 'eiendom'];
    const illikvidVekt = allokering.filter(a => illikvideKategorier.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
    const likvidVekt = totalVekt - illikvidVekt;
    return [
      { name: 'Likvid', value: likvidVekt, belop: (likvidVekt / 100) * totalKapital },
      { name: 'Illikvid', value: illikvidVekt, belop: (illikvidVekt / 100) * totalKapital }
    ];
  }, [allokering, totalVekt, totalKapital]);

  // Renter vs Aksjer (andel av total portefølje)
  const renterAksjerData = useMemo(() => {
    const aksjerVekt = allokering.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0);
    const renterVekt = allokering.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0);
    return [
      { name: 'Renter', value: renterVekt },
      { name: 'Aksjer', value: aksjerVekt }
    ];
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
      
      // Beregn gjeldende allokering med rebalansering
      let gjeldendAllokering = aktiveAktiva.map(a => ({ ...a }));
      if (rebalanseringAktiv && i > 0) {
        const fraIdx = gjeldendAllokering.findIndex(a => a.navn === rebalansering.fraAktiva);
        const tilIdx = gjeldendAllokering.findIndex(a => a.navn === rebalansering.tilAktiva);
        if (fraIdx >= 0 && tilIdx >= 0) {
          // Beregn kumulativ endring over årene
          const endringPerAar = rebalansering.prosentPerAar;
          const totalEndring = Math.min(endringPerAar * i, gjeldendAllokering[fraIdx].vekt);
          gjeldendAllokering[fraIdx] = { ...gjeldendAllokering[fraIdx], vekt: Math.max(0, aktiveAktiva[fraIdx].vekt - totalEndring) };
          gjeldendAllokering[tilIdx] = { ...gjeldendAllokering[tilIdx], vekt: aktiveAktiva[tilIdx].vekt + totalEndring };
        }
      }
      
      gjeldendAllokering.forEach(asset => {
        if (i === 0) {
          row[asset.navn] = (asset.vekt / 100) * totalKapital;
        } else {
          // Finn forrige verdi og beregn ny verdi med eventuell rebalansering
          const prevRow = data[i - 1];
          const prevTotal = aktiveAktiva.reduce((s, a) => s + (prevRow[a.navn] || 0), 0);
          
          if (rebalanseringAktiv) {
            // Med rebalansering: redistribuer basert på ny allokering
            const originalAsset = aktiveAktiva.find(a => a.navn === asset.navn);
            const prevValue = prevRow[asset.navn] || 0;
            
            // Beregn hvor mye som flyttes
            const fraAsset = rebalansering.fraAktiva;
            const tilAsset = rebalansering.tilAktiva;
            const endringProsent = rebalansering.prosentPerAar / 100;
            
            let nyVerdi = prevValue;
            if (asset.navn === fraAsset && prevRow[fraAsset] > 0) {
              // Selg andel fra denne aktiva
              const salgVerdi = prevRow[fraAsset] * endringProsent;
              nyVerdi = (prevValue - salgVerdi) * (1 + asset.avkastning / 100);
            } else if (asset.navn === tilAsset) {
              // Kjøp andel til denne aktiva
              const fraVerdi = prevRow[fraAsset] || 0;
              const kjopVerdi = fraVerdi * endringProsent;
              nyVerdi = (prevValue + kjopVerdi + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
            } else {
              // Ingen endring, bare vekst
              nyVerdi = (prevValue + (originalAsset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
            }
            row[asset.navn] = Math.max(0, nyVerdi);
          } else {
            // Uten rebalansering: normal vekst
            const prev = prevRow[asset.navn] || 0;
            row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
          }
        }
      });
      row.total = aktiveAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      
      // Lagre allokering-snapshot for dette året
      row.allokeringSnapshot = gjeldendAllokering.map(a => ({ navn: a.navn, vekt: row.total > 0 ? (row[a.navn] / row.total) * 100 : 0 }));
      
      data.push(row);
    }
    return data;
  }, [aktiveAktiva, totalKapital, nettoKontantstrom, horisont, rebalanseringAktiv, rebalansering]);

  const sammenligningVerdiutvikling = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      sammenligningAktiva.forEach(asset => {
        if (i === 0) row[asset.navn] = (asset.vekt / 100) * totalKapital;
        else {
          const prev = data[i - 1][asset.navn] || 0;
          row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
        }
      });
      row.total = sammenligningAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      data.push(row);
    }
    return data;
  }, [sammenligningAktiva, totalKapital, nettoKontantstrom, horisont]);

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
      row.forventet = verdiutvikling[i]?.total || totalKapital;
      // Pessimistisk og optimistisk beregnes med justerte rater
      if (i === 0) {
        row.pessimistisk = totalKapital;
        row.optimistisk = totalKapital;
      } else {
        row.pessimistisk = (data[i-1].pessimistisk + nettoKontantstrom) * (1 + scenarioParams.pessimistisk / 100);
        row.optimistisk = (data[i-1].optimistisk + nettoKontantstrom) * (1 + scenarioParams.optimistisk / 100);
      }
      data.push(row);
    }
    return data;
  }, [totalKapital, nettoKontantstrom, verdiutvikling, scenarioParams, horisont]);

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
      const newVekt = totalKapital > 0 ? (newBelop / totalKapital) * 100 : 0;
      updated[index] = { ...updated[index], vekt: parseFloat(newVekt.toFixed(1)) };
      return updated;
    });
  }, [totalKapital]);

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
    
    const allokeringRows = aktiveAktiva.map(a => 
      '<tr><td style="padding:12px;border-bottom:1px solid #E2E8F0"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + '</td><td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:center">' + formatPercent(a.vekt) + '</td><td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:right">' + formatCurrency((a.vekt/100)*totalKapital) + '</td></tr>'
    ).join('');
    
    // Create SVG pie chart
    let pieSlices = '';
    let cumulative = 0;
    const pieColors = aktiveAktiva.map(a => ASSET_COLORS[a.navn] || '#888');
    aktiveAktiva.forEach((a, i) => {
      const pct = a.vekt / 100;
      const startAngle = cumulative * 2 * Math.PI - Math.PI/2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI/2;
      const largeArc = pct > 0.5 ? 1 : 0;
      const x1 = 80 + 60 * Math.cos(startAngle);
      const y1 = 80 + 60 * Math.sin(startAngle);
      const x2 = 80 + 60 * Math.cos(endAngle);
      const y2 = 80 + 60 * Math.sin(endAngle);
      if (pct > 0.001) {
        pieSlices += '<path d="M80,80 L' + x1 + ',' + y1 + ' A60,60 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + ' Z" fill="' + pieColors[i] + '"/>';
      }
    });
    const pieSvg = '<svg width="160" height="160" viewBox="0 0 160 160">' + pieSlices + '<circle cx="80" cy="80" r="35" fill="white"/></svg>';
    
    // Create legend
    const legend = aktiveAktiva.map(a => 
      '<div style="display:flex;align-items:center;gap:6px;font-size:11px;margin:4px 0"><span style="width:10px;height:10px;border-radius:50%;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + ' (' + a.vekt.toFixed(1) + '%)</div>'
    ).join('');
    
    // Create stacked bar chart for value development
    const maxVal = Math.max(...verdiutvikling.map(r => r.total));
    const barWidth = Math.min(50, 540 / verdiutvikling.length - 6);
    const chartWidth = verdiutvikling.length * (barWidth + 6) + 100;
    let bars = '';
    
    // Y-axis labels - smart stepping based on max value
    let stepSize, yAxisMax;
    if (maxVal < 10) {
      // Very small values (like 100kr portfolio shown as percentages)
      stepSize = maxVal <= 50 ? 10 : 20;
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    } else if (maxVal < 1000) {
      stepSize = maxVal <= 200 ? 50 : maxVal <= 500 ? 100 : 200;
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    } else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
      const normalized = maxVal / magnitude;
      if (normalized <= 2) stepSize = magnitude * 0.5;
      else if (normalized <= 5) stepSize = magnitude;
      else stepSize = magnitude * 2;
      
      // Ensure we have 4-6 labels
      while (maxVal / stepSize > 6) stepSize *= 2;
      while (maxVal / stepSize < 3) stepSize /= 2;
      
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    }
    
    const yAxisLabels = [];
    for (let v = 0; v <= yAxisMax; v += stepSize) {
      yAxisLabels.push(v);
    }
    
    // Format numbers nicely based on size
    const formatYLabel = (v) => {
      if (v === 0) return '0';
      if (v >= 1000000000) return 'kr ' + (v / 1000000000).toFixed(v % 1000000000 === 0 ? 0 : 1) + ' mrd';
      if (v >= 1000000) return 'kr ' + (v / 1000000).toFixed(0) + ' mill';
      if (v >= 1000) return 'kr ' + (v / 1000).toFixed(0) + ' k';
      return 'kr ' + v.toFixed(0);
    };
    
    let yAxis = '';
    yAxisLabels.forEach(v => {
      const y = 190 - (v / yAxisMax) * 180;
      yAxis += '<text x="75" y="' + (y + 4) + '" text-anchor="end" font-size="9" fill="#64748B">' + formatYLabel(v) + '</text>';
      yAxis += '<line x1="78" y1="' + y + '" x2="' + (chartWidth - 10) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="' + (v === 0 ? '0' : '3,3') + '"/>';
    });
    
    verdiutvikling.forEach((row, i) => {
      const x = 85 + i * (barWidth + 6);
      let yOffset = 0;
      
      // Stack each asset class
      aktiveAktiva.forEach(asset => {
        const val = row[asset.navn] || 0;
        const barHeight = (val / yAxisMax) * 180;
        const y = 190 - yOffset - barHeight;
        bars += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" fill="' + (ASSET_COLORS[asset.navn] || '#888') + '"/>';
        yOffset += barHeight;
      });
      
      // Year label
      if (verdiutvikling.length <= 11 || i % 2 === 0) {
        bars += '<text x="' + (x + barWidth/2) + '" y="205" text-anchor="middle" font-size="10" fill="#64748B">' + row.year + '</text>';
      }
    });
    
    // Bar chart legend
    const barLegend = aktiveAktiva.map(a => 
      '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:10px"><span style="width:10px;height:10px;border-radius:2px;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + '</span>'
    ).join('');
    
    const barSvg = '<svg width="100%" height="220" viewBox="0 0 ' + chartWidth + ' 220" preserveAspectRatio="xMidYMid meet">' + yAxis + bars + '</svg>';
    
    // Create detailed value development table
    const verdiTableHeader = '<tr style="background:#F8FAFC"><th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:600">År</th>' + aktiveAktiva.map(a => '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">' + a.navn + '</th>').join('') + '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">Total</th></tr>';
    const verdiTableRows = verdiutvikling.map((row, idx) => 
      '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#F8FAFC') + '"><td style="padding:6px;font-weight:500;font-size:11px">' + row.year + '</td>' + aktiveAktiva.map(a => '<td style="padding:6px;text-align:right;font-size:10px;color:#64748B">' + formatCurrency(row[a.navn] || 0) + '</td>').join('') + '<td style="padding:6px;text-align:right;font-size:11px;font-weight:600">' + formatCurrency(row.total) + '</td></tr>'
    ).join('');
    
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Investeringsprognose - ' + (kundeNavn || 'Kunde') + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;color:#1B3A5F;line-height:1.5;background:#fff}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:15mm}}.page{max-width:800px;margin:0 auto}.header{background:#fff;padding:25px 40px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between}.header-right{text-align:right}.header-right h1{font-size:18px;color:#1B3A5F;margin-bottom:2px}.header-right p{color:#64748B;font-size:12px}.content{padding:30px 40px}.info{display:flex;flex-wrap:wrap;gap:6px 30px;margin-bottom:25px;font-size:13px}.info div{flex:1 1 45%}.info span{color:#64748B}.info strong{color:#1B3A5F}.section{margin-bottom:25px}.section h2{font-size:15px;font-weight:700;color:#1B3A5F;border-bottom:2px solid #1B3A5F;padding-bottom:6px;margin-bottom:14px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{background:#F8FAFC;border-radius:8px;padding:14px 10px;text-align:center}.card-label{font-size:10px;color:#64748B;margin-bottom:3px}.card-value{font-size:16px;font-weight:700;color:#1B3A5F}.card-value.green{color:#16A34A}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#F8FAFC;padding:10px;text-align:left;font-weight:600}td{padding:10px}.alloc-grid{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start}.pie-section{display:flex;flex-direction:column;align-items:center}.scenarios{display:grid;grid-template-columns:1fr 1fr;gap:12px}.box{padding:18px;border-radius:10px;text-align:center}.box-label{font-size:12px;font-weight:600;margin-bottom:4px}.box-value{font-size:20px;font-weight:700}.chart-section{margin-top:10px;padding:15px;background:#FAFAFA;border-radius:8px}.chart-legend{text-align:center;margin-bottom:10px;padding:8px;background:#fff;border-radius:6px}.disclaimer{font-size:9px;color:#64748B;background:#F8FAFC;padding:14px;border-radius:6px;margin-top:25px}.footer{background:#F8FAFC;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#64748B;margin-top:15px}.footer-logo{height:45px}.detail-table{font-size:11px;margin-top:10px}</style></head><body><div class="page"><div class="header"><img src="' + PENSUM_LOGO + '" alt="Pensum" style="height:70px"><div class="header-right"><h1>Investeringsprognose</h1><p>' + formatDateEuro(dato) + '</p></div></div><div class="content"><div class="info"><div><span>Kunde:</span> <strong>' + (kundeNavn || '—') + '</strong></div><div><span>Rådgiver:</span> <strong>' + (radgiver || '—') + '</strong></div><div><span>Risikoprofil:</span> <strong>' + risikoprofil + '</strong></div><div><span>Horisont:</span> <strong>' + horisont + ' år</strong></div></div><div class="section"><h2>Nøkkeltall</h2><div class="grid4"><div class="card"><div class="card-label">Startkapital</div><div class="card-value">' + formatCurrency(totalKapital) + '</div></div><div class="card"><div class="card-label">Horisont</div><div class="card-value">' + horisont + ' år</div></div><div class="card"><div class="card-label">Forv. avkastning</div><div class="card-value">' + formatPercent(vektetAvkastning) + '</div></div><div class="card"><div class="card-label">Sluttverdi</div><div class="card-value green">' + formatCurrency(sluttverdi) + '</div></div></div></div><div class="section"><h2>Anbefalt allokering</h2><div class="alloc-grid"><table><thead><tr><th>Aktivaklasse</th><th style="text-align:center">Andel</th><th style="text-align:right">Beløp</th></tr></thead><tbody>' + allokeringRows + '</tbody></table><div class="pie-section">' + pieSvg + '<div style="margin-top:10px">' + legend + '</div></div></div></div><div class="section"><h2>Forventet verdiutvikling</h2><div class="chart-section"><div class="chart-legend">' + barLegend + '</div>' + barSvg + '<div style="text-align:center;margin-top:8px;font-size:11px;color:#64748B">Sluttverdi: <strong style="color:#1B3A5F">' + formatCurrency(sluttverdi) + '</strong></div></div></div><div class="section"><h2>Scenarioanalyse etter ' + horisont + ' år</h2><div class="scenarios"><div class="box" style="background:#F8FAFC;border:2px solid #1B3A5F"><div class="box-label" style="color:#1B3A5F">Forventet</div><div class="box-value" style="color:#1B3A5F">' + formatCurrency(forventetSluttverdi) + '</div></div><div class="box" style="background:#DCFCE7"><div class="box-label" style="color:#16A34A">Optimistisk</div><div class="box-value" style="color:#16A34A">' + formatCurrency(optimistiskSluttverdi) + '</div></div></div></div><div class="section"><h2>Detaljert verdiutvikling</h2><table class="detail-table"><thead>' + verdiTableHeader + '</thead><tbody>' + verdiTableRows + '</tbody></table></div><div class="disclaimer"><strong>Viktig informasjon:</strong> Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke.</div></div><div class="footer"><img src="' + PENSUM_LOGO + '" alt="Pensum" class="footer-logo"><div>Frøyas gate 15, 0273 Oslo · +47 23 89 68 44 · pensumgroup.no</div></div></div></body></html>';
    
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

      const produktMap = [...(pensumProdukter?.enkeltfond || []), ...(pensumProdukter?.fondsportefoljer || [])]
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
        kundeNavn: kundeNavn || 'Investor',
        totalKapital: investerbarKapital,
        totalFormue: totalKapital,
        investerbarKapital,
        risikoProfil: risikoprofil,
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
        }
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

  // Effektivt investert beløp (bruker manuelt beløp hvis satt, ellers totalKapital)
  const effektivtInvestertBelop = investertBelop !== null ? investertBelop : totalKapital;


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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <h3 className="text-lg font-semibold text-white">Logg inn eller registrer deg</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                For å lagre kunder må du logge inn. Har du ikke bruker? Registrer deg gratis.
              </p>
              
              {authFeilmelding && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {authFeilmelding}
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                  <input 
                    type="email" 
                    value={loginEpost} 
                    onChange={(e) => setLoginEpost(e.target.value)}
                    placeholder="din@epost.no"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onKeyDown={(e) => e.key === 'Enter' && loggInnBruker()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN-kode</label>
                  <input 
                    type="password" 
                    value={loginPin} 
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onKeyDown={(e) => e.key === 'Enter' && loggInnBruker()}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={loggInnBruker}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                >
                  Logg inn
                </button>
                <button 
                  onClick={() => { setVisLoginModal(false); setVisRegistrerModal(true); setAuthFeilmelding(''); }}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Ny bruker
                </button>
              </div>
              
              <button 
                onClick={() => { setVisLoginModal(false); setVentPaaRegistrering(false); setAuthFeilmelding(''); }}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Registrer Modal */}
      {visRegistrerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.teal }}>
              <h3 className="text-lg font-semibold text-white">Opprett ny bruker</h3>
            </div>
            <div className="p-6">
              {authFeilmelding && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {authFeilmelding}
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ditt navn</label>
                  <input 
                    type="text" 
                    value={registrerNavn} 
                    onChange={(e) => setRegistrerNavn(e.target.value)}
                    placeholder="Ola Nordmann"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                  <input 
                    type="email" 
                    value={registrerEpost} 
                    onChange={(e) => setRegistrerEpost(e.target.value)}
                    placeholder="din@epost.no"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Velg PIN-kode (minst 4 tegn)</label>
                  <input 
                    type="password" 
                    value={registrerPin} 
                    onChange={(e) => setRegistrerPin(e.target.value)}
                    placeholder="••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onKeyDown={(e) => e.key === 'Enter' && registrerBruker()}
                  />
                </div>
              </div>
              
              <button 
                onClick={registrerBruker}
                className="w-full mt-6 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: PENSUM_COLORS.teal }}
              >
                Opprett bruker
              </button>
              
              <button 
                onClick={() => { setVisRegistrerModal(false); setVisLoginModal(true); setAuthFeilmelding(''); }}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Har allerede bruker? Logg inn
              </button>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !pdfLoading && setPdfModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 rounded-t-2xl" style={{ backgroundColor: '#0D2240' }}>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <div>
                  <h2 className="text-lg font-bold text-white">Generer investeringsforslag (PowerPoint)</h2>
                  <p className="text-blue-300 text-sm mt-0.5">PowerPoint med allokering, produkter og malmetadata</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Kundeinfo oppsummering */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                {[
                  ['Kunde', kundeNavn || '—'],
                  ['Total kapital', new Intl.NumberFormat('nb-NO', {style:'currency',currency:'NOK',maximumFractionDigits:0}).format(totalKapital)],
                  ['Risikoprofil', risikoprofil],
                  ['Forv. avkastning', vektetAvkastning.toFixed(1) + '% p.a.'],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{lbl}</div>
                    <div className="font-semibold text-sm mt-0.5" style={{ color: '#0D2240' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Produktvalg */}
              <div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#0D2240' }}>Velg Pensum-produkter å inkludere</div>
                <p className="text-xs text-gray-400 mb-3">Velger du ingen inkluderes alle tilgjengelige produkter automatisk</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRODUKT_NAVN_MAP_PDF).map(([id, navn]) => {
                    const aktiv = pdfProduktValg.includes(id);
                    const farger = {
                      'global-core-active': '#0D2240', 'global-edge': '#5B9BD5', 'basis': '#1B3A5F',
                      'global-hoyrente': '#16A34A', 'nordisk-hoyrente': '#7C3AED', 'norge-a': '#DC2626',
                      'energy-a': '#F59E0B', 'banking-d': '#0891B2', 'financial-d': '#D4886B',
                    };
                    return (
                      <button key={id} onClick={() => setPdfProduktValg(prev => aktiv ? prev.filter(x => x !== id) : [...prev, id])}
                        className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                        style={aktiv ? { backgroundColor: farger[id], borderColor: farger[id] } : {}}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'rgba(255,255,255,0.7)' : farger[id] }}></span>
                        {navn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template-advarsel */}
              {(malKreverOpplasting || (Boolean(pdfMalConfig?.filnavn) && !pdfMalConfig?.filDataUrl)) && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                  <p className="text-xs text-amber-800">Malfil «{pdfMalConfig.filnavn}» er ikke tilgjengelig i denne økten. Presentasjonen genereres uten template-merge. Last opp filen i Admin for å bruke din PPTX-mal.</p>
                </div>
              )}

              {/* AI-info */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-blue-700">Presentasjonen genereres fra kundeinformasjon, investerbar kapital, valgte produkter, rapportfelt i Pensum Løsninger og maloppsett.</p>
              </div>
            </div>

            {/* Footer med knapper */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setPdfModal(false)} disabled={pdfLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                Avbryt
              </button>
              <button onClick={handleGeneratePresentation} disabled={pdfLoading}
                className="flex-2 py-2.5 px-6 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 min-w-[180px]"
                style={{ backgroundColor: pdfLoading ? '#6B7280' : '#D4886B' }}>
                {pdfLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Genererer PowerPoint...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Last ned PowerPoint
                  </>
                )}
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
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-green-700 font-medium">{bruker.navn}</span>
                </div>
                <button onClick={loggUtBruker} className="text-gray-400 hover:text-gray-600" title="Logg ut">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
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
              <button onClick={lagreKunde} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: lagringsStatus ? '#16A34A' : PENSUM_COLORS.darkBlue }}>
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
              {['input', 'allokering', 'losninger', 'scenario', 'dashboard', 'rapport'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={"px-5 py-3 font-medium whitespace-nowrap text-sm " + (activeTab === tab ? "text-white border-b-2 border-white" : "text-blue-200 hover:text-white")}>
                  {tab === 'input' ? 'Kundeinformasjon' : tab === 'allokering' ? 'Allokering & Prognose' : tab === 'losninger' ? 'Pensum Løsninger' : tab === 'scenario' ? 'Scenarioanalyse' : tab === 'dashboard' ? '📊 Analyse Dashboard' : 'Kunderapport'}
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
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Kundeinformasjon</h3></div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Kundenavn</label>
                  <input type="text" defaultValue={kundeNavn} onBlur={(e) => setKundeNavn(e.target.value)} placeholder="Skriv inn kundenavn" className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Risikoprofil</label>
                  <select value={risikoprofil} onChange={(e) => setRisikoprofil(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4">
                    <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{RISK_PROFILES[risikoprofil].aksjer}% aksjer, {RISK_PROFILES[risikoprofil].renter}% renter</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringshorisont</label>
                  <div className="relative">
                    <input type="text" value={localHorisont} onChange={(e) => setLocalHorisont(e.target.value)} onBlur={() => { const v = Math.max(1, Math.min(50, parseInt(localHorisont,10)||10)); setHorisont(v); setLocalHorisont(v.toString()); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">år</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Rådgiver</label>
                  <input type="text" defaultValue={radgiver} onBlur={(e) => setRadgiver(e.target.value)} placeholder="Navn på rådgiver" className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Dato</label>
                  <input type="date" value={dato} onChange={(e) => setDato(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
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
            </div>
          </div>
        )}

        {activeTab === 'allokering' && (
          <div className="space-y-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  {/* Investert beløp */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Investert beløp:</label>
                    <input 
                      type="text" 
                      value={investertBelop !== null ? formatNumber(investertBelop) : formatNumber(totalKapital)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')) || 0;
                        setInvestertBelop(value);
                      }}
                      className="border border-gray-200 rounded-lg py-2 px-3 w-36 text-right"
                    />
                    {investertBelop !== null && (
                      <button 
                        onClick={() => setInvestertBelop(null)} 
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        title="Tilbakestill til kundeinformasjon"
                      >
                        Tilbakestill
                      </button>
                    )}
                  </div>
                  {/* Risikoprofil */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Risikoprofil:</label>
                    <select value={risikoprofil} onChange={(e) => resetTilAutomatisk(e.target.value)} className="border border-gray-200 rounded-lg py-2 px-4">
                      <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                    </select>
                  </div>
                  {/* Alternative investeringer checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={effektivVisAlternative} 
                      onChange={(e) => setVisAlternativeAllokering(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.teal }}>Alternative investeringer</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowComparison(!showComparison)} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border " + (showComparison ? "bg-purple-100 border-purple-300 text-purple-700" : "border-gray-200 hover:bg-gray-100")} style={{ color: showComparison ? undefined : PENSUM_COLORS.darkBlue }}>
                    {showComparison ? 'Skjul sammenligning' : 'Sammenlign'}
                  </button>
                  <button onClick={() => { setVisAlternativeAllokering(null); resetTilAutomatisk(); setInvestertBelop(null); }} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-100" style={{ color: PENSUM_COLORS.darkBlue }}>Tilbakestill alt</button>
                </div>
              </div>
              {showComparison && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.purple }}>Utgangspunkt:</span>
                    <select value={sammenligningProfil} onChange={(e) => oppdaterSammenligningProfil(e.target.value)} className="border border-purple-200 rounded-lg py-2 px-4 bg-purple-50">
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
                  <div className="p-6 overflow-x-auto">
                    <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
                      <label className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <input type="checkbox" checked={autoRebalanserAllokering} onChange={(e) => setAutoRebalanserAllokering(e.target.checked)} className="w-3.5 h-3.5" />
                        Auto-balanser til 100%
                      </label>
                      <button onClick={normaliserAllokeringTil100} className="text-xs px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">
                        Juster til 100%
                      </button>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivaklasse</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Vekting</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Beløp</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Forv. avk.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'aksjer')} isExpanded={expandedCategories.aksjer} onToggle={() => toggleCategory('aksjer')} />
                        {expandedCategories.aksjer && allokering.filter(a => a.kategori === 'aksjer').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />)}
                        <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'renter')} isExpanded={expandedCategories.renter} onToggle={() => toggleCategory('renter')} />
                        {expandedCategories.renter && allokering.filter(a => a.kategori === 'renter').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />)}
                        {/* Alternative investeringer - vises kun når checkbox er på */}
                        {effektivVisAlternative && (
                          <>
                            {allokering.find(a => a.navn === 'Private Equity') && <AllokeringRow item={allokering.find(a => a.navn === 'Private Equity')} index={allokering.findIndex(a => a.navn === 'Private Equity')} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />}
                            {allokering.find(a => a.navn === 'Eiendom') && <AllokeringRow item={allokering.find(a => a.navn === 'Eiendom')} index={allokering.findIndex(a => a.navn === 'Eiendom')} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />}
                          </>
                        )}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <td className="py-4 px-4 font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Sum</td>
                          <td className={"py-4 px-2 text-center font-bold " + (Math.abs(totalVekt - 100) < 0.5 ? "text-green-600" : "text-red-600")}>{formatPercent(totalVekt)}</td>
                          <td className="py-4 px-2 text-center font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(investertBelop !== null ? investertBelop : totalKapital)}</td>
                          <td className="py-4 px-2 text-center font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(vektetAvkastning)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2">
                <div className="grid grid-cols-1 gap-4">
                  {/* Porteføljesammensetning */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Porteføljesammensetning</h3></div>
                    <div className="p-3">
                      {showComparison ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h4 className="text-center text-xs font-semibold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</h4>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={45} dataKey="value">{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || '#888'} stroke="white" strokeWidth={1} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} /></PieChart></ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="text-center text-xs font-semibold mb-1" style={{ color: PENSUM_COLORS.purple }}>{sammenligningProfil}</h4>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={sammenligningPieData} cx="50%" cy="50%" outerRadius={45} dataKey="value">{sammenligningPieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS_LIGHT[e.name] || ASSET_COLORS[e.name] || '#888'} stroke="white" strokeWidth={1} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} /></PieChart></ResponsiveContainer>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} cx="50%" cy="45%" outerRadius={55} dataKey="value">{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === e.name)?.kategori] || '#888'} stroke="white" strokeWidth={2} />)}</Pie><Tooltip formatter={(v, n) => [v.toFixed(1) + '%', n]} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} /></PieChart></ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  
                  {/* Likviditet og Aktiva side om side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Likviditet */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Likviditet</h3></div>
                      <div className="p-3">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie data={likviditetData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={40} dataKey="value">
                              <Cell fill={PENSUM_COLORS.darkBlue} />
                              <Cell fill={PENSUM_COLORS.salmon} />
                            </Pie>
                            <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                            <span className="text-xs text-gray-600">Likvid ({formatPercent(likviditetData[0].value)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.salmon }}></div>
                            <span className="text-xs text-gray-600">Illikvid ({formatPercent(likviditetData[1].value)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Aktiva */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Aktiva</h3></div>
                      <div className="p-3">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie data={renterAksjerData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={40} dataKey="value">
                              <Cell fill={PENSUM_COLORS.darkBlue} />
                              <Cell fill={PENSUM_COLORS.salmon} />
                            </Pie>
                            <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                            <span className="text-xs text-gray-600">Renter ({formatPercent(renterAksjerData[0].value)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.salmon }}></div>
                            <span className="text-xs text-gray-600">Aksjer ({formatPercent(renterAksjerData[1].value)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Selg fra</label>
                      <select value={rebalansering.fraAktiva} onChange={(e) => setRebalansering(prev => ({ ...prev, fraAktiva: e.target.value }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm">
                        {allokering.map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Kjøp til</label>
                      <select value={rebalansering.tilAktiva} onChange={(e) => setRebalansering(prev => ({ ...prev, tilAktiva: e.target.value }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm">
                        {allokering.filter(a => a.navn !== rebalansering.fraAktiva).map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Andel per år</label>
                      <div className="relative">
                        <input type="number" min="1" max="100" value={rebalansering.prosentPerAar} onChange={(e) => setRebalansering(prev => ({ ...prev, prosentPerAar: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 pr-10 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <p className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Effekt:</p>
                      <p>{rebalansering.prosentPerAar}% av {rebalansering.fraAktiva} selges årlig og reinvesteres i {rebalansering.tilAktiva}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
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
              <StatCard label="Startkapital" value={formatCurrency(totalKapital)} />
              <StatCard label="Forventet avkastning" value={formatPercent(vektetAvkastning)} subtext="årlig" />
              <StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((verdiutvikling[verdiutvikling.length - 1]?.total || 0) - totalKapital - (nettoKontantstrom * horisont))} color={PENSUM_COLORS.green} />
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
                    {showComparison && <Bar dataKey="total_alt" stackId="b" fill={PENSUM_COLORS.purple} name={"Total (" + sammenligningProfil + ")"} opacity={0.7} />}
                  </BarChart>
                </ResponsiveContainer>
                {showComparison && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)}</p></div>
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.purple }}>{sammenligningProfil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.purple }}>{formatCurrency(sammenligningVerdiutvikling[sammenligningVerdiutvikling.length - 1]?.total || 0)}</p></div>
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
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  {/* Venstre: Allokering */}
                  <div className="xl:col-span-3">
                    <h4 className="font-semibold mb-4 flex items-center justify-between" style={{ color: PENSUM_COLORS.darkBlue }}>
                      <span>Din portefølje</span>
                      <div className="flex items-center gap-3">
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
                          <div key={produkt.id} className={"flex items-center gap-3 p-3 rounded-lg " + (erIllikvid ? "bg-amber-50 border border-amber-200" : "bg-gray-50")}>
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
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Legg til produkt</h5>
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
                                  <div>
                                    <span>{produkt.navn}</span>
                                    <span className="text-xs text-amber-600 ml-2">12% p.a.</span>
                                  </div>
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
                  <div className="space-y-6">
                    {/* Porteføljefordeling */}
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljefordeling</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={pensumAllokering.filter(p => p.vekt > 0)} cx="50%" cy="50%" outerRadius={55} dataKey="vekt">
                            {pensumAllokering.filter(p => p.vekt > 0).map((entry, idx) => (
                              <Cell key={entry.id} fill={[PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => v + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1">
                        {pensumAllokering.filter(p => p.vekt > 0).map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: [PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7] }}></div>
                            <span className="flex-1 truncate">{p.navn}</span>
                            <span className="font-medium">{p.vekt}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aktivafordeling */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivafordeling</h4>
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie data={pensumAktivafordeling.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={45} dataKey="value">
                            {pensumAktivafordeling.filter(p => p.value > 0).map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => v + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {pensumAktivafordeling.filter(a => a.value > 0).map(a => (
                          <div key={a.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }}></div>
                            <span className="text-gray-600">{a.name}</span>
                            <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{a.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Produktspesifikk eksponering */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-base" style={{ color: PENSUM_COLORS.darkBlue }}>Produktspesifikk eksponering</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-3xl">Vis hvert produkt for seg. Dette er arbeidsflaten som brukes som rapportgrunnlag i det genererte investeringsforslaget. Aggregert eksponering brukes bare som sekundær oppsummering.</p>
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
                      <div className="xl:col-span-3 border-r border-slate-200 bg-white">
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

                      <div className="xl:col-span-9 p-4 lg:p-5 bg-slate-50/50">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Startkapital" value={formatCurrency(totalKapital)} />
              <StatCard label="Forventet avkastning" value={formatPercent(pensumForventetAvkastning)} subtext="årlig" color={PENSUM_COLORS.green} />
              <StatCard label="Sluttverdi" value={formatCurrency(pensumPrognose[pensumPrognose.length - 1]?.verdi || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((pensumPrognose[pensumPrognose.length - 1]?.verdi || 0) - totalKapital)} color={PENSUM_COLORS.green} />
            </div>

            {/* Prognosegraf */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Utvikling i formuesverdi</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={pensumPrognose} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Verdi']} />
                    <Bar dataKey="verdi" fill={PENSUM_COLORS.darkBlue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historisk avkastning */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Historisk avkastning</h3>
              </div>
              <div className="p-6">
                {/* Vektet porteføljeavkastning */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                  <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Din porteføljes historiske avkastning</h4>
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

                {/* Interaktiv historikkgraf */}
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h4 className="text-lg font-semibold text-white">Historisk utvikling - Pensum-løsninger</h4>
                    <div className="flex items-center gap-2">
                      {['1y', '3y', '5y', 'max'].map(periode => (
                        <button
                          key={periode}
                          onClick={() => setHistorikkPeriode(periode)}
                          className={"px-3 py-1 rounded text-xs font-medium transition-colors " + (historikkPeriode === periode ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}
                        >
                          {periode === '1y' ? '1 år' : periode === '3y' ? '3 år' : periode === '5y' ? '5 år' : 'Maks'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Produktvelger */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {Object.keys(produktHistorikk).map(produktId => {
                        const produktInfo = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].find(p => p.id === produktId);
                        const erValgt = valgteProdukterHistorikk.includes(produktId);
                        const farger = {
                          'global-core-active': '#0D2240',
                          'global-edge': '#5B9BD5',
                          'basis': '#D4886B',
                          'global-hoyrente': '#16A34A',
                          'nordisk-hoyrente': '#7C3AED',
                          'norge-a': '#DC2626',
                          'energy-a': '#F59E0B'
                        };
                        return (
                          <button
                            key={produktId}
                            onClick={() => {
                              if (erValgt) {
                                setValgteProdukterHistorikk(prev => prev.filter(id => id !== produktId));
                              } else {
                                setValgteProdukterHistorikk(prev => [...prev, produktId]);
                              }
                            }}
                            className={"px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all " + (erValgt ? "text-white" : "bg-white hover:bg-gray-50")}
                            style={{ 
                              borderColor: farger[produktId] || '#999',
                              backgroundColor: erValgt ? farger[produktId] : undefined,
                              color: erValgt ? 'white' : farger[produktId]
                            }}
                          >
                            {produktInfo?.navn?.replace('Pensum ', '') || produktId}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Graf */}
                    <div className="h-80">
                      {(() => {
                        // Filtrer data basert på periode
                        const periodeFilter = {
                          '1y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                          '3y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                          '5y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                          'max': new Date(2015, 0, 1)
                        };
                        const startDato = periodeFilter[historikkPeriode];
                        
                        // Bygg data for grafen
                        const chartData = [];
                        const alleDatoer = new Set();
                        
                        valgteProdukterHistorikk.forEach(produktId => {
                          const hist = produktHistorikk[produktId];
                          if (hist && hist.data) {
                            hist.data.forEach(d => {
                              const dato = parseHistorikkDato(d.dato);
                              if (dato && dato >= startDato) {
                                alleDatoer.add(d.dato);
                              }
                            });
                          }
                        });
                        
                        const sorterteDatoer = Array.from(alleDatoer).sort();
                        
                        sorterteDatoer.forEach(dato => {
                          const punkt = { dato };
                          valgteProdukterHistorikk.forEach(produktId => {
                            const hist = produktHistorikk[produktId];
                            if (hist && hist.data) {
                              const match = hist.data.find(d => d.dato === dato);
                              if (match) {
                                // Reindekserer til 100 ved start av valgt periode
                                const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                                punkt[produktId] = (match.verdi / startVerdi) * 100;
                              }
                            }
                          });
                          chartData.push(punkt);
                        });
                        
                        const farger = {
                          'global-core-active': '#0D2240',
                          'global-edge': '#5B9BD5',
                          'basis': '#D4886B',
                          'global-hoyrente': '#16A34A',
                          'nordisk-hoyrente': '#7C3AED',
                          'norge-a': '#DC2626',
                          'energy-a': '#F59E0B'
                        };
                        
                        if (chartData.length === 0 || valgteProdukterHistorikk.length === 0) {
                          return (
                            <div className="h-full flex items-center justify-center text-gray-500">
                              Velg produkter for å se historisk utvikling
                            </div>
                          );
                        }
                        
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis 
                                dataKey="dato" 
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                tickFormatter={(dato) => {
                                  const parsed = parseHistorikkDato(dato);
                                  if (!parsed) return '';
                                  const m = parsed.getMonth() + 1;
                                  return m === 1 || m === 7 ? `${String(m).padStart(2, '0')}/${String(parsed.getFullYear()).slice(2)}` : '';
                                }}
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                tickFormatter={(val) => val.toFixed(0)}
                                domain={['dataMin - 5', 'dataMax + 5']}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                                labelFormatter={(dato) => formatHistorikkEtikett(dato)}
                                formatter={(value, name) => {
                                  const produktInfo = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].find(p => p.id === name);
                                  return [value.toFixed(1), produktInfo?.navn?.replace('Pensum ', '') || name];
                                }}
                              />
                              <Legend 
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => {
                                  const produktInfo = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].find(p => p.id === value);
                                  return produktInfo?.navn?.replace('Pensum ', '') || value;
                                }}
                              />
                              <ReferenceLine y={100} stroke="#9CA3AF" strokeDasharray="5 5" />
                              {valgteProdukterHistorikk.map(produktId => (
                                <Line
                                  key={produktId}
                                  type="monotone"
                                  dataKey={produktId}
                                  stroke={farger[produktId] || '#999'}
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 4 }}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                    
                    {/* Avkastningstabell for valgt periode */}
                    {valgteProdukterHistorikk.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {valgteProdukterHistorikk.map(produktId => {
                          const hist = produktHistorikk[produktId];
                          const produktInfo = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].find(p => p.id === produktId);
                          const farger = {
                            'global-core-active': '#0D2240',
                            'global-edge': '#5B9BD5',
                            'basis': '#D4886B',
                            'global-hoyrente': '#16A34A',
                            'nordisk-hoyrente': '#7C3AED',
                            'norge-a': '#DC2626',
                            'energy-a': '#F59E0B'
                          };
                          
                          if (!hist || !hist.data || hist.data.length < 2) return null;
                          
                          // Beregn avkastning for valgt periode
                          const periodeFilter = {
                            '1y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                            '3y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                            '5y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1),
                            'max': new Date(2015, 0, 1)
                          };
                          const startDato = periodeFilter[historikkPeriode];
                          
                          const sluttVerdi = hist.data[hist.data.length - 1].verdi;
                          const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                          const avkastning = ((sluttVerdi / startVerdi) - 1) * 100;
                          
                          return (
                            <div key={produktId} className="p-3 rounded-lg border-2" style={{ borderColor: farger[produktId] }}>
                              <p className="text-xs font-medium truncate" style={{ color: farger[produktId] }}>
                                {produktInfo?.navn?.replace('Pensum ', '')}
                              </p>
                              <p className={"text-lg font-bold " + (avkastning >= 0 ? 'text-green-600' : 'text-red-600')}>
                                {avkastning >= 0 ? '+' : ''}{avkastning.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {historikkPeriode === '1y' ? 'Siste 1 år' : historikkPeriode === '3y' ? 'Siste 3 år' : historikkPeriode === '5y' ? 'Siste 5 år' : 'Total'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Disclaimer */}
                    <div className="mt-4 text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                      <strong>Viktig informasjon om avkastning:</strong> Historikk er indeksert til 100 ved start av valgt periode. 
                      Historikk er oppdatert til og med {RAPPORT_DATO} (2026 vises som YTD). Avkastning beregnes månedlig ut fra kursendringer mellom månedssluttpunkter i tidsseriene. Kilde: {DATAFEED_KILDE}. For flere produkter er historikk før oppstart estimert - se produktdetaljer for mer informasjon. 
                      Historisk avkastning er ingen garanti for fremtidig avkastning.
                    </div>
                  </div>
                </div>

                {/* Tabell med alle produkter */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <th className="py-3 px-4 text-left text-white">Navn</th>
                        <th className="py-3 px-3 text-right text-white">2026 YTD</th>
                        <th className="py-3 px-3 text-right text-white">2025</th>
                        <th className="py-3 px-3 text-right text-white">2024</th>
                        <th className="py-3 px-3 text-right text-white">2023</th>
                        <th className="py-3 px-3 text-right text-white">2022</th>
                        <th className="py-3 px-3 text-right text-white">Årlig 3 år</th>
                        <th className="py-3 px-3 text-right text-white">Risiko 3 år</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-100">
                        <td colSpan="8" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>ENKELTFOND</td>
                      </tr>
                      {pensumProdukter.enkeltfond.map((p, idx) => {
                        const aar2026 = hentAarsverdiForProdukt(p, 'aar2026', 2026);
                        const aar2025 = hentAarsverdiForProdukt(p, 'aar2025', 2025);
                        const aar2024 = hentAarsverdiForProdukt(p, 'aar2024', 2024);
                        const aar2023 = hentAarsverdiForProdukt(p, 'aar2023', 2023);
                        const aar2022 = hentAarsverdiForProdukt(p, 'aar2022', 2022);
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1) + '%' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1) + '%' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1) + '%' : '—'}</td></>; })()}
                        </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan="8" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>FONDSPORTEFØLJER</td>
                      </tr>
                      {pensumProdukter.fondsportefoljer.map((p, idx) => {
                        const aar2026 = hentAarsverdiForProdukt(p, 'aar2026', 2026);
                        const aar2025 = hentAarsverdiForProdukt(p, 'aar2025', 2025);
                        const aar2024 = hentAarsverdiForProdukt(p, 'aar2024', 2024);
                        const aar2023 = hentAarsverdiForProdukt(p, 'aar2023', 2023);
                        const aar2022 = hentAarsverdiForProdukt(p, 'aar2022', 2022);
                        return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2026) ? (aar2026 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2026) ? aar2026.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2025) ? (aar2025 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2025) ? aar2025.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2024) ? (aar2024 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2024) ? aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2023) ? (aar2023 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2023) ? aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (erGyldigTall(aar2022) ? (aar2022 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(aar2022) ? aar2022.toFixed(1) + '%' : '—'}</td>
                          {(() => { const nokkeltall = beregnProduktNokkeltall({ ...p, aar2026, aar2025, aar2024, aar2023, aar2022 }); return <><td className={"py-2 px-3 text-right " + (erGyldigTall(nokkeltall.aarlig3ar) ? (nokkeltall.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400')}>{erGyldigTall(nokkeltall.aarlig3ar) ? nokkeltall.aarlig3ar.toFixed(1) + '%' : '—'}</td><td className="py-2 px-3 text-right text-gray-600">{erGyldigTall(nokkeltall.risiko3ar) ? nokkeltall.risiko3ar.toFixed(1) + '%' : '—'}</td></>; })()}
                        </tr>
                        );
                      })}
                      {visAlternative && (
                        <>
                          <tr className="bg-amber-100">
                            <td colSpan="8" className="py-2 px-4 font-semibold text-xs text-amber-700">ALTERNATIVE INVESTERINGER (ILLIKVIDE)</td>
                          </tr>
                          {pensumProdukter.alternative.map((p, idx) => (
                            <tr key={p.id} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                              <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenario' && (() => {
          // Referanseindeks-data (kalenderårsavkastning)
          const REFERANSE_DATA = {
            'MSCI ACWI': { farge: '#DC2626', data: { 2015: 0.0, 2016: 10.7, 2017: 22.4, 2018: -12.5, 2019: 24.8, 2020: 15.4, 2021: 18.4, 2022: -18.4, 2023: 21.4, 2024: 19.8, 2025: 23.3, 2026: 2.7 } },
            'MSCI World': { farge: '#0891B2', data: { 2015: 0.0, 2016: 9.6, 2017: 20.8, 2018: -11.0, 2019: 26.0, 2020: 15.3, 2021: 22.3, 2022: -18.1, 2023: 23.9, 2024: 22.2, 2025: 22.4, 2026: 1.9 } },
            'S&P 500': { farge: '#16A34A', data: { 2015: 0.0, 2016: 12.7, 2017: 19.4, 2018: -7.5, 2019: 29.0, 2020: 16.7, 2021: 28.9, 2022: -18.8, 2023: 26.2, 2024: 28.1, 2025: 19.1, 2026: 1.2 } },
            'MSCI Europe': { farge: '#F59E0B', data: { 2015: null, 2016: null, 2017: null, 2018: null, 2019: 0.0, 2020: 2.3, 2021: 2.2, 2022: -12.1, 2023: 11.0, 2024: 9.8, 2025: 9.4, 2026: 0.6 } },
            'MSCI EM': { farge: '#7C3AED', data: { 2015: 0.0, 2016: 14.9, 2017: 35.8, 2018: -17.3, 2019: 18.9, 2020: 15.1, 2021: -3.7, 2022: -20.1, 2023: 9.1, 2024: 10.5, 2025: 33.3, 2026: 6.9 } },
            'TOPIX': { farge: '#BE185D', data: { 2015: 0.0, 2016: 2.8, 2017: 19.0, 2018: -18.3, 2019: 19.5, 2020: 7.9, 2021: 12.8, 2022: -2.7, 2023: 27.8, 2024: 20.7, 2025: 25.4, 2026: 4.6 } },
            'Oslo Børs': { farge: '#EA580C', data: { 2015: 0.0, 2016: 15.9, 2017: 17.7, 2018: -3.2, 2019: 12.3, 2020: 2.9, 2021: 23.1, 2022: -1.1, 2023: 10.5, 2024: 9.0, 2025: 14.3, 2026: 3.7 } },
            'Norske Statsobl.': { farge: '#64748B', data: { 2015: 0.0, 2016: 0.5, 2017: 0.6, 2018: 0.4, 2019: 1.0, 2020: 1.5, 2021: -0.1, 2022: 0.8, 2023: 3.0, 2024: 3.8, 2025: 3.8, 2026: 0.3 } },
          };
          const PENSUM_AARLIG = (() => {
            const produktMap = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer].reduce((acc, p) => {
              acc[p.id] = p;
              return acc;
            }, {});
            const cfg = [
              ['Basis', 'basis', '#1B3A5F'],
              ['Fin. Opp.', 'financial-d', '#D4886B'],
              ['Global Core Active', 'global-core-active', '#0D2240'],
              ['Global Edge', 'global-edge', '#5B9BD5'],
              ['Global Energy', 'energy-a', '#F59E0B'],
              ['Global Høyrente', 'global-hoyrente', '#16A34A'],
              ['Nordic Banking', 'banking-d', '#0891B2'],
              ['Nordisk Høyrente', 'nordisk-hoyrente', '#7C3AED'],
              ['Norske Aksjer', 'norge-a', '#DC2626']
            ];
            const arMapping = { 2022: 'aar2022', 2023: 'aar2023', 2024: 'aar2024', 2025: 'aar2025', 2026: 'aar2026' };
            return cfg.reduce((acc, [label, id, farge]) => {
              const p = produktMap[id] || {};
              const data = Object.keys(arMapping).reduce((arAcc, ar) => {
                const felt = arMapping[ar];
                const v = hentAarsverdiForProdukt(p, felt, Number(ar));
                arAcc[Number(ar)] = Number.isFinite(v) ? v : null;
                return arAcc;
              }, {});
              acc[label] = { farge, data };
              return acc;
            }, {});
          })();

                    const AAR_KOLONNER = [2022, 2023, 2024, 2025, 2026];

          const heatmapFarge = (v) => {
            if (v === null) return 'transparent';
            if (v > 25) return '#15803d';
            if (v > 15) return '#16a34a';
            if (v > 5) return '#4ade80';
            if (v > 0) return '#bbf7d0';
            if (v > -5) return '#fecaca';
            if (v > -15) return '#f87171';
            return '#dc2626';
          };
          const textFarge = (v) => {
            if (v === null) return '#9ca3af';
            if (Math.abs(v) > 10) return 'white';
            return '#111827';
          };

          // Bygg indeksert linjediagram data fra 2015


          const periodeFilterScen = {
            '1M': 1/12, '3M': 3/12, '6M': 6/12, 'YTD': new Date().getMonth()/12,
            '1Å': 1, '3Å': 3, '5Å': 5, 'max': 10
          };

          // Build comparison line chart data
          const byggSammenligningsdata = () => {
            const startAar = sammenligningPeriodeScen === '1M' ? 2026 :
                             sammenligningPeriodeScen === '3M' ? 2026 :
                             sammenligningPeriodeScen === '6M' ? 2025 :
                             sammenligningPeriodeScen === 'YTD' ? 2026 :
                             sammenligningPeriodeScen === '1Å' ? 2025 :
                             sammenligningPeriodeScen === '3Å' ? 2023 :
                             sammenligningPeriodeScen === '5Å' ? 2022 : 2022;
            const data = [];
            // Accumulate from startAar
            const alleNavn = [...valgtePensumScen, ...valgteIndekserScen];
            const startVerdier = {};
            alleNavn.forEach(n => { startVerdier[n] = 100; });

            for (let aar = startAar; aar <= 2026; aar++) {
              const punkt = { aar: String(aar) };
              alleNavn.forEach(n => {
                const kilde = PENSUM_AARLIG[n] || REFERANSE_DATA[n];
                if (!kilde) return;
                const avk = kilde.data[aar];
                if (aar === startAar) {
                  punkt[n] = 100;
                } else {
                  const forrige = data[data.length - 1]?.[n];
                  if (forrige !== undefined && avk !== null && avk !== undefined) {
                    punkt[n] = parseFloat((forrige * (1 + avk/100)).toFixed(2));
                  } else if (forrige !== undefined) {
                    punkt[n] = forrige;
                  }
                }
              });
              data.push(punkt);
            }
            return data;
          };

          const sammenligningsData = byggSammenligningsdata();
          const alleSammenligningsNavn = [...valgtePensumScen, ...valgteIndekserScen];

          const alleNavn2 = Object.keys(PENSUM_AARLIG);
          const alleIndeksNavn = Object.keys(REFERANSE_DATA);

          return (
            <div className="space-y-6 no-print">
              {/* ====== SCENARIO-PARAMETERE (redesigned) ====== */}
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
                          <div><div className="text-xs text-red-400">Gevinst</div><div className="font-semibold text-red-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.pessimistisk||0) - totalKapital)}</div></div>
                          <div><div className="text-xs text-red-400">CAGR</div><div className="font-semibold text-red-700 text-sm">{formatPercent(scenarioParams.pessimistisk)}</div></div>
                        </div>
                      </div>
                    )}
                    <div className="p-5 rounded-xl border-2" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: '#0D2240' }}>
                      <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">Forventet</div>
                      <div className="text-4xl font-bold text-white mb-1">{formatCurrency(scenarioData[scenarioData.length-1]?.forventet || 0)}</div>
                      <div className="text-blue-300 text-sm mb-3">etter {horisont} år</div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-800">
                        <div><div className="text-xs text-blue-400">Gevinst</div><div className="font-semibold text-white text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.forventet||0) - totalKapital)}</div></div>
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
                        <div><div className="text-xs text-green-400">Gevinst</div><div className="font-semibold text-green-700 text-sm">{formatCurrency((scenarioData[scenarioData.length-1]?.optimistisk||0) - totalKapital)}</div></div>
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
                      <defs>
                        <linearGradient id="gradForventet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PENSUM_COLORS.darkBlue} stopOpacity={0.15}/>
                          <stop offset="95%" stopColor={PENSUM_COLORS.darkBlue} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={100} />
                      <Tooltip formatter={(v, n) => [formatCurrency(v), n === 'forventet' ? 'Forventet' : n === 'optimistisk' ? 'Optimistisk' : 'Pessimistisk']} />
                      <Legend iconType="circle" />
                      {showPessimistic && <Line type="monotone" dataKey="pessimistisk" name="Pessimistisk" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                      <Line type="monotone" dataKey="forventet" name="Forventet" stroke={PENSUM_COLORS.darkBlue} strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="optimistisk" name="Optimistisk" stroke="#16A34A" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ====== SAMMENLIGN FOND OG INDEKSER (bilde 3-style) ====== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5">
                  <h3 className="text-xl font-bold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>Sammenlign fond og indekser</h3>
                  <p className="text-sm text-gray-500 mb-4">Historisk utvikling indeksert til 100 ved startpunkt</p>

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

                  {/* Pensum-løsninger knapper */}
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pensums løsninger</div>
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

                  {/* Linjegraf */}
                  {alleSammenligningsNavn.length > 0 ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={sammenligningsData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="aar" tick={{ fontSize: 11, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => v.toFixed(0)} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(v, n) => [v?.toFixed(1), n]} />
                        <Legend verticalAlign="bottom" height={36} />
                        <ReferenceLine y={100} stroke="#9CA3AF" strokeDasharray="5 5" />
                        {alleSammenligningsNavn.map(n => {
                          const farge = PENSUM_AARLIG[n]?.farge || REFERANSE_DATA[n]?.farge || '#999';
                          const erIndeks = !!REFERANSE_DATA[n];
                          return (
                            <Line key={n} type="monotone" dataKey={n} stroke={farge}
                              strokeWidth={erIndeks ? 1.5 : 2.5} dot={false} activeDot={{ r: 4 }}
                              strokeDasharray={erIndeks ? '4 3' : undefined} />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                      Velg fond og/eller indekser for å se sammenligning
                    </div>
                  )}
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
                  Historisk avkastning er ingen garanti for fremtidig avkastning. Tall er oppdatert til og med {RAPPORT_DATO}. 2026 er delvis år (YTD), og indeksdata i USD/EUR/JPY vil avvike fra NOK-avkastning.
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'dashboard' && (() => {
          const periodeFilter = {
            '1y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 1, RAPPORT_DATO_OBJEKT.getMonth(), 1),
            '3y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 3, RAPPORT_DATO_OBJEKT.getMonth(), 1),
            '5y': new Date(RAPPORT_DATO_OBJEKT.getFullYear() - 5, RAPPORT_DATO_OBJEKT.getMonth(), 1),
            'max': new Date(2015, 0, 1)
          };
          const startDato = periodeFilter[dashboardPeriode];
          const produktFarger = {
            'global-core-active': '#0D2240', 'global-edge': '#5B9BD5', 'basis': '#D4886B',
            'global-hoyrente': '#16A34A', 'nordisk-hoyrente': '#7C3AED',
            'norge-a': '#DC2626', 'energy-a': '#F59E0B', 'banking-d': '#0891B2', 'financial-d': '#BE185D'
          };
          const produktNavn = {
            'global-core-active': 'Global Core Active', 'global-edge': 'Global Edge', 'basis': 'Basis',
            'global-hoyrente': 'Global Høyrente', 'nordisk-hoyrente': 'Nordisk Høyrente',
            'norge-a': 'Norge A', 'energy-a': 'Global Energy A', 'banking-d': 'Nordic Banking', 'financial-d': 'Financial Opp.'
          };
          const alleHistorikk = produktHistorikk;
          const alleDatoer = new Set();
          dashboardProdukter.forEach(id => {
            const hist = alleHistorikk[id];
            if (hist && hist.data) hist.data.forEach(d => { const parsed = parseHistorikkDato(d.dato); if (parsed && parsed >= startDato) alleDatoer.add(d.dato); });
          });
          const sorterteDatoer = Array.from(alleDatoer).sort();
          const chartData = sorterteDatoer.map(dato => {
            const punkt = { dato };
            dashboardProdukter.forEach(id => {
              const hist = alleHistorikk[id];
              if (hist && hist.data) {
                const match = hist.data.find(d => d.dato === dato);
                if (match) {
                  const startVerdi = finnStartVerdiVedPeriode(hist.data, startDato);
                  punkt[id] = parseFloat(((match.verdi / startVerdi) * 100).toFixed(2));
                }
              }
            });
            return punkt;
          });
          const beregnStatistikk = (id) => {
            const hist = alleHistorikk[id];
            if (!hist || !hist.data) return null;
            const filtrert = byggMaanedssluttSerie(hist.data)
              .filter(d => {
                const parsed = parseHistorikkDato(d.dato);
                return parsed && parsed >= startDato && erGyldigTall(d.verdi);
              })
              .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
            if (filtrert.length < 3) return null;
            const avkastninger = [];
            for (let i = 1; i < filtrert.length; i++) {
              const prev = filtrert[i - 1].verdi;
              const curr = filtrert[i].verdi;
              if (erGyldigTall(prev) && prev !== 0 && erGyldigTall(curr)) {
                avkastninger.push((curr - prev) / prev);
              }
            }
            const n = avkastninger.length;
            if (n === 0) return null;
            const perioderPerAar = 12;
            const gjennomsnitt = avkastninger.reduce((s, v) => s + v, 0) / n;
            const aarligAvkastning = ((filtrert[filtrert.length-1].verdi / filtrert[0].verdi) ** (perioderPerAar / n) - 1) * 100;
            const varians = avkastninger.reduce((s, v) => s + (v - gjennomsnitt) ** 2, 0) / n;
            const stdAvvik = Math.sqrt(varians) * Math.sqrt(perioderPerAar) * 100;
            let maxDD = 0, peak = filtrert[0].verdi;
            const drawdownSerie = filtrert.map(d => {
              if (d.verdi > peak) peak = d.verdi;
              const dd = peak > 0 ? (d.verdi - peak) / peak * 100 : 0;
              if (dd < maxDD) maxDD = dd;
              return { dato: d.dato, dd: parseFloat(dd.toFixed(2)) };
            });
            const totalAvk = ((filtrert[filtrert.length-1].verdi / filtrert[0].verdi) - 1) * 100;
            const sharpe = stdAvvik > 0 ? (aarligAvkastning - 3) / stdAvvik : 0;
            return { id, aarligAvkastning: parseFloat(aarligAvkastning.toFixed(2)), totalAvkastning: parseFloat(totalAvk.toFixed(2)), standardavvik: parseFloat(stdAvvik.toFixed(1)), maxDrawdown: parseFloat(maxDD.toFixed(1)), sharpe: parseFloat(sharpe.toFixed(2)), drawdownSerie };
          };
          const allStatistikk = dashboardProdukter.map(id => beregnStatistikk(id)).filter(Boolean);
          const ddDatoer = new Set();
          allStatistikk.forEach(s => s.drawdownSerie.forEach(d => ddDatoer.add(d.dato)));
          const ddData = Array.from(ddDatoer).sort().map(dato => {
            const punkt = { dato };
            allStatistikk.forEach(s => { const match = s.drawdownSerie.find(d => d.dato === dato); if (match) punkt[s.id] = match.dd; });
            return punkt;
          });
          const alleProdukter = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer];
          const sortedBySharpe = [...allStatistikk].sort((a, b) => b.sharpe - a.sharpe);
          const sortedByAvk = [...allStatistikk].sort((a, b) => b.aarligAvkastning - a.aarligAvkastning);
          const sortedByVol = [...allStatistikk].sort((a, b) => a.standardavvik - b.standardavvik);
          const sortedByDD = [...allStatistikk].sort((a, b) => a.maxDrawdown - b.maxDrawdown);
          return (
            <div className="space-y-6 no-print">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Analyse Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Historisk utvikling, risikometrikk og sammenligningsanalyse — Pensum Løsninger</p>
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
                  {alleProdukter.map(p => {
                    const aktiv = dashboardProdukter.includes(p.id);
                    return (
                      <button key={p.id}
                        onClick={() => setDashboardProdukter(prev => aktiv ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                        className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " + (aktiv ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}
                        style={aktiv ? { backgroundColor: produktFarger[p.id] || PENSUM_COLORS.darkBlue } : {}}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: aktiv ? 'white' : produktFarger[p.id] || '#999' }}></span>
                        {p.navn.replace('Pensum ', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                  <h3 className="text-lg font-semibold text-white">Historisk utvikling (indeksert til 100)</h3>
                  <span className="text-xs text-blue-200 bg-blue-900 px-2 py-1 rounded">Pensum Løsninger</span>
                </div>
                <div className="p-6">
                  {chartData.length > 0 && dashboardProdukter.length > 0 ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="dato" tick={{ fontSize: 10, fill: "#6B7280" }}
                          tickFormatter={(d) => { const [y, m] = d.split("-"); return (m === "01" || m === "07") ? m + "/" + y.slice(2) : ""; }}
                          interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(0)} domain={["dataMin - 5", "dataMax + 5"]} />
                        <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                          labelFormatter={(d) => formatHistorikkEtikett(d)}
                          formatter={(v, name) => [v.toFixed(1), produktNavn[name] || name]} />
                        <Legend verticalAlign="bottom" height={36} formatter={(v) => produktNavn[v] || v} />
                        <ReferenceLine y={100} stroke="#9CA3AF" strokeDasharray="5 5" />
                        {dashboardProdukter.filter(id => alleHistorikk[id]).map(id => (
                          <Line key={id} type="monotone" dataKey={id} stroke={produktFarger[id] || "#999"} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
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
                        <th className="py-3 px-3 text-right font-semibold text-gray-700 border-b">Avkastning p.a.</th>
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
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: produktFarger[s.id] || "#999" }}></span>
                              {produktNavn[s.id] || s.id}
                            </div>
                          </td>
                          <td className={"py-3 px-3 text-right font-semibold " + (s.aarligAvkastning >= 0 ? "text-green-600" : "text-red-600")}>
                            {s.aarligAvkastning >= 0 ? "+" : ""}{s.aarligAvkastning.toFixed(2)}%
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
                  Sharpe beregnet med risikofri rente 3%. Volatilitet = annualisert standardavvik (månedlig). Maks DD = størst kursfall fra topp til bunn.
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
                          tickFormatter={(d) => { const [y, m] = d.split("-"); return (m === "01" || m === "07") ? m + "/" + y.slice(2) : ""; }}
                          interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickFormatter={(v) => v.toFixed(0) + "%"} domain={["dataMin - 2", 0]} />
                        <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(v, name) => [v.toFixed(1) + "%", produktNavn[name] || name]} />
                        <Legend verticalAlign="bottom" height={36} formatter={(v) => produktNavn[v] || v} />
                        <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                        {allStatistikk.map(s => (
                          <Line key={s.id} type="monotone" dataKey={s.id} stroke={produktFarger[s.id] || "#999"} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">Ingen data</div>
                  )}
                </div>
              </div>

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
                        <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn[id] || id} width={120} />
                        <Tooltip formatter={(v) => [v.toFixed(2), "Sharpe"]} labelFormatter={id => produktNavn[id] || id} />
                        <ReferenceLine x={1} stroke="#16A34A" strokeDasharray="4 4" />
                        <ReferenceLine x={0.5} stroke="#F59E0B" strokeDasharray="4 4" />
                        <Bar dataKey="sharpe" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: v => v.toFixed(2) }}>
                          {sortedBySharpe.map(s => (
                            <Cell key={s.id} fill={s.sharpe >= 1 ? "#16A34A" : s.sharpe >= 0.5 ? "#F59E0B" : "#DC2626"} />
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
                        <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn[id] || id} width={120} />
                        <Tooltip formatter={(v) => [v.toFixed(1) + "%", "Volatilitet"]} labelFormatter={id => produktNavn[id] || id} />
                        <Bar dataKey="standardavvik" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: v => v.toFixed(1) + "%" }}>
                          {sortedByVol.map(s => (
                            <Cell key={s.id} fill={produktFarger[s.id] || PENSUM_COLORS.darkBlue} fillOpacity={0.85} />
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
                      <YAxis type="category" dataKey="id" tick={{ fontSize: 11 }} tickFormatter={id => produktNavn[id] || id} width={120} />
                      <Tooltip formatter={(v) => [v.toFixed(1) + "%", "Maks drawdown"]} labelFormatter={id => produktNavn[id] || id} />
                      <Bar dataKey="maxDrawdown" radius={[0, 4, 4, 0]} fill="#DC2626" fillOpacity={0.75}
                        label={{ position: "right", fontSize: 10, fill: "#DC2626", formatter: v => v.toFixed(1) + "%" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {allStatistikk.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <div className="text-xs text-green-600 font-medium mb-2">🏆 Beste Sharpe Ratio</div>
                    <div className="font-bold text-green-800 text-lg">{produktNavn[sortedBySharpe[0].id]}</div>
                    <div className="text-green-600 font-semibold">{sortedBySharpe[0].sharpe.toFixed(2)}</div>
                    <div className="text-xs text-green-500 mt-1">{sortedBySharpe[0].aarligAvkastning.toFixed(1)}% p.a. / {sortedBySharpe[0].standardavvik.toFixed(1)}% vol.</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                    <div className="text-xs text-blue-600 font-medium mb-2">📈 Høyest avkastning</div>
                    <div className="font-bold text-blue-800 text-lg">{produktNavn[sortedByAvk[0].id]}</div>
                    <div className="text-blue-600 font-semibold">{sortedByAvk[0].aarligAvkastning.toFixed(2)}% p.a.</div>
                    <div className="text-xs text-blue-500 mt-1">Sharpe: {sortedByAvk[0].sharpe.toFixed(2)} / Vol: {sortedByAvk[0].standardavvik.toFixed(1)}%</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                    <div className="text-xs text-purple-600 font-medium mb-2">🛡️ Lavest risiko</div>
                    <div className="font-bold text-purple-800 text-lg">{produktNavn[sortedByVol[0].id]}</div>
                    <div className="text-purple-600 font-semibold">{sortedByVol[0].standardavvik.toFixed(1)}% vol.</div>
                    <div className="text-xs text-purple-500 mt-1">{sortedByVol[0].aarligAvkastning.toFixed(1)}% p.a. / Sharpe: {sortedByVol[0].sharpe.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <strong>Viktig informasjon:</strong> Historisk avkastning er ingen garanti for fremtidig avkastning. Sharpe Ratio er beregnet med risikofri rente på 3% p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det størst relative kursfallet fra topp til bunn i den valgte perioden. Store deler av historikken før fondenes oppstart er estimert. Kilde: {DATAFEED_KILDE}.
              </div>
            </div>
          );
        })()}

        {activeTab === 'rapport' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-gray-200">
                <img src={PENSUM_LOGO} alt="Pensum" className="h-20" />
                <div className="text-right">
                  <div className="text-base font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsprognose</div>
                  <div className="text-xs text-gray-500">{formatDateEuro(dato)}</div>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-6">
                  <div><span className="text-gray-500">Utarbeidet for:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{kundeNavn || '—'}</strong></div>
                  <div className="text-right"><span className="text-gray-500">Rådgiver:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{radgiver || '—'}</strong></div>
                  <div><span className="text-gray-500">Risikoprofil:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</strong></div>
                  <div className="text-right"><span className="text-gray-500">Horisont:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{horisont} år</strong></div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Nøkkeltall</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><StatCard label="Startkapital" value={formatCurrency(totalKapital)} /><StatCard label="Horisont" value={horisont + " år"} /><StatCard label="Forv. avkastning" value={formatPercent(vektetAvkastning)} /><StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} color={PENSUM_COLORS.green} /></div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Anbefalt allokering</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <table className="w-full text-sm"><thead><tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}><th className="py-3 px-4 text-left">Aktivaklasse</th><th className="py-3 px-4 text-center">Andel</th><th className="py-3 px-4 text-right">Beløp</th></tr></thead><tbody>{aktiveAktiva.map(a => <tr key={a.navn} className="border-b border-gray-100"><td className="py-3 px-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[a.navn] }}></div>{a.navn}</td><td className="py-3 px-4 text-center">{formatPercent(a.vekt)}</td><td className="py-3 px-4 text-right">{formatCurrency((a.vekt/100)*totalKapital)}</td></tr>)}</tbody></table>
                    <div className="flex justify-center items-center"><ResponsiveContainer width={200} height={200}><PieChart><Pie data={aktiveAktiva.map(a => ({ name: a.navn, value: a.vekt }))} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">{aktiveAktiva.map(a => <Cell key={a.navn} fill={ASSET_COLORS[a.navn]} stroke="white" strokeWidth={2} />)}</Pie></PieChart></ResponsiveContainer></div>
                  </div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Forventet verdiutvikling</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={verdiutvikling} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                      <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 10 }} width={90} />
                      <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                      <Legend iconType="circle" iconSize={8} />
                      {aktiveAktiva.map((a) => <Bar key={a.navn} dataKey={a.navn} stackId="a" fill={ASSET_COLORS[a.navn] || CATEGORY_COLORS[a.kategori]} />)}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Scenarioanalyse etter {horisont} år</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl" style={{ backgroundColor: PENSUM_COLORS.lightGray }}><div className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet</div><div className="text-2xl font-bold mt-2" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(scenarioData[scenarioData.length - 1]?.forventet || 0)}</div></div>
                    <div className="text-center p-6 bg-green-50 rounded-xl"><div className="text-sm font-medium text-green-600">Optimistisk</div><div className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(scenarioData[scenarioData.length - 1]?.optimistisk || 0)}</div></div>
                  </div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Detaljert verdiutvikling</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="py-2 px-2 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>År</th>
                          {aktiveAktiva.map(a => <th key={a.navn} className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{a.navn}</th>)}
                          <th className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verdiutvikling.map((row, idx) => (
                          <tr key={row.year} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-2 px-2 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                            {aktiveAktiva.map(a => <td key={a.navn} className="py-2 px-2 text-right text-gray-600">{formatCurrency(row[a.navn] || 0)}</td>)}
                            <td className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-xs text-gray-500 border-t border-gray-200 pt-6"><p className="font-semibold mb-2">Viktig informasjon</p><p>Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke.</p></div>
              </div>
              <div className="px-10 py-5 text-center text-sm border-t border-gray-100" style={{ backgroundColor: PENSUM_COLORS.lightGray }}><span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum Asset Management</span><span className="mx-3 text-gray-300">|</span><span className="text-gray-500">pensumgroup.no</span><span className="mx-3 text-gray-300">|</span><span className="text-gray-500">+47 23 89 68 44</span></div>
            </div>
            <div className="flex flex-col items-center gap-4 no-print">
              <button onClick={handleDownloadHTML} className="px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg flex items-center gap-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Last ned rapport
              </button>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">Lagre som PDF:</p>
                <p className="text-xs text-gray-600">1. Last ned filen og åpne den i nettleseren</p>
                <p className="text-xs text-gray-600">2. Trykk <span className="font-mono bg-gray-200 px-1 rounded">Ctrl+P</span> (Windows) eller <span className="font-mono bg-gray-200 px-1 rounded">Cmd+P</span> (Mac)</p>
                <p className="text-xs text-gray-600">3. Velg "Lagre som PDF" som skriver</p>
              </div>
            </div>
          </div>
        )}

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
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Standard avkastningsrater</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Disse ratene brukes i "Allokering & Prognose"-fanen for aktivaklassene.
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

                {/* PDF-mal for investeringsforslag */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <h3 className="text-lg font-semibold text-white">Investeringsforslag: malstyring</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                      Last opp malfil og marker hvilke sider som er faste og dynamiske.
                      Maloppsettet lagres i admin og den opplastede PPTX-filen brukes nå direkte som grunnlag ved generering (placeholder-felter fylles inn dynamisk).
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Malnavn</label>
                        <input
                          type="text"
                          value={pdfMalConfig.navn}
                          onChange={(e) => setPdfMalConfig(prev => ({ ...prev, navn: e.target.value }))}
                          placeholder="f.eks. Pensum master 2026"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Malfil</label>
                        <label className="mt-1 block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <p className="text-sm text-gray-600">Klikk for å velge .ppt/.pptx</p>
                          <p className="text-xs text-gray-400 mt-1">Maks 15 MB</p>
                          <input
                            type="file"
                            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            className="hidden"
                            onChange={(e) => {
                              const fil = e.target.files?.[0];
                              if (!fil) return;
                              const erGyldigType = /\.(ppt|pptx)$/i.test(fil.name);
                              if (!erGyldigType) {
                                setAdminMelding('Feil: Kun .ppt/.pptx støttes som mal for PowerPoint-generering. PDF kan ikke brukes som template-merge-kilde.');
                                return;
                              }
                              if (fil.size > 15 * 1024 * 1024) {
                                setAdminMelding('Feil: Malfilen er større enn 15 MB. Komprimer eller bruk en mindre fil.');
                                return;
                              }

                              const reader = new FileReader();
                              reader.onload = () => {
                                setPdfMalConfig(prev => ({
                                  ...prev,
                                  filnavn: fil.name,
                                  filtype: fil.type || 'application/octet-stream',
                                  filDataUrl: typeof reader.result === 'string' ? reader.result : ''
                                }));
                                setAdminMelding('Mal lastet inn lokalt i denne økten. Ved generering brukes opplastet fil; hvis den ikke finnes brukes standardmalen fra repo automatisk.');
                              };
                              reader.onerror = () => setAdminMelding('Feil ved lesing av malfil. Prøv på nytt.');
                              reader.readAsDataURL(fil);
                            }}
                          />
                        </label>
                        {pdfMalConfig.filnavn && (
                          <p className="text-xs text-gray-500 mt-2">
                            Valgt fil: <strong>{pdfMalConfig.filnavn}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className={"rounded-lg p-2 border " + (erGyldigFasteSider ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                        Faste sider: {erGyldigFasteSider ? 'Gyldig format' : 'Ugyldig format'}
                      </div>
                      <div className={"rounded-lg p-2 border " + (erGyldigDynamiskeSider ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                        Dynamiske sider: {erGyldigDynamiskeSider ? 'Gyldig format' : 'Ugyldig format'}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Faste sider</label>
                        <input
                          type="text"
                          value={pdfMalConfig.fasteSider}
                          onChange={(e) => setPdfMalConfig(prev => ({ ...prev, fasteSider: e.target.value }))}
                          placeholder="f.eks. 1-3,10+"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dynamiske sider</label>
                        <input
                          type="text"
                          value={pdfMalConfig.dynamiskeSider}
                          onChange={(e) => setPdfMalConfig(prev => ({ ...prev, dynamiskeSider: e.target.value }))}
                          placeholder="f.eks. 4-9"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hva skal fylles inn dynamisk?</label>
                      <textarea
                        value={pdfMalConfig.dynamiskBeskrivelse}
                        onChange={(e) => setPdfMalConfig(prev => ({ ...prev, dynamiskBeskrivelse: e.target.value }))}
                        rows={6}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={!erKlarForLagringAvMal}
                        onClick={async () => {
                          if (!erKlarForLagringAvMal) {
                            setAdminMelding('Feil: Fyll ut malnavn, velg malfil, og bruk gyldig sideformat (f.eks. 1-3,10+).');
                            return;
                          }
                          try {
                            await storageSet('pensum_admin_pdf_mal', JSON.stringify(stripTemplateBinaryForStorage(pdfMalConfig)));
                            setAdminMelding('Malmapping lagret i admin. Om opplastet binærfil mangler i økten brukes standardmalen fra repo automatisk.');
                          } catch (err) {
                            setAdminMelding('Feil ved lagring av maloppsett: ' + err.message);
                          }
                        }}
                        className={"px-6 py-2 text-white rounded-lg font-medium " + (!erKlarForLagringAvMal ? 'opacity-60 cursor-not-allowed' : '')}
                        style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
                      >
                        Lagre maloppsett
                      </button>

                      <button
                        onClick={() => {
                          setPdfMalConfig({
                            navn: 'Pensum standardmal 2026',
                            filnavn: DEFAULT_TEMPLATE_FILENAME,
                            filtype: '',
                            filDataUrl: '',
                            fasteSider: '1-5,14+',
                            dynamiskeSider: '6-13',
                            dynamiskBeskrivelse: 'Side 6: Allokering\nSide 7: Beløpsfordeling\nSide 8: Produkter 2026/2025\nSide 9: Produkter 2024/2023/2022\nSide 10: Avkastningsgraf\nSide 11: Risikomål\nSide 12: Månedstabell\nSide 13: Oppsummering'
                          });
                          setAdminMelding('Maloppsett nullstilt lokalt (ikke lagret).');
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Nullstill skjema
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <strong>Status:</strong> Sideoppsettet lagres i admin. Standardmalen <code>{DEFAULT_TEMPLATE_FILENAME}</code> brukes automatisk fra repo i produksjon/lokalt.
                      Opplasting er valgfri overstyring per økt (nyttig ved testing av alternative maler).
                    </div>
                    <div className="text-xs text-gray-500">
                      Gyldige sideformater: <code>1-3,10+</code>, <code>4-9</code>, <code>2,5,7</code>.
                    </div>
                  </div>
                </div>

                {/* Reset til standard */}
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
                        try {
                          await storageDelete('pensum_admin_produkter');
                          await storageDelete('pensum_admin_avkastningsrater');
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
