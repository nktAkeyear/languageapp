import re, os
os.environ.setdefault("NLTK_DATA","/tmp/claude-0/nltk")
from nltk.corpus import wordnet as wn
from domain_seeds import SEEDS
DOMAINS=list(SEEDS.keys())+["abstract"]
HYPER={
"food":["food.n.01","food.n.02","beverage.n.01","meal.n.01","dish.n.02","edible_fruit.n.01","vegetable.n.01","meat.n.01","seafood.n.01","dairy_product.n.01","baked_goods.n.01","condiment.n.01","spice.n.02","sweet.n.03","dessert.n.01","drink.v.01","eat.v.01"],
"cooking":["cooking.n.01","kitchen_utensil.n.01","kitchen.n.01","cookware.n.01","cutlery.n.02","cook.v.03","cook.v.01","bake.v.01","fry.v.01","roast.v.01","boil.v.01","kitchen_appliance.n.01"],
"health":["disease.n.01","illness.n.01","medicine.n.02","medicine.n.01","drug.n.01","symptom.n.01","injury.n.01","health_professional.n.01","hospital.n.01","health.n.01","therapy.n.01","medical_science.n.01","pain.n.01","sickness.n.01","heal.v.01","treat.v.03"],
"body":["body_part.n.01","organ.n.01","body.n.01","bodily_property.n.01","bone.n.01","body_covering.n.01","tissue.n.01","body_fluid.n.01","physiological_state.n.01"],
"family":["relative.n.01","kinship.n.01","family.n.01","marriage.n.01","spouse.n.01","baby.n.01","child.n.01","parent.n.01","sibling.n.01"],
"school":["educational_institution.n.01","teacher.n.01","student.n.01","education.n.01","school.n.01","school.n.02","academic_degree.n.01","curriculum.n.01","teach.v.01","learn.v.01","study.v.02","classroom.n.01","examination.n.01","school_day.n.01"],
"shopping":["shop.n.01","purchase.n.01","buy.v.01","goods.n.01","merchandise.n.01","retail.n.01","customer.n.01","store.n.01"],
"money":["money.n.01","currency.n.01","payment.n.01","monetary_unit.n.01","cost.n.01","price.n.02","fee.n.01","wealth.n.01","funds.n.01","income.n.01","pay.v.01","spend.v.01","coin.n.01","cash.n.01"],
"travel":["travel.n.01","journey.n.01","tourist.n.01","tourism.n.01","trip.n.01","luggage.n.01","traveler.n.01","travel.v.01","tour.n.01","visa.n.01","passport.n.01"],
"transport":["vehicle.n.01","conveyance.n.03","transportation.n.01","transport.n.02","road.n.01","craft.n.02","aircraft.n.01","ship.n.01","public_transport.n.01","railway.n.01","car.n.01","wheeled_vehicle.n.01","highway.n.01","airplane.n.01","drive.v.02","ride.v.01"],
"hotel":["hotel.n.01","inn.n.01","lodging.n.01","accommodation.n.04","restaurant.n.01","reservation.n.01","bedroom.n.01","guest.n.01","bed.n.01"],
"nature":["plant.n.02","flora.n.01","tree.n.01","flower.n.01","geological_formation.n.01","body_of_water.n.01","natural_object.n.01","land.n.04","landscape.n.01","environment.n.01","vegetation.n.01","shrub.n.01","herb.n.01","fungus.n.01","soil.n.02","rock.n.01","celestial_body.n.01","location.n.01"],
"animals":["animal.n.01","fauna.n.01","bird.n.01","fish.n.01","insect.n.01","mammal.n.01","reptile.n.01","amphibian.n.03","domestic_animal.n.01","carnivore.n.01","rodent.n.01"],
"weather":["atmospheric_phenomenon.n.01","weather.n.01","season.n.02","climate.n.01","precipitation.n.03","wind.n.01","temperature.n.01","storm.n.01","cloud.n.02"],
"farming":["agriculture.n.01","farm.n.01","farmer.n.01","crop.n.01","harvest.n.01","livestock.n.01","farm_animal.n.01","grain.n.02","cereal.n.01","garden.n.01","plow.n.01","tractor.n.01","fertilizer.n.01"],
"sea":["sea.n.01","ocean.n.01","fishing.n.01","fisherman.n.01","vessel.n.02","boat.n.01","coast.n.01","shore.n.01","wave.n.01","sailor.n.01","navy.n.01","sailing.n.01","harbor.n.01","seafaring.n.01","marine.a.01"],
"crafts":["tool.n.01","implement.n.01","handicraft.n.01","craft.n.03","fabric.n.01","woodwork.n.01","metal.n.01","hand_tool.n.01","power_tool.n.01","textile.n.01","wood.n.01","pottery.n.01","carpentry.n.01","machine_tool.n.01"],
"clothing":["clothing.n.01","garment.n.01","covering.n.02","footwear.n.01","fabric.n.01","jewelry.n.01","wear.v.01","dress.v.01","accessory.n.01","headdress.n.01","neckwear.n.01","costume.n.01"],
"housing":["building.n.01","structure.n.01","house.n.01","room.n.01","furniture.n.01","home.n.01","dwelling.n.01","housing.n.01","home_appliance.n.01","residence.n.02","apartment.n.01","building_material.n.01","architecture.n.01","construction.n.01"],
"communication":["communication.n.02","message.n.02","mail.n.01","letter.n.01","telephone.n.01","correspondence.n.01","writing.n.02","speak.v.01","tell.v.01","communicate.v.01","post_office.n.01","telecommunication.n.01","written_communication.n.01","signal.n.01","speech.n.02","language.n.01"],
"office":["office.n.01","office.n.03","document.n.01","business_office.n.01","clerk.n.01","secretary.n.01","office_furniture.n.01","office_supplies.n.01","paper.n.01","stationery.n.01","file.n.01","administration.n.01","supervisor.n.01","employee.n.01"],
"meetings":["meeting.n.01","conference.n.01","assembly.n.01","committee.n.01","discussion.n.01","negotiation.n.01","vote.n.01","agenda.n.01","speaker.n.01","debate.n.01"],
"sales":["sale.n.01","sell.v.01","marketing.n.01","advertising.n.01","advertisement.n.01","business.n.01","merchant.n.01","trade.n.02","trader.n.01","brand.n.01","commerce.n.01","promotion.n.01","market.n.01","seller.n.01","commercial.n.01","supply.n.01","consumer.n.01"],
"finance":["finance.n.01","accounting.n.02","accountant.n.01","bank.n.02","financial_institution.n.01","stock.n.01","investment.n.01","profit.n.01","tax.n.01","debt.n.01","asset.n.01","credit.n.01","insurance.n.01","capital.n.01","budget.n.01","economy.n.01","interest.n.03","security.n.04","bond.n.02"],
"hr":["employment.n.01","employee.n.01","employer.n.01","worker.n.01","job.n.01","job.n.02","occupation.n.01","career.n.01","profession.n.01","hire.v.01","salary.n.01","labor.n.01","recruit.v.01","personnel.n.01","wage.n.01","staff.n.01","position.n.06","skill.n.01"],
"manufacturing":["manufacture.n.01","factory.n.01","industry.n.01","machine.n.01","machinery.n.01","production.n.01","produce.v.02","equipment.n.01","engineer.n.01","product.n.02","material.n.01","shipment.n.01","cargo.n.01","freight.n.01","warehouse.n.01","storage.n.01","industrial_plant.n.01","assembly.n.02","delivery.n.01","raw_material.n.01"],
"law":["law.n.01","law.n.02","legal_system.n.01","lawyer.n.01","judge.n.01","court.n.01","crime.n.01","criminal.n.01","police.n.01","prison.n.01","contract.n.01","trial.n.02","legal_document.n.01","legislation.n.01","regulation.n.01","punishment.n.01","right.n.01","rule.n.01","offense.n.01","sue.v.01","arrest.v.01","legal_action.n.01","authorization.n.01","permission.n.01","enactment.n.01","jurisprudence.n.01"],
"technology":["technology.n.01","computer.n.01","software.n.01","computer_science.n.01","electronics.n.01","electronic_equipment.n.01","device.n.01","network.n.01","data.n.01","information.n.01","programming.n.01","internet.n.01","electrical_device.n.01","electronic_device.n.01","computer_memory.n.01"],
"science":["science.n.01","natural_science.n.01","physics.n.01","chemistry.n.01","biology.n.01","mathematics.n.01","scientist.n.01","chemical.n.01","element.n.06","chemical_element.n.01","experiment.n.01","theory.n.01","research.n.01","astronomy.n.01","geology.n.01","energy.n.01","particle.n.01","atom.n.01","molecule.n.01","substance.n.01","measure.n.01","unit_of_measurement.n.01","hypothesis.n.01","discipline.n.01","life_science.n.01","scientific_research.n.01","property.n.02"],
"media":["medium.n.01","mass_medium.n.01","broadcast.n.01","television.n.01","newspaper.n.01","magazine.n.01","journalist.n.01","press.n.01","radio.n.01","publication.n.01","film.n.01","movie.n.01","article.n.01","book.n.01","publisher.n.01","news.n.01","print_media.n.01","video.n.01","broadcasting.n.01","communication_medium?.n.01","show.n.03"],
"arts":["art.n.01","artist.n.01","painting.n.01","music.n.01","musician.n.01","song.n.01","drama.n.01","dance.n.01","literature.n.01","poem.n.01","novel.n.01","theater.n.01","sculpture.n.01","creation.n.01","musical_instrument.n.01","artwork.n.01","performing_arts.n.01","entertainment.n.01","performer.n.01","painter.n.01","art_form.n.01","architecture.n.01","design.n.02","photograph.n.01","fiction.n.01","comedy.n.01","play.n.01","show.n.01"],
"sports":["sport.n.01","game.n.01","competition.n.01","athlete.n.01","team.n.01","exercise.n.01","contest.n.01","race.n.01","athletic_game.n.01","ball_game.n.01","gymnastics.n.01","play.v.01","win.v.01","champion.n.01","tournament.n.01","outdoor_sport.n.01","court_game.n.01","field_game.n.01","recreation.n.01","sports_equipment.n.01","gymnastic_apparatus.n.01"],
"emotion":["feeling.n.01","emotion.n.01","trait.n.01","personality.n.01","character.n.04","attitude.n.01","mood.n.01","love.n.01","anger.n.01","fear.n.01","joy.n.01","sadness.n.01","disposition.n.01","temperament.n.01","pleasure.n.01","happiness.n.01","like.v.02","love.v.01","hate.v.01","enjoy.v.01"],
"society":["society.n.01","government.n.01","politics.n.01","political_science.n.01","political_unit.n.01","country.n.02","nation.n.02","community.n.01","state.n.04","religion.n.01","war.n.01","army.n.01","military.n.01","citizen.n.01","leader.n.01","politician.n.01","election.n.01","social_group.n.01","group.n.01","culture.n.01","tradition.n.01","custom.n.01","people.n.01","populace.n.01","organization.n.01","ethnic_group.n.01","institution.n.01","social_science.n.01","public_service.n.01","civilization.n.01","church.n.01","clergyman.n.01","weapon.n.01","conflict.n.01","struggle.n.01","ruler.n.01","official.n.01","nationality.n.01","city.n.01","town.n.01","territory.n.01"],
}
NOUN_LEX={"noun.food":"food","noun.body":"body","noun.animal":"animals","noun.plant":"nature","noun.natural_object":"nature","noun.phenomenon":"nature","noun.feeling":"emotion","noun.motive":"emotion","noun.communication":"communication","noun.possession":"money","noun.cognition":"abstract","noun.attribute":"abstract","noun.time":"abstract","noun.quantity":"abstract","noun.relation":"abstract","noun.shape":"abstract","noun.process":"abstract","noun.event":"abstract","noun.act":"abstract","noun.state":"abstract","noun.group":"society","noun.location":"nature","noun.substance":"science","noun.person":"society","noun.artifact":"crafts","noun.Tops":"abstract","noun.object":"nature"}
VERB_LEX={"verb.body":"body","verb.consumption":"food","verb.communication":"communication","verb.competition":"sports","verb.contact":"crafts","verb.creation":"crafts","verb.emotion":"emotion","verb.motion":"travel","verb.possession":"money","verb.social":"society","verb.stative":"abstract","verb.weather":"weather","verb.change":"abstract","verb.cognition":"abstract","verb.perception":"abstract"}
KW={
"food":r"食べ物|食品|食事|料理|飲み物|飲料|果物|野菜|肉|魚|パン|米|菓子|味|食用|酒|ワイン|ビール|飲む|食べる|空腹",
"cooking":r"調理|料理|煮る|焼く|炒める|揚げる|台所|食器|レシピ|なべ|鍋|オーブン|包丁|ゆでる",
"health":r"病|医|薬|治療|症状|健康|けが|傷|痛|看護|診|療|手術|患者|感染|栄養|伝染",
"body":r"体|身体|頭|顔|目|耳|鼻|口|歯|手|足|指|骨|筋|血|皮膚|心臓|肺|のど|胃|腕|脚|髪",
"family":r"家族|父|母|兄|弟|姉|妹|親|子供|息子|娘|夫|妻|祖|叔|伯|結婚|赤ん坊|親戚|いとこ",
"school":r"学校|授業|教師|生徒|学生|教育|学習|勉強|大学|試験|教科|学位|講義|入学|卒業|学問",
"shopping":r"買い|店|商店|買う|客|値段|安売り|割引|商品|小売|市場|レジ",
"money":r"金|お金|通貨|支払|代金|料金|費|価格|値|貯|給料|賃|借|貸|financ|財産|貨幣|ドル|円|硬貨|紙幣",
"travel":r"旅|観光|旅行|旅券|出発|到着|海外|外国|ツアー|航海|巡礼",
"transport":r"乗り物|車|電車|列車|バス|船|飛行機|航空|道路|交通|運転|鉄道|自動車|運搬|運賃|駅|空港|港",
"hotel":r"ホテル|宿|客室|宿泊|旅館|予約|給仕|レストラン|フロント",
"nature":r"自然|植物|木|花|草|山|川|湖|森|海|島|岩|砂|土|地球|大地|地面|谷|丘|林|星|月|太陽|宇宙|環境|生態",
"animals":r"動物|犬|猫|鳥|魚|馬|牛|豚|羊|虫|獣|昆虫|ヘビ|蛇|カエル|クマ|ライオン|ウサギ|ネズミ|サル",
"weather":r"天気|気候|雨|雪|風|嵐|雷|霧|曇|晴|気温|暑|寒|湿|季節|台風|洪水|氷|霜|雲|気象",
"farming":r"農|畑|作物|収穫|栽培|家畜|牧|耕|田|穀物|稲|麦|肥料|果樹|酪農",
"sea":r"海|漁|船|航海|港|岸|波|水夫|船員|潮|海軍|魚|浜|海洋",
"crafts":r"道具|工具|工作|細工|手芸|大工|木工|金属|織|縫|編|陶|刃|のこぎり|ハンマー|職人|工芸|修理|彫",
"clothing":r"服|衣類|着る|着用|靴|帽子|装身|ドレス|衣服|衣装|スカート|ズボン|シャツ|上着|宝石|指輪|身につけ",
"housing":r"家|住宅|部屋|建物|建築|家具|屋根|壁|床|窓|ドア|庭|住居|住む|家賃|不動産|台所|寝室|アパート|マンション",
"communication":r"手紙|郵便|電話|通信|伝える|話す|言う|連絡|返事|メッセージ|メール|放送|伝達|通知|言語|発表|会話|書簡",
"office":r"事務|オフィス|書類|会社|職場|文書|秘書|ファイル|文房具|上司|部署|同僚|事務所",
"meetings":r"会議|議論|討論|議題|会談|協議|会合|委員会|出席|審議|提案|議事|総会|大会",
"sales":r"販売|売る|売買|広告|宣伝|顧客|市場|営業|商売|取引|マーケット|ブランド|貿易|商業|商人|売り込|景品|注文",
"finance":r"財政|会計|財務|株|利益|投資|銀行|税|負債|資本|預金|証券|融資|収益|保険|経済|金融|利子|予算|決算|損益",
"hr":r"雇|従業員|採用|給与|求人|職業|職|労働|就職|解雇|昇進|辞職|退職|経歴|資格|人事|職員|労働者|転職",
"manufacturing":r"製造|工場|生産|製品|在庫|倉庫|貨物|輸送|機械|工業|組み立て|品質|原料|部品|材料|出荷|積み荷|産業|メーカー",
"law":r"法|裁判|訴訟|契約|権利|罰|犯罪|違反|弁護|判事|警察|刑|規則|規制|判決|被告|原告|条約|特許|許可|禁止",
"technology":r"コンピュータ|ソフト|ネット|電子|装置|技術|デジタル|プログラム|データ|情報|システム|電気|機器|通信網|ロボット|ネットワーク|インターネット",
"science":r"科学|物理|化学|生物|数学|実験|理論|研究|分析|原子|分子|元素|医学|学説|観察|測定|学術|天文|地質|方程式|細胞|遺伝",
"media":r"新聞|雑誌|テレビ|ラジオ|放送|記者|出版|報道|番組|映画|記事|広報|メディア|ニュース|雑誌|編集",
"arts":r"芸術|美術|絵|音楽|歌|劇|演劇|舞踊|ダンス|小説|詩|文学|彫刻|映画|楽器|画家|作家|俳優|演奏|文化|展覧",
"sports":r"スポーツ|競技|試合|選手|運動|球|チーム|ゲーム|勝|優勝|練習|競走|泳|スキー|テニス|ゴルフ|サッカー",
"emotion":r"感情|気持ち|愛|怒|悲|喜|楽しい|うれしい|恐|不安|性格|勇気|親切|悲し|怒り|恥|誇り|嫉妬|愉快|退屈|幸福",
"society":r"社会|政治|政府|国家|国民|宗教|戦争|軍|市民|共同体|選挙|文化|民族|平和|自由|権力|政策|大統領|議会|制度|伝統|習慣",
}
_cache={}
def _syn(name):
    if name in _cache: return _cache[name]
    try: s=wn.synset(name)
    except Exception: s=None
    _cache[name]=s; return s
H2D={}
def _init():
    for d,names in HYPER.items():
        for n in names:
            s=_syn(n)
            if s: H2D.setdefault(s,[]).append(d)
_init()
MISSING=[n for names in HYPER.values() for n in names if _syn(n) is None]
SEED_IDX={}
for d,ws in SEEDS.items():
    for w in ws: SEED_IDX.setdefault(w,[]).append(d)
WNP={'noun':'n','verb':'v','adjective':'a','adverb':'r'}
def infer(word,pos,ejentry,in_tsl=False,in_bsl=False,maxn=3):
    sc={}
    def add(d,x):
        sc[d]=sc.get(d,0)+x
    w=word.lower()
    for i,d in enumerate(SEED_IDX.get(w,[])): add(d,3.0-0.1*i)
    wp=WNP.get(pos)
    syns=wn.synsets(w,pos=wp) if wp else wn.synsets(w)
    syns=[s for s in syns if not s.instance_hypernyms()][:3]
    for i,s in enumerate(syns):
        wt=(1.0,0.6,0.35)[i]
        seen=set(); 
        for a in [s]+list(s.closure(lambda x:x.hypernyms())):
            for d in H2D.get(a,[]):
                if (d,) in seen: continue
                seen.add((d,)); add(d,1.2*wt)
        ln=s.lexname()
        d=(NOUN_LEX if s.pos()=='n' else VERB_LEX).get(ln)
        if d: add(d,0.5*wt)
        # derivationally related nouns for adjectives/adverbs
        if s.pos() in 'ars' and i==0:
            for l in s.lemmas()[:2]:
                for rel in l.derivationally_related_forms()[:2]+l.pertainyms()[:2]:
                    for s2 in rel.synset().hypernyms()[:1]+[rel.synset()]:
                        for a in [s2]+list(s2.closure(lambda x:x.hypernyms()))[:6]:
                            for d in H2D.get(a,[]): add(d,0.5*wt)
    if ejentry:
        e=ejentry[:120]
        for d,rx in KW.items():
            if re.search(rx,e): add(d,0.6)
    if in_tsl or in_bsl:
        add('office',0.3 if in_bsl else 0.4)
        if in_bsl: add('finance',0.4)
    ranked=sorted(sc.items(),key=lambda x:-x[1])
    out=[d for d,v in ranked if v>=0.9][:maxn]
    if not out and ranked and ranked[0][1]>=0.5: out=[ranked[0][0]]
    # drop 'abstract' when something else present
    nonabs=[d for d in out if d!='abstract']
    if nonabs: out=nonabs
    return out or ['abstract']
