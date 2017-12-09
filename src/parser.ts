import {
  Character,
  CharacterCore,
  Collection,
  GearLevel,
  Guild,
  ModCollection, ModPrimary,
  ModPrimaryValue,
  Mod,
  ModSlot,
  Profile,
  Ship,
  ShipCollection,
  TranslatedModName,
  User,
  UserInfo,
  UserStats, CharacterStats, CharacterCoreStats, CharacterBaseStats, CharacterBaseOffensive, CharacterBaseDefensive,
  CharacterBaseGear, CharacterBaseAbilities, ShipStats, ShipBaseStats, ShipBaseOffensive, ShipBaseDefensive, ShipType
} from "./interface";


export function parseCollection($: CheerioStatic): Collection {
  return <any>$("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-a.collection-char-list > div > div > div > div.player-char-portrait")
    .map(function (x) {
      const _$ = $(this);
      const p$ = _$.parent("div");

      const n$ = p$.find("div.collection-char-name");
      const na$ = n$.find("a");

      const a$ = _$.find("a");
      const i$ = a$.find("img");
      const gp$ = p$.find("div.collection-char-gp");
      const gp = gp$.attr("title").replace(/,/g, '').match(/\d+/g); // fix points


      const gl: number = a$.find("div.char-portrait-full-gear-level").text() as any;


      return <Character>{
        code: na$.attr("href").match(/(?:\/u\/.*collection\/)(.*)(?:\/)$/)[1],
        description: na$.text(),

        imageSrc: i$.attr("src").slice(2),

        star: 7 - a$.find("div.star-inactive").length,
        gearLevel: <GearLevel> (GearLevel[gl] as any), //todo fix this cast
        level: +(a$.find("div.char-portrait-full-level").text()),

        galacticPower: +gp[0],
        maxGalacticPower: +gp[1],
      }
    })
    .get();
}

export function parseProfile($: CheerioStatic): Profile {
  return {...parseInfo($), ...parseStats($), ...parseUser($)};

}

export function parseGuild($: CheerioStatic): Guild {
  return <any>$("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr > td > a")
    .map(function () {
      const _$ = $(this);
      const username = _$.attr("href").slice(3, -1);
      const description = _$.find("strong").text();
      return {username, description};
    }).get();
}


export function parseShips($: CheerioStatic): ShipCollection {
  return <any> $('body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-a.collection-char-list > div > div > div')
    .map(function (x) {
      const _$ = $(this);
      const na$ = _$.find('div.collection-ship-name > a'); //name
      const m$ = _$.find(".collection-ship-main"); //main


      const ship$ = m$.find('div.collection-ship-primary > div > a');
      const crew$ = m$.find('div.collection-ship-secondary');


      const gp$ = crew$.find("div.collection-char-gp");
      const gpTitle = gp$.attr("title");
      const gp = gpTitle
        ? gpTitle.replace(/,/g, '').match(/\d+/g) // fix points
        : [undefined, undefined, undefined];

      const stars = ship$.find("div.ship-portrait-full-star-inactive").length;

      const img = ship$.find(".ship-portrait-full-frame-img").attr("src");

      // todo move to other place
      const crewMembers = crew$.find('.collection-ship-crew-member')
        .map(function (x) {
          const _$ = $(this);
          const na$ = _$.find(".char-portrait-full-link");

          const a$ = _$.find("a");
          const i$ = a$.find("img");

          const name = _$.find('.player-char-portrait').attr("title");


          const gl: number = a$.find("div.char-portrait-full-gear-level").text() as any;

          // NOTE if the user doesn't have that crew member unlocked it should skip it
          if (!na$.attr("href"))
            return;

          return <CharacterCore>{
            code: na$.attr("href").match(/(?:\/(?:u\/.*\/|)collection\/)(.*)(?:\/)$/)[1],
            description: name,

            imageSrc: i$.attr("src").slice(2),

            star: 7 - a$.find("div.star-inactive").length,
            gearLevel: <GearLevel> (GearLevel[gl] as any), //todo fix this cast
            level: +(a$.find("div.char-portrait-full-level").text()),
          }
        })
        .get();


      const hasShip = na$.attr("href").startsWith('/u');

      return <Ship>{
        code: na$.attr("href").match(/(?:\/(?:u\/.*\/|)ships\/)(.*)(?:\/)$/)[1],
        description: na$.text(),

        imageSrc: img === undefined ? ship$.find(".ship-portrait-frame-img").attr("src") : img,

        star: hasShip ? 7 - stars : 0,
        level: +ship$.find(".ship-portrait-full-frame-level").text(),


        crew: crewMembers as any,

        galacticPower: +gp[0],
        maxGalacticPower: +gp[1],
      }
    })
    .get();
}


const parseUser = ($: CheerioStatic): User => {
  const b$ = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div.panel.panel-default.panel-profile.m-b-sm > div.panel-body");

  const name = b$.find("h5.panel-title").text();
  const panelMenus = b$.find("ul > li > h5").get().map((x: any) => +x.lastChild.nodeValue);
  const p = b$.find("p > strong").slice(1).get().map((x: any) => x.lastChild.nodeValue);

  const g = b$.find("p > strong > a");
  const aGuild = g.text(); //get
  const aGuildUrl = g.attr("href");


  return {
    username: name,

    userId: panelMenus[0],
    arenaRank: panelMenus[1],
    level: panelMenus[2],


    allyCode: p[1] && p[0],
    joined: p[1] || p[0],


    guild: aGuild,
    guildUrl: aGuildUrl

  }

};

const parseStats = ($: CheerioStatic): UserStats => {
  const p = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(3) > div > div > ul > li > h5")
    .get().map((x: any) => +x.lastChild.nodeValue);


  return {
    collectionScore: p[0],
    characters: p[1],
    characters7: p[2],
    characters6: p[3],
    gearXII: p[4],
    gearXI: p[5],
    gearX: p[6],
    gearIX: p[7],
    gearVIII: p[8],
  }
};

const parseInfo = ($: CheerioStatic): UserInfo => {
  const p: number[] = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div:nth-child(4) > div > div > p > strong").get()
    .map((x: any) => +x.lastChild.nodeValue.replace(/,/g, ""));

  return {
    galacticPower: p[0],
    charactersGalacticPower: p[1],
    shipsGalacticPower: p[2],
    pVEBattlesWon: p[3],
    pVEHardBattlesWon: p[4],
    galacticWarBattlesWon: p[5],
    arenaBattlesWon: p[6],
    guildCurrencyEarned: p[7],
    raidsWon: p[8],
    shipBattlesWon: p[9],
  }

};


export const parseModCollection = ($: CheerioStatic): ModCollection => {

  const m = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.mod-list > ul > li.media.list-group-item.p-a.collection-mod-list > div > div > div")
    .map(function (x) {
      const _$ = $(this);


      const tier = _$.find(".statmod-pip").length;
      const character = _$.find(".char-portrait-img").attr("alt");
      const level = _$.find(".statmod-level").text();

      const description = _$.find(".statmod-img").attr("alt");


      const mod = _$.find(".pc-statmod").first();

      /*
export enum ModSlot {
  Transmitter,
  Receiver,
  Processor,
  HoloArray,
  DataBus,
  Multiplexer
}*/
      let slot: ModSlot = mod.hasClass("pc-statmod-slot1") && ModSlot.Transmitter;
      slot = !slot && mod.hasClass("pc-statmod-slot2") && ModSlot.Receiver || slot;
      slot = !slot && mod.hasClass("pc-statmod-slot3") && ModSlot.Processor || slot;
      slot = !slot && mod.hasClass("pc-statmod-slot4") && ModSlot.HoloArray || slot;
      slot = !slot && mod.hasClass("pc-statmod-slot5") && ModSlot.DataBus || slot;
      slot = !slot && mod.hasClass("pc-statmod-slot6") && ModSlot.Multiplexer || slot;


      const primaryStat = _$.find(".statmod-stats-1");
      const secondaryStats = _$.find(".statmod-stats-2 > .statmod-stat");


      const primary: ModPrimaryValue = {
        type: primaryStat.find(".statmod-stat-label").text() as ModPrimary,
        value: primaryStat.find(".statmod-stat-value").text(),//.replace(/\+|%/g,''), // NOTE no need to use number
      };

      const secondary = secondaryStats.map(function (s) {
        const ss = $(this);
        return {
          type: ss.find(".statmod-stat-label").text(),
          value: ss.find(".statmod-stat-value").text(),//.replace(/\+|%/g,''), // NOTE no need to use number
        }
      }).get();


      return {
        character,
        tier,

        description,

        level,
        slot: TranslatedModName[slot],

        primary: primary,
        secondary,
      }

    }).get();

  return m as any;
};


export const parseCharacterStats = ($: CheerioStatic): CharacterStats[] => {
  const c = $("#characters").find("tbody > tr")
    .map(function (x): CharacterStats {
      const _$ = $(this);

      const a = _$.find("td > a");

      const href = a.attr("href");

      const code = href.match(/(?:\/characters\/)([^\/]*)/)[1];
      const description = a.text();
      const tds = _$.find("td").get().slice(1).map((x: any) => x.lastChild.nodeValue);


      const core: CharacterCoreStats = {
        code,
        description
      };

      // base stats
      const base: CharacterBaseStats = {
        power: +tds[0],
        speed: +tds[1],
        health: fixNumber(tds[2]),
        maxAbility: tds[3] !== "None" ? +tds[3] : null,
      };
      const offensive: CharacterBaseOffensive = {
        physicalDmg: +tds[4],
        physicalCrit: +tds[5],
        specialDmg: +tds[6],
        specialCrit: +tds[7],
        armorPen: +tds[8],
        resistancePen: +tds[9],
        potency: +tds[10],
      };

      const defensive: CharacterBaseDefensive = {
        protection: fixNumber(tds[11]),
        armor: +tds[12],
        resistance: +tds[13],
        tenacity: parsePercent100(tds[14]),
        healthSteal: parsePercent100(tds[15]),
      };

      const gear: CharacterBaseGear = {
        tier: +tds[16],
        credits: fixNumber(tds[17]),
        raid: +tds[18],
        gold: +tds[19],
        purple: +tds[20],
        blue: +tds[21],
        green: +tds[22],
        white: +tds[23],
      };


      const abilities: CharacterBaseAbilities = {
        maxDamageAbility: tds[24] !== "None" ? +tds[24] : null,
        baseAbility: tds[25] !== "None" ? +tds[25] : null,
        aoeAbility: +tds[26],
      };

      return {
        ...core,
        ...base,
        ...offensive,
        ...defensive,
        ...gear,
        ...abilities
      } as CharacterStats
    });

  return c.get() as any as CharacterStats[];
};


export const parseShipStats = ($: CheerioStatic): ShipStats[] => {

  const c = $("#units").find("tbody > tr")
    .map(function (x): ShipStats {
      const _$ = $(this);

      const a = _$.find("td > a");
      const href = a.attr("href");

      const code = href.match(/(?:\/ships\/)([^\/]*)/)[1];
      const description = a.text();
      const tds = _$.find("td").get().slice(1).map((x: any) => (x.lastChild || {}).nodeValue);

      const core: CharacterCoreStats = {
        code,
        description
      };

      // base stats
      const base: ShipBaseStats = {
        power: +tds[0],
        speed: +tds[1],
        health: fixNumber(tds[2]),
        protection: fixNumber(tds[8]),
      };

      const shipType: ShipType = {
        isCapital: base.health === null
      };


      const offensive: ShipBaseOffensive = {
        physicalDmg: +tds[3],
        physicalCrit: +tds[4],
        specialDmg: +tds[5],
        specialCrit: +tds[6],
        potency: +tds[7],
      };

      const defensive: ShipBaseDefensive = {
        armor: +tds[9],
        resistance: +tds[10],
        tenacity: parsePercent100(tds[11]),
      };


      return {
        ...core,
        ...shipType,
        ...base,
        ...offensive,
        ...defensive,
      } as ShipStats
    });

  return c.get() as any as ShipStats[];
};

export const parseUserToon = ($: CheerioStatic) => {

};


const fixNumber = (txt: string): number => txt && +txt.replace(/,/g, '') || null;
const parsePercent100 = (txt: string): number => (+txt.replace("%", '')) / 100;
