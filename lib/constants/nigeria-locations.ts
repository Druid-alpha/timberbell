export type NigeriaTown = {
  name: string
  areas: string[]
}

export type NigeriaStateLocation = {
  state: string
  towns: NigeriaTown[]
}

export const NIGERIA_LOCATIONS: NigeriaStateLocation[] = [
  { state: 'Abia', towns: [{ name: 'Umuahia', areas: ['Umuahia North', 'Umuahia South', 'Afugiri'] }, { name: 'Aba', areas: ['Aba North', 'Aba South', 'Osisioma'] }, { name: 'Ohafia', areas: ['Elu', 'Ebem', 'Amaekpu'] }] },
  { state: 'Adamawa', towns: [{ name: 'Yola', areas: ['Jimeta', 'Namtari', 'Karewa'] }, { name: 'Mubi', areas: ['Mubi North', 'Mubi South', 'Vimtim'] }, { name: 'Numan', areas: ['Numan Town', 'Imburu', 'Gamadio'] }] },
  { state: 'Akwa Ibom', towns: [{ name: 'Uyo', areas: ['Ewet Housing', 'Uruan Street', 'Shelter Afrique'] }, { name: 'Eket', areas: ['Eket Urban', 'Afaha Eket', 'Idua'] }, { name: 'Ikot Ekpene', areas: ['Abiakpo', 'Nto Edino', 'Uruk Uso'] }] },
  { state: 'Anambra', towns: [{ name: 'Awka', areas: ['Ifite', 'Aroma', 'Amawbia'] }, { name: 'Onitsha', areas: ['GRA', 'Fegge', 'Upper Iweka'] }, { name: 'Nnewi', areas: ['Otolo', 'Uruagu', 'Nnewichi'] }] },
  { state: 'Bauchi', towns: [{ name: 'Bauchi', areas: ['Yelwa', 'GRA', 'Wunti'] }, { name: 'Azare', areas: ['Azare Town', 'Madinawa', 'Bulkachuwa'] }, { name: 'Misau', areas: ['Misau Central', 'Hardawa', 'Sirko'] }] },
  { state: 'Bayelsa', towns: [{ name: 'Yenagoa', areas: ['Ekeki', 'Kpansia', 'Opolo'] }, { name: 'Brass', areas: ['Twon-Brass', 'Okpoama', 'Ewoama'] }, { name: 'Sagbama', areas: ['Sagbama Town', 'Ofoni', 'Trofani'] }] },
  { state: 'Benue', towns: [{ name: 'Makurdi', areas: ['Wadata', 'High Level', 'North Bank'] }, { name: 'Gboko', areas: ['Gboko Town', 'Mkar', 'Yandev'] }, { name: 'Otukpo', areas: ['Otukpo Town', 'Akpa', 'Asa'] }] },
  { state: 'Borno', towns: [{ name: 'Maiduguri', areas: ['Bolori', 'Gwange', 'Mairi'] }, { name: 'Biu', areas: ['Biu Town', 'Yawi', 'Mandaragirau'] }, { name: 'Bama', areas: ['Bama Town', 'Banki', 'Kasugula'] }] },
  { state: 'Cross River', towns: [{ name: 'Calabar', areas: ['Marian', 'State Housing', 'Atimbo'] }, { name: 'Ikom', areas: ['Ikom Urban', 'Agbokim', 'Nde'] }, { name: 'Ogoja', areas: ['Ogoja Town', 'Mbube', 'Ishibori'] }] },
  { state: 'Delta', towns: [{ name: 'Asaba', areas: ['Okpanam', 'GRA', 'Cable Point'] }, { name: 'Warri', areas: ['Effurun', 'Ekpan', 'Jakpa'] }, { name: 'Sapele', areas: ['Amukpe', 'Okuovbagharan', 'Ajogodo'] }] },
  { state: 'Ebonyi', towns: [{ name: 'Abakaliki', areas: ['Kpiri Kpiri', 'Presco', 'Nkaliki'] }, { name: 'Afikpo', areas: ['Afikpo North', 'Unwana', 'Amasiri'] }, { name: 'Onueke', areas: ['Onueke Town', 'Akaeze', 'Nkomoro'] }] },
  { state: 'Edo', towns: [{ name: 'Benin City', areas: ['GRA', 'Ugbowo', 'Sapele Road'] }, { name: 'Auchi', areas: ['Jattu', 'South Ibie', 'Aviele'] }, { name: 'Ekpoma', areas: ['Irrua Road', 'Emaudo', 'Ujoelen'] }] },
  { state: 'Ekiti', towns: [{ name: 'Ado Ekiti', areas: ['Ajilosun', 'Basiri', 'Oke Ila'] }, { name: 'Ikere', areas: ['Odo Oja', 'Oke Osun', 'Afao Road'] }, { name: 'Ijero', areas: ['Ijero Town', 'Ipoti', 'Iloro'] }] },
  { state: 'Enugu', towns: [{ name: 'Enugu', areas: ['Independence Layout', 'New Haven', 'Abakpa'] }, { name: 'Nsukka', areas: ['Odenigbo', 'Hilltop', 'Ihe Nsukka'] }, { name: 'Agbani', areas: ['Agbani Town', 'Amuri', 'Akpugo'] }] },
  { state: 'Federal Capital Territory', towns: [{ name: 'Abuja', areas: ['Maitama', 'Wuse', 'Garki'] }, { name: 'Gwagwalada', areas: ['Kutunku', 'Paiko', 'Zuba Road'] }, { name: 'Kubwa', areas: ['Phase 1', 'Phase 2', 'Arab Road'] }] },
  { state: 'Gombe', towns: [{ name: 'Gombe', areas: ['Pantami', 'Tudun Wada', 'Bolari'] }, { name: 'Kaltungo', areas: ['Kaltungo Town', 'Ture', 'Poshereng'] }, { name: 'Billiri', areas: ['Billiri Central', 'Talasse', 'Tudu Kwaya'] }] },
  { state: 'Imo', towns: [{ name: 'Owerri', areas: ['Ikenegbu', 'Aladinma', 'New Owerri'] }, { name: 'Orlu', areas: ['Amaifeke', 'Umuna', 'Owerri Road'] }, { name: 'Okigwe', areas: ['Umuowa', 'Achara', 'Ahiara'] }] },
  { state: 'Jigawa', towns: [{ name: 'Dutse', areas: ['Takur', 'Limawa', 'Sakwaya'] }, { name: 'Hadejia', areas: ['Matsaro', 'Yankoli', 'Dubantu'] }, { name: 'Gumel', areas: ['Galagamma', 'Dan Amao', 'Zango'] }] },
  { state: 'Kaduna', towns: [{ name: 'Kaduna', areas: ['Barnawa', 'Sabon Tasha', 'Kawo'] }, { name: 'Zaria', areas: ['Samaru', 'Tudun Wada', 'Sabon Gari'] }, { name: 'Kafanchan', areas: ['Fadia Bakut', 'Marmara', 'Kafanchan A'] }] },
  { state: 'Kano', towns: [{ name: 'Kano', areas: ['Nassarawa', 'Sabon Gari', 'Fagge'] }, { name: 'Wudil', areas: ['Wudil Town', 'Kausani', 'Darki'] }, { name: 'Bichi', areas: ['Bichi Town', 'Saye', 'Muntsira'] }] },
  { state: 'Katsina', towns: [{ name: 'Katsina', areas: ['Kofar Kaura', 'Kofar Marusa', 'GRA'] }, { name: 'Daura', areas: ['Daura Town', 'Sabon Gari', 'Dutsi Road'] }, { name: 'Funtua', areas: ['Makera', 'Unguwar Rabiu', 'Dukke'] }] },
  { state: 'Kebbi', towns: [{ name: 'Birnin Kebbi', areas: ['Badariya', 'Gesse', 'Ambursa'] }, { name: 'Argungu', areas: ['Argungu Town', 'Kokani', 'Alwasa'] }, { name: 'Yauri', areas: ['Yelwa', 'Gungu', 'Zuguru'] }] },
  { state: 'Kogi', towns: [{ name: 'Lokoja', areas: ['Adankolo', 'Lokongoma', 'Ganaja'] }, { name: 'Anyigba', areas: ['Anyigba Town', 'Ajetachi', 'Ofejiji'] }, { name: 'Okene', areas: ['Upogoro', 'Ageva', 'Okengwe'] }] },
  { state: 'Kwara', towns: [{ name: 'Ilorin', areas: ['Tanke', 'GRA', 'Fate'] }, { name: 'Offa', areas: ['Igosun Road', 'Balogun', 'Shawo'] }, { name: 'Omu-Aran', areas: ['Omu-Aran Central', 'Ipetu', 'Rore'] }] },
  { state: 'Lagos', towns: [{ name: 'Ikeja', areas: ['Alausa', 'Oregun', 'Maryland'] }, { name: 'Lekki', areas: ['Lekki Phase 1', 'Ajah', 'Chevron'] }, { name: 'Surulere', areas: ['Bode Thomas', 'Aguda', 'Adeniran Ogunsanya'] }, { name: 'Yaba', areas: ['Sabo', 'Akoka', 'Tejuosho'] }] },
  { state: 'Nasarawa', towns: [{ name: 'Lafia', areas: ['Millionaires Quarters', 'Bukan Sidi', 'Akurba'] }, { name: 'Keffi', areas: ['Angwan Lambu', 'GRA', 'Sabon Pegi'] }, { name: 'Akwanga', areas: ['Akwanga Central', 'Andaha', 'Ningo'] }] },
  { state: 'Niger', towns: [{ name: 'Minna', areas: ['Tunga', 'Bosso', 'Chanchaga'] }, { name: 'Suleja', areas: ['Madalla', 'Maje', 'Kurmin Sarki'] }, { name: 'Bida', areas: ['Dokodza', 'Banwuya', 'Jima'] }] },
  { state: 'Ogun', towns: [{ name: 'Abeokuta', areas: ['Lafenwa', 'Ibara', 'Panseke'] }, { name: 'Ijebu Ode', areas: ['GRA', 'Ijasi', 'Molipa'] }, { name: 'Sango Ota', areas: ['Joju', 'Iyana Iyesi', 'Oju Ore'] }] },
  { state: 'Ondo', towns: [{ name: 'Akure', areas: ['Alagbaka', 'Ijapo', 'Oke Aro'] }, { name: 'Ondo', areas: ['Yaba', 'Fagun', 'Surulere'] }, { name: 'Owo', areas: ['Emure', 'Iyere', 'Isuada'] }] },
  { state: 'Osun', towns: [{ name: 'Osogbo', areas: ['Alekuwodo', 'Oke Baale', 'Powerline'] }, { name: 'Ile-Ife', areas: ['Mayfair', 'Eleyele', 'Parakin'] }, { name: 'Ilesa', areas: ['Ayeso', 'Imo', 'Isida'] }] },
  { state: 'Oyo', towns: [{ name: 'Ibadan', areas: ['Bodija', 'Ring Road', 'Challenge'] }, { name: 'Ogbomoso', areas: ['Takie', 'Sabo', 'Arowomole'] }, { name: 'Oyo', areas: ['Owode', 'Akesan', 'Isokun'] }] },
  { state: 'Plateau', towns: [{ name: 'Jos', areas: ['Rayfield', 'Bukuru', 'Angwan Rogo'] }, { name: 'Bukuru', areas: ['Gyel', 'Du', 'Kuru'] }, { name: 'Pankshin', areas: ['Pankshin Central', 'Mangun', 'Chip'] }] },
  { state: 'Rivers', towns: [{ name: 'Port Harcourt', areas: ['GRA', 'Rumuola', 'Trans Amadi'] }, { name: 'Obio-Akpor', areas: ['Rumuokoro', 'Choba', 'Eliozu'] }, { name: 'Bonny', areas: ['Finima', 'Ayama', 'Bonny Town'] }] },
  { state: 'Sokoto', towns: [{ name: 'Sokoto', areas: ['Gidan Dare', 'Arkilla', 'Dambua'] }, { name: 'Wurno', areas: ['Wurno Town', 'Magarya', 'Dinawa'] }, { name: 'Tambuwal', areas: ['Tambuwal Central', 'Dogondaji', 'Kagara'] }] },
  { state: 'Taraba', towns: [{ name: 'Jalingo', areas: ['Mayo Goi', 'Nukkai', 'Sabon Gari'] }, { name: 'Wukari', areas: ['Avyi', 'Puje', 'Hospital Road'] }, { name: 'Bali', areas: ['Bali Town', 'Maihula', 'Suntai'] }] },
  { state: 'Yobe', towns: [{ name: 'Damaturu', areas: ['Maisandari', 'Nayinawa', 'Sabon Pegi'] }, { name: 'Potiskum', areas: ['Dogo Nini', 'Yerimaram', 'Mamudo'] }, { name: 'Nguru', areas: ['Bulanguwa', 'Hausari', 'Sabon Garin Nguru'] }] },
  { state: 'Zamfara', towns: [{ name: 'Gusau', areas: ['Tudun Wada', 'Sabon Gari', 'Hayin Malam'] }, { name: 'Kaura Namoda', areas: ['Banga', 'Kagara', 'Sakajiki'] }, { name: 'Talata Mafara', areas: ['Talata Mafara Central', 'Jangebe', 'Ruwan Bore'] }] },
] as const

export const NIGERIA_STATES = NIGERIA_LOCATIONS.map((entry) => entry.state)

export function getStateTowns(state?: string | null) {
  return NIGERIA_LOCATIONS.find((entry) => entry.state === state)?.towns ?? []
}

export function getTownAreas(state?: string | null, town?: string | null) {
  return getStateTowns(state).find((entry) => entry.name === town)?.areas ?? []
}
