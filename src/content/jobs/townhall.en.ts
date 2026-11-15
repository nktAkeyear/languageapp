import type { VerificationPage } from '../../core/types';
import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, RespondSlotCell, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * The town hall counter (役場の窓口): the town's administrative English, TOEIC-flavoured. Ranks map to 英検 3 / 準2 / 2 / 準1 / 1
 * (TOEIC 〜500 / 〜600 / 〜730 / 〜860 / 〜990). Domains: government, law, taxes, housing, permits, elections, public services,
 * the environment and the community.
 *
 * - sort: applications, forms and letters to the right desk (housing, licenses, taxes, the registry, roads and works,
 *   waste, planning, elections, hearings …), read from what each paper asks for;
 * - check: an applicant's form ↔ their papers (ID card, permit, receipt) ↔ the regulation: mark the line that disagrees
 *   (rank 3+: also choose the value that should stand there);
 * - respond: a resident's question answered from the by-law / notice on the counter, a letter or e-mail answered,
 *   eligibility decided from rules with conditions and exceptions, a phone message written on the pad, and hearings,
 *   inspections and appointments booked into the one free slot that fits.
 *
 * The town hall has a running story: Mr. Hollis, the town clerk, and his counter; Ms. Aldridge's housing desk; the
 * harbour road that is dug up for the new pipes; the dog licenses and the parking permits; the market hall that needs a
 * permit; the election of the harbour council; and, at the top rank, the planning hearing for the old warehouse.
 *
 * Authoring notes: each authored task brings at most four words that are new to the job (first met where the layout, a
 * number or the consequence of a wrong answer shows the meaning); templates only draw on words the spine of that rank (or
 * an earlier one) has introduced. The job's lexicon, the phrase / grammar tags and the extra forms below are generated
 * from the texts by a tool and kept in the marked blocks; do not edit them by hand.
 */

// <<GEN:SEQ>>
const SEQMAP: Record<string, number> = {"th1_slot1":1,"th1_ask3":2,"th1_slot2":3,"th1_slot3":4,"th1_ask1":5,"th1_hours":6,"th1_closed":7,"th1_ask2":8,"th1_desks1":9,"th1_desk":10,"th1_fee":11,"th1_date":12,"th1_receipt":13,"th1_ok2":14,"th1_pad1":15,"th1_birth":16,"th1_dog":17,"th1_ok1":18,"th1_pad2":19,"th1_garbage":20,"th1_desks2":21,"th1_desks4":22,"th1_desks3":23,"th2_slot1":1,"th2_hours":2,"th2_slot2":3,"th2_slot3":4,"th2_fee":5,"th2_desks1":6,"th2_road":7,"th2_dob":8,"th2_tax":9,"th2_ok1":10,"th2_pad1":11,"th2_addr":12,"th2_ask1":13,"th2_renew":14,"th2_valid":15,"th2_desks3":16,"th2_rule2":17,"th2_pad2":18,"th2_desks2":19,"th2_notice2":20,"th2_phone1":21,"th2_letter1":22,"th2_ask2":23,"th3_slot1":1,"th3_slot3":2,"th3_slot4":3,"th3_hearing2":4,"th3_phone2":5,"th3_pad1":6,"th3_stall3":7,"th3_ask2":8,"th3_election1":9,"th3_election3":10,"th3_ask3":11,"th3_ask4":12,"th3_notice":13,"th3_notice2":14,"th3_stall1":15,"th3_stall2":16,"th3_ok1":17,"th3_income1":18,"th3_income2":19,"th3_slot2":20,"th3_pad2":21,"th3_ask5":22,"th3_noise1":23,"th3_hearing1":24,"th3_hearing3":25,"th3_fine":26,"th3_fine2":27,"th3_ask7":28,"th3_sort3":29,"th3_sort1":30,"th3_tax3":31,"th3_ask8":32,"th3_tax1":33,"th3_tax2":34,"th3_ask1":35,"th3_sort2":36,"th3_repair":37,"th3_noise2":38,"th3_subsidy2":39,"th3_subsidy1":40,"th3_subsidy3":41,"th3_ok2":42,"th3_subsidy4":43,"th3_waste1":44,"th3_waste2":45,"th3_boat":46,"th3_boatfee":47,"th3_election2":48,"th3_ask6":49,"th3_sort4":50,"th3_idea":51,"th3_final":52,"th4_slot3":1,"th4_minutes3":2,"th4_hearing1":3,"th4_slot1":4,"th4_grant3":5,"th4_grant4":6,"th4_ok2":7,"th4_phone2":8,"th4_grant1":9,"th4_grant2":10,"th4_slot2":11,"th4_deposit1":12,"th4_deposit2":13,"th4_noise1":14,"th4_flood2":15,"th4_pad1":16,"th4_ask1":17,"th4_tender3":18,"th4_trees2":19,"th4_trees1":20,"th4_trees3":21,"th4_nomination2":22,"th4_ok3":23,"th4_nomination1":24,"th4_nomination3":25,"th4_event2":26,"th4_event3":27,"th4_event1":28,"th4_deposit3":29,"th4_final":30,"th4_slot4":31,"th4_pad2":32,"th4_appeal3":33,"th4_tender1":34,"th4_tender2":35,"th4_sort2":36,"th4_appeal1":37,"th4_appeal2":38,"th4_ok1":39,"th4_sort1":40,"th4_minutes2":41,"th4_minutes1":42,"th4_flood":43,"th4_licence":44,"th4_minutes4":45,"th5_slot4":1,"th5_arrears4":2,"th5_arrears2":3,"th5_arrears3":4,"th5_arrears1":5,"th5_slot2":6,"th5_pad1":7,"th5_trans1":8,"th5_trans3":9,"th5_trans2":10,"th5_slot1":11,"th5_recount2":12,"th5_phone1":13,"th5_plan6":14,"th5_sort2":15,"th5_proviso1":16,"th5_ok1":17,"th5_plan1":18,"th5_plan2":19,"th5_plan4":20,"th5_final2":21,"th5_final4":22,"th5_sort1":23,"th5_plan5":24,"th5_slot3":25,"th5_discharge3":26,"th5_phone2":27,"th5_final3":28,"th5_plan3":29,"th5_final1":30,"th5_abate2":31,"th5_abate3":32,"th5_abate1":33,"th5_info4":34,"th5_info2":35,"th5_info3":36,"th5_ok2":37,"th5_info1":38,"th5_recount3":39,"th5_recount1":40,"th5_proviso3":41,"th5_proviso2":42,"th5_ask1":43,"th5_discharge2":44,"th5_discharge1":45};
// <<END:SEQ>>

// <<GEN:TAGS>>
const TAGS: Tags = {"th1_desks1":{"grammar":["gr-5-011"]},"th1_hours":{"grammar":["gr-4-026"]},"th1_ok1":{"grammar":["gr-5-011"]},"th1_desks2":{"grammar":["gr-3-027","gr-pre2-012"]},"th1_slot1":{"grammar":["gr-3-039","gr-4-008"]},"th1_fee":{"grammar":["gr-3-029"]},"th1_pad1":{"grammar":["gr-3-019"],"phrases":["ph-4-0141","ph-3-0137"]},"th1_desks3":{"grammar":["gr-3-019","gr-3-027"],"phrases":["ph-pre2-0269"]},"th1_date":{"grammar":["gr-5-011"]},"th1_garbage":{"grammar":["gr-3-019","gr-4-019"]},"th1_slot2":{"grammar":["gr-3-039"],"phrases":["ph-4-0149"]},"th1_desk":{"grammar":["gr-5-011","gr-5-013"]},"th1_ask1":{"grammar":["gr-5-013"],"phrases":["ph-4-0150"]},"th1_pad2":{"grammar":["gr-pre2-056"],"phrases":["ph-4-0141"]},"th1_closed":{"grammar":["gr-3-039","gr-4-026"]},"th1_desks4":{"grammar":["gr-3-027","gr-4-008"]},"th1_slot3":{"grammar":["gr-4-008"]},"th1_ask2":{"grammar":["gr-3-039","gr-4-026"],"phrases":["ph-4-0150"]},"th1_ok2":{"grammar":["gr-5-016"]},"th1_ask3":{"grammar":["gr-5-011"]},"th2_desks1":{"grammar":["gr-3-014","gr-3-027"],"phrases":["ph-pre2-0269"]},"th2_dob":{"grammar":["gr-5-011"]},"th2_road":{"grammar":["gr-2-030","gr-3-005"]},"th2_slot1":{"grammar":["gr-2-045","gr-3-039"]},"th2_renew":{"grammar":["gr-3-029","gr-3-039"]},"th2_desks2":{"grammar":["gr-3-001","gr-3-027"]},"th2_tax":{"grammar":["gr-3-039"]},"th2_hours":{"grammar":["gr-5-013"]},"th2_pad1":{"grammar":["gr-pre2-041"]},"th2_addr":{"grammar":["gr-5-011"]},"th2_letter1":{"grammar":["gr-3-039"]},"th2_slot2":{"grammar":["gr-2-045"]},"th2_ask1":{"grammar":["gr-3-039"]},"th2_notice2":{"grammar":["gr-3-019","gr-3-031"]},"th2_desks3":{"grammar":["gr-4-001","gr-4-008"]},"th2_ok1":{"grammar":["gr-5-016"]},"th2_phone1":{"grammar":["gr-3-002","gr-3-039"]},"th2_slot3":{"grammar":["gr-5-011"]},"th2_fee":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"th2_rule2":{"grammar":["gr-pre2-011","gr-2-030"]},"th2_ask2":{"grammar":["gr-3-031","gr-3-039"],"phrases":["ph-pre2-0241"]},"th2_pad2":{"grammar":["gr-5-011","gr-5-020"]},"th3_stall1":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133"]},"th3_stall2":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133"]},"th3_sort1":{"grammar":["gr-3-007","gr-3-027"]},"th3_stall3":{"grammar":["gr-pre2-056"],"phrases":["ph-pre1-0452"]},"th3_ok1":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133"]},"th3_ask1":{"grammar":["gr-2-030","gr-2-056"]},"th3_tax1":{"grammar":["gr-2-030","gr-2-056"]},"th3_tax2":{"grammar":["gr-2-030","gr-2-056"]},"th3_pad1":{"grammar":["gr-5-011","gr-5-016"]},"th3_tax3":{"grammar":["gr-3-001","gr-3-019"]},"th3_slot1":{"grammar":["gr-3-039","gr-4-007"]},"th3_income1":{"grammar":["gr-5-016"]},"th3_income2":{"grammar":["gr-pre2-010"]},"th3_subsidy1":{"grammar":["gr-2-045","gr-pre2-041"]},"th3_subsidy2":{"grammar":["gr-2-045","gr-pre2-010"]},"th3_subsidy3":{"grammar":["gr-2-045","gr-pre2-041"]},"th3_subsidy4":{"grammar":["gr-2-045","gr-pre2-041"]},"th3_sort2":{"grammar":["gr-3-002","gr-3-010"],"phrases":["ph-pre1-0099"]},"th3_ask2":{"grammar":["gr-3-019","gr-3-039"],"phrases":["ph-pre1-0100"]},"th3_slot2":{"grammar":["gr-3-039","gr-4-003"]},"th3_repair":{"grammar":["gr-3-019","gr-3-039"]},"th3_election1":{"grammar":["gr-2-030","gr-pre2-011"]},"th3_election2":{"grammar":["gr-pre2-011"]},"th3_election3":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"th3_pad2":{"grammar":["gr-pre2-012","gr-pre2-056"]},"th3_waste1":{"grammar":["gr-3-018","gr-3-019"],"phrases":["ph-pre2-0022","ph-pre2-0367"]},"th3_waste2":{"grammar":["gr-3-027"]},"th3_noise1":{"grammar":["gr-3-019","gr-4-008"]},"th3_ask3":{"grammar":["gr-pre2-015"]},"th3_sort3":{"grammar":["gr-2-045","gr-pre2-047"],"phrases":["ph-2-0474"]},"th3_noise2":{"grammar":["gr-3-002","gr-3-019"]},"th3_slot3":{"grammar":["gr-4-008"]},"th3_ask4":{"grammar":["gr-pre2-041"]},"th3_notice":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"th3_notice2":{"grammar":["gr-2-030","gr-pre2-039"]},"th3_ask5":{"grammar":["gr-2-066","gr-pre2-048"],"phrases":["ph-2-0049"]},"th3_hearing1":{"grammar":["gr-2-030","gr-pre2-037"]},"th3_hearing2":{"grammar":["gr-3-001","gr-3-003"]},"th3_hearing3":{"grammar":["gr-2-030","gr-pre2-055"]},"th3_slot4":{"grammar":["gr-pre2-011"]},"th3_ask6":{"grammar":["gr-pre2-041"]},"th3_fine":{"grammar":["gr-pre2-037"],"phrases":["ph-2-0272"]},"th3_fine2":{"grammar":["gr-pre2-037"],"phrases":["ph-2-0272"]},"th3_phone2":{"grammar":["gr-3-039","gr-4-002"],"phrases":["ph-pre2-0373"]},"th3_ask7":{"grammar":["gr-3-018","gr-3-039"]},"th3_sort4":{"grammar":["gr-3-002","gr-3-027"]},"th3_idea":{"grammar":["gr-2-043","gr-pre2-015"]},"th3_boat":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"th3_boatfee":{"grammar":["gr-3-039","gr-4-003"]},"th3_ok2":{"grammar":["gr-2-045","gr-pre2-041"]},"th3_ask8":{"grammar":["gr-3-018","gr-3-019"]},"th3_final":{"grammar":["gr-3-001","gr-3-039"],"phrases":["ph-pre2-0034"]},"th4_appeal1":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"th4_appeal2":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"th4_sort1":{"grammar":["gr-2-030","gr-2-045"]},"th4_appeal3":{"grammar":["gr-pre2-013","gr-3-001"]},"th4_ok1":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"th4_grant1":{"grammar":["gr-2-030"]},"th4_grant2":{"grammar":["gr-2-030"]},"th4_grant3":{"grammar":["gr-2-030"]},"th4_grant4":{"grammar":["gr-2-030"],"phrases":["ph-2-0245"]},"th4_slot1":{"grammar":["gr-3-019","gr-3-039"]},"th4_tender1":{"grammar":["gr-3-019","gr-3-022"]},"th4_tender2":{"grammar":["gr-3-031","gr-3-039"]},"th4_tender3":{"grammar":["gr-2-030"]},"th4_pad1":{"grammar":["gr-2-030"]},"th4_minutes1":{"grammar":["gr-3-039","gr-4-002"]},"th4_minutes2":{"grammar":["gr-2-018"]},"th4_minutes3":{"grammar":["gr-2-030"]},"th4_trees1":{"grammar":["gr-2-045"]},"th4_trees3":{"grammar":["gr-pre1-022"],"phrases":["ph-2-0194","ph-2-0272"]},"th4_ask1":{"grammar":["gr-pre2-037","gr-3-007"],"phrases":["ph-2-0272"]},"th4_nomination1":{"grammar":["gr-pre2-010","gr-pre2-011"]},"th4_nomination2":{"grammar":["gr-pre2-010","gr-pre2-011"]},"th4_slot2":{"grammar":["gr-3-039","gr-4-003"]},"th4_nomination3":{"grammar":["gr-pre2-015","gr-3-002"]},"th4_event1":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133","ph-pre1-0448"]},"th4_event2":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133","ph-pre1-0448"]},"th4_event3":{"grammar":["gr-pre1-032","gr-2-030"],"phrases":["ph-2-0159","ph-pre1-0133"]},"th4_sort2":{"grammar":["gr-3-002","gr-3-027"]},"th4_deposit1":{"grammar":["gr-pre2-015","gr-pre2-037"],"phrases":["ph-2-0194","ph-pre1-0100"]},"th4_deposit2":{"grammar":["gr-2-058"],"phrases":["ph-2-0194","ph-pre1-0100"]},"th4_deposit3":{"grammar":["gr-2-020"],"phrases":["ph-2-0194","ph-pre1-0100"]},"th4_slot3":{"grammar":["gr-3-039","gr-4-007"]},"th4_hearing1":{"grammar":["gr-3-039","gr-4-002"]},"th4_slot4":{"grammar":["gr-3-001","gr-3-039"]},"th4_ok2":{"grammar":["gr-2-030"]},"th4_noise1":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"th4_flood":{"grammar":["gr-2-030"]},"th4_flood2":{"grammar":["gr-2-058"]},"th4_phone2":{"grammar":["gr-pre2-055","gr-pre2-056"]},"th4_licence":{"grammar":["gr-3-039","gr-4-003"],"phrases":["ph-pre1-0133"]},"th4_pad2":{"grammar":["gr-pre2-055","gr-3-005"]},"th4_minutes4":{"grammar":["gr-2-030","gr-2-056"]},"th4_ok3":{"grammar":["gr-pre1-032"],"phrases":["ph-2-0159"]},"th4_final":{"grammar":["gr-pre2-015","gr-3-001"]},"th5_plan1":{"grammar":["gr-pre2-037","gr-pre2-041"]},"th5_plan2":{"grammar":["gr-pre2-014","gr-pre2-037"]},"th5_plan3":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_sort1":{"grammar":["gr-2-043","gr-3-001"]},"th5_plan4":{"grammar":["gr-pre1-032"]},"th5_plan5":{"grammar":["gr-2-030","gr-3-001"]},"th5_slot1":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_plan6":{"grammar":["gr-2-030","gr-2-045"],"phrases":["ph-pre1-0448"]},"th5_abate1":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0422"]},"th5_abate2":{"grammar":["gr-pre2-037","gr-pre2-040"],"phrases":["ph-pre1-0422"]},"th5_abate3":{"grammar":["gr-2-058","gr-pre2-037"],"phrases":["ph-pre1-0422"]},"th5_arrears1":{"grammar":["gr-1-032"]},"th5_arrears2":{"grammar":["gr-1-032"]},"th5_arrears3":{"grammar":["gr-1-032"],"phrases":["ph-pre1-0448"]},"th5_arrears4":{"grammar":["gr-2-056","gr-3-001"]},"th5_slot2":{"grammar":["gr-4-008"]},"th5_info1":{"grammar":["gr-2-030","gr-pre2-007"],"phrases":["ph-pre1-0448"]},"th5_info2":{"grammar":["gr-2-030","gr-pre2-007"],"phrases":["ph-pre1-0448"]},"th5_info3":{"grammar":["gr-2-030","gr-2-058"]},"th5_info4":{"grammar":["gr-pre2-015","gr-3-001"]},"th5_pad1":{"grammar":["gr-3-019","gr-3-031"]},"th5_trans1":{"grammar":["gr-pre2-040","gr-pre2-053"],"phrases":["ph-pre1-0452","ph-pre1-0448"]},"th5_trans2":{"grammar":["gr-3-001","gr-3-002"],"phrases":["ph-pre1-0448"]},"th5_trans3":{"grammar":["gr-3-018","gr-3-019"],"phrases":["ph-pre1-0448"]},"th5_recount1":{"grammar":["gr-2-056","gr-pre2-015"]},"th5_recount2":{"grammar":["gr-pre2-015","gr-pre2-039"]},"th5_slot3":{"grammar":["gr-3-039","gr-4-007"]},"th5_recount3":{"grammar":["gr-pre1-032"]},"th5_discharge1":{"grammar":["gr-2-030","gr-2-045"],"phrases":["ph-pre1-0133"]},"th5_discharge2":{"grammar":["gr-2-030","gr-2-045"],"phrases":["ph-pre1-0133"]},"th5_discharge3":{"grammar":["gr-pre1-025"],"phrases":["ph-pre1-0133"]},"th5_phone1":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_phone2":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_slot4":{"grammar":["gr-3-039","gr-4-007"]},"th5_sort2":{"grammar":["gr-3-001","gr-3-027"]},"th5_proviso1":{"grammar":["gr-1-033"],"phrases":["ph-pre1-0448"]},"th5_proviso2":{"grammar":["gr-1-032"]},"th5_proviso3":{"grammar":["gr-1-032"]},"th5_final1":{"grammar":["gr-2-030","gr-pre2-055"]},"th5_final2":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0448"]},"th5_ok1":{"grammar":["gr-pre2-037","gr-3-001"]},"th5_ok2":{"grammar":["gr-2-030","gr-pre2-007"]},"th5_final3":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_ask1":{"grammar":["gr-2-030","gr-pre2-011"]},"th5_final4":{"grammar":["gr-2-030","gr-pre2-011"]},"tt1_sort1":{"grammar":["gr-5-011"],"phrases":["ph-pre2-0269"]},"tt1_check_name":{"grammar":["gr-5-011"]},"tt1_check_fee":{"grammar":["gr-5-011"]},"tt1_check_date":{"phrases":["ph-pre2-0174"]},"tt1_slot":{"grammar":["gr-3-039","gr-4-008"],"phrases":["ph-4-0149"]},"tt1_speech":{"grammar":["gr-3-029","gr-3-039"]},"tt1_phone":{"grammar":["gr-3-019","gr-3-022"]},"tt1_notice":{"grammar":["gr-3-015","gr-3-019"]},"tt1_pad":{"grammar":["gr-3-019"],"phrases":["ph-4-0141","ph-3-0137"]},"tt2_sort1":{"grammar":["gr-3-001","gr-3-027"],"phrases":["ph-2-0316"]},"tt2_check_dob":{"grammar":["gr-3-039"]},"tt2_check_tax":{"grammar":["gr-2-056"]},"tt2_check_addr":{"grammar":["gr-5-011"]},"tt2_check_fee":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"tt2_slot":{"grammar":["gr-3-039"]},"tt2_speech":{"grammar":["gr-pre2-041","gr-3-001"]},"tt2_phone":{"grammar":["gr-3-039"]},"tt2_notice":{"grammar":["gr-pre2-011","gr-pre2-039"]},"tt2_mail":{"grammar":["gr-3-039"]},"tt2_pad":{"grammar":["gr-5-011","gr-5-020"]},"tt2_sort2":{"grammar":["gr-3-027","gr-3-039"],"phrases":["ph-pre2-0269"]},"tt2_pad3":{"grammar":["gr-5-011","gr-5-020"]},"tt3_sort1":{"grammar":["gr-2-045","gr-pre2-047"],"phrases":["ph-pre1-0099"]},"tt3_sort2":{"grammar":["gr-2-043","gr-pre2-012"]},"tt3_check_fee":{"grammar":["gr-3-027","gr-5-011"]},"tt3_check_tax":{"grammar":["gr-2-056"]},"tt3_check_fine":{"grammar":["gr-pre2-037"],"phrases":["ph-2-0272"]},"tt3_check_date":{"grammar":["gr-3-039"]},"tt3_slot1":{"grammar":["gr-3-039","gr-4-007"]},"tt3_slot2":{"grammar":["gr-3-001","gr-3-039"],"phrases":["ph-pre2-0034"]},"tt3_pad1":{"grammar":["gr-5-011","gr-5-016"]},"tt3_pad2":{"grammar":["gr-pre2-012","gr-pre2-056"]},"tt3_speech":{"grammar":["gr-2-066","gr-pre2-012"]},"tt3_phone":{"grammar":["gr-3-019","gr-3-039"]},"tt3_notice":{"grammar":["gr-2-030","gr-2-045"]},"tt3_mail":{"grammar":["gr-2-030","gr-2-043"]},"tt3_rule":{"grammar":["gr-2-030","gr-2-045"]},"tt3_sort3":{"grammar":["gr-pre2-041","gr-pre2-055"],"phrases":["ph-pre1-0099","ph-pre1-0133"]},"tt3_sort4":{"grammar":["gr-pre2-055"]},"tt3_pad3":{"grammar":["gr-3-001","gr-3-031"]},"tt4_sort1":{"grammar":["gr-2-030","gr-2-045"]},"tt4_sort2":{"grammar":["gr-3-002","gr-3-007"],"phrases":["ph-pre1-0099","ph-pre1-0133"]},"tt4_check_appeal":{"grammar":["gr-3-039","gr-5-015"]},"tt4_check_grant":{"grammar":["gr-pre2-014","gr-3-005"]},"tt4_check_nom":{"grammar":["gr-pre1-032"],"phrases":["ph-2-0159"]},"tt4_check_dep":{"grammar":["gr-2-058"]},"tt4_slot1":{"grammar":["gr-3-039","gr-5-011"]},"tt4_slot2":{"grammar":["gr-3-001","gr-3-030"]},"tt4_pad1":{"grammar":["gr-2-030"]},"tt4_pad2":{"grammar":["gr-pre2-055","gr-3-005"]},"tt4_speech":{"grammar":["gr-2-045"]},"tt4_phone":{"grammar":["gr-2-030"]},"tt4_notice":{"grammar":["gr-2-030","gr-2-033"]},"tt4_mail":{"grammar":["gr-2-030"]},"tt4_rule":{"grammar":["gr-1-032","gr-2-030"]},"tt4_sort3":{"grammar":["gr-3-027","gr-5-011"],"phrases":["ph-pre1-0097","ph-pre1-0133"]},"tt4_pad3":{"grammar":["gr-pre2-034","gr-3-019"],"phrases":["ph-pre1-0097"]},"tt5_sort1":{"grammar":["gr-2-043","gr-2-045"]},"tt5_sort2":{"grammar":["gr-3-001","gr-3-027"],"phrases":["ph-pre1-0133"]},"tt5_check_pen":{"grammar":["gr-2-056","gr-3-018"]},"tt5_check_info":{"grammar":["gr-2-058","gr-3-039"]},"tt5_check_app":{"grammar":["gr-3-039","gr-4-011"]},"tt5_check_limit":{"grammar":["gr-2-058","gr-pre2-014"]},"tt5_slot1":{"grammar":["gr-pre2-056","gr-3-019"]},"tt5_slot2":{"grammar":["gr-2-030","gr-pre2-011"]},"tt5_pad1":{"grammar":["gr-3-019","gr-3-031"]},"tt5_pad2":{"grammar":["gr-pre2-015","gr-3-005"]},"tt5_speech":{"grammar":["gr-2-030","gr-pre2-014"]},"tt5_phone":{"grammar":["gr-1-032"]},"tt5_notice":{"grammar":["gr-1-032","gr-pre1-025"]},"tt5_mail":{"grammar":["gr-1-032","gr-pre1-025"]},"tt5_rule":{"grammar":["gr-1-032"]},"tt5_sort3":{"grammar":["gr-2-030","gr-pre2-011"]},"tt5_pad3":{"grammar":["gr-4-026","gr-5-016"]},"qa:speech1:0":{"grammar":["gr-3-039","gr-4-026"]},"qa:speech1:1":{"grammar":["gr-5-011"]},"qa:speech1:2":{"grammar":["gr-3-039"]},"qa:speech1:3":{"grammar":["gr-3-039"],"phrases":["ph-4-0150"]},"qa:speech1:4":{"grammar":["gr-3-019","gr-3-029"]},"qa:speech1:5":{"grammar":["gr-5-011"],"phrases":["ph-4-0130"]},"qa:speech1:6":{"grammar":["gr-3-015","gr-3-039"],"phrases":["ph-4-0150"]},"qa:speech1:7":{"grammar":["gr-4-008"]},"qa:speech1:8":{"grammar":["gr-3-039","gr-pre2-012"],"phrases":["ph-4-0150"]},"qa:phone1:1":{"grammar":["gr-4-008"],"phrases":["ph-4-0140"]},"qa:phone1:2":{"grammar":["gr-3-039"],"phrases":["ph-4-0051"]},"qa:phone1:3":{"grammar":["gr-3-015"],"phrases":["ph-4-0150"]},"qa:phone1:4":{"grammar":["gr-3-022","gr-3-039"]},"qa:phone1:5":{"grammar":["gr-3-019","gr-3-039"],"phrases":["ph-4-0072"]},"qa:phone1:6":{"grammar":["gr-3-015","gr-pre2-012"],"phrases":["ph-4-0150"]},"qa:notice1:0":{"grammar":["gr-3-019","gr-3-031"]},"qa:notice1:1":{"grammar":["gr-4-026"]},"qa:notice1:2":{"grammar":["gr-4-026"]},"qa:notice1:3":{"grammar":["gr-3-029"]},"qa:notice1:4":{"grammar":["gr-5-011","gr-5-013"]},"qa:notice1:5":{"grammar":["gr-3-019","gr-3-039"],"phrases":["ph-4-0075"]},"qa:notice1:6":{"grammar":["gr-4-026"]},"qa:notice1:7":{"grammar":["gr-3-039","gr-4-003"],"phrases":["ph-4-0075"]},"qa:notice1:8":{"grammar":["gr-3-015"],"phrases":["ph-4-0150"]},"qa:notice1:9":{"grammar":["gr-3-029","gr-4-026"]},"qa:notice1:10":{"grammar":["gr-3-039"]},"qa:notice1:11":{"grammar":["gr-3-019","gr-3-031"]},"qa:notice1:12":{"grammar":["gr-3-039"]},"qa:notice1:13":{"grammar":["gr-3-039"]},"qa:notice1:14":{"grammar":["gr-3-027","gr-4-026"]},"qa:notice1:15":{"grammar":["gr-3-039","gr-4-002"]},"qa:notice1:16":{"grammar":["gr-3-029"]},"qa:notice1:17":{"grammar":["gr-3-019","gr-3-039"],"phrases":["ph-4-0075"]},"qa:speech2:0":{"grammar":["gr-pre2-041","gr-3-039"]},"qa:speech2:1":{"grammar":["gr-3-039"]},"qa:speech2:2":{"grammar":["gr-3-010","gr-3-039"]},"qa:speech2:3":{"grammar":["gr-4-003","gr-5-011"]},"qa:speech2:4":{"grammar":["gr-3-001","gr-3-039"]},"qa:speech2:5":{"grammar":["gr-3-039"]},"qa:speech2:6":{"grammar":["gr-3-001","gr-3-029"]},"qa:speech2:7":{"grammar":["gr-4-026"],"phrases":["ph-3-0005"]},"qa:phone2:0":{"grammar":["gr-3-039"],"phrases":["ph-pre2-0397"]},"qa:phone2:1":{"grammar":["gr-3-039"]},"qa:phone2:2":{"grammar":["gr-3-039"],"phrases":["ph-pre2-0312"]},"qa:phone2:3":{"grammar":["gr-3-039"]},"qa:phone2:4":{"grammar":["gr-3-039"]},"qa:phone2:5":{"grammar":["gr-4-026","gr-5-011"]},"qa:notice2:0":{"grammar":["gr-3-039"]},"qa:notice2:1":{"grammar":["gr-3-029"]},"qa:notice2:2":{"grammar":["gr-pre2-011","gr-2-030"]},"qa:notice2:3":{"grammar":["gr-5-013"]},"qa:notice2:4":{"grammar":["gr-3-019","gr-3-031"]},"qa:notice2:5":{"grammar":["gr-4-019","gr-5-013"]},"qa:notice2:6":{"grammar":["gr-4-026"]},"qa:notice2:7":{"grammar":["gr-3-039"]},"qa:notice2:8":{"grammar":["gr-4-026","gr-5-013"]},"qa:notice2:9":{"grammar":["gr-3-039"]},"qa:notice2:10":{"grammar":["gr-pre2-011","gr-2-030"]},"qa:notice2:11":{"grammar":["gr-3-007","gr-3-027"]},"qa:notice2:12":{"grammar":["gr-pre2-011","gr-2-030"]},"qa:notice2:13":{"grammar":["gr-pre2-039","gr-3-039"]},"qa:notice2:14":{"grammar":["gr-3-039"]},"qa:notice2:15":{"grammar":["gr-pre2-011","gr-3-039"],"phrases":["ph-3-0119"]},"qa:notice2:16":{"grammar":["gr-3-015","gr-3-039"]},"qa:notice2:17":{"grammar":["gr-pre2-011","gr-2-030"]},"qa:notice2:18":{"grammar":["gr-3-039"]},"qa:notice2:19":{"grammar":["gr-3-027"]},"qa:notice2:20":{"grammar":["gr-3-039"]},"qa:notice2:21":{"grammar":["gr-3-039"],"phrases":["ph-2-0245"]},"qa:notice2:22":{"grammar":["gr-2-045","gr-3-039"]},"qa:notice2:23":{"grammar":["gr-5-020"]},"qa:notice2:24":{"grammar":["gr-3-027"]},"qa:notice2:26":{"grammar":["gr-2-030","gr-3-005"],"phrases":["ph-pre2-0189"]},"qa:notice2:27":{"grammar":["gr-5-013"]},"qa:notice2:28":{"grammar":["gr-3-039"]},"qa:notice2:29":{"grammar":["gr-2-030","gr-3-005"]},"qa:mail2:0":{"grammar":["gr-3-039"]},"qa:mail2:1":{"grammar":["gr-3-039"]},"qa:mail2:2":{"grammar":["gr-3-039"]},"qa:mail2:3":{"grammar":["gr-3-039"]},"qa:mail2:4":{"grammar":["gr-3-039"]},"qa:mail2:5":{"grammar":["gr-3-039"],"phrases":["ph-pre2-0373"]},"qa:speech3:0":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre2-0111"]},"qa:speech3:1":{"grammar":["gr-2-030","gr-pre2-037"],"phrases":["ph-2-0495"]},"qa:speech3:2":{"grammar":["gr-3-007","gr-3-018"]},"qa:speech3:3":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:speech3:4":{"grammar":["gr-2-066"],"phrases":["ph-2-0049"]},"qa:speech3:5":{"grammar":["gr-2-030"],"phrases":["ph-pre2-0056"]},"qa:speech3:6":{"grammar":["gr-2-030"]},"qa:speech3:7":{"grammar":["gr-4-026","gr-5-011"]},"qa:speech3:8":{"grammar":["gr-2-030","gr-pre2-056"]},"qa:speech3:9":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:phone3:0":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:1":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:2":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:3":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:4":{"grammar":["gr-3-019","gr-3-039"]},"qa:phone3:5":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:6":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:phone3:7":{"grammar":["gr-3-039","gr-4-002"]},"qa:notice3:0":{"grammar":["gr-3-019","gr-3-021"],"phrases":["ph-pre1-0133"]},"qa:notice3:1":{"grammar":["gr-pre2-037"],"phrases":["ph-2-0272"]},"qa:notice3:2":{"grammar":["gr-3-018","gr-3-019"],"phrases":["ph-pre1-0448"]},"qa:notice3:3":{"grammar":["gr-3-039","gr-4-026"]},"qa:notice3:4":{"grammar":["gr-3-019","gr-3-039"]},"qa:notice3:5":{"grammar":["gr-pre1-018"],"phrases":["ph-2-0154"]},"qa:notice3:6":{"grammar":["gr-4-014","gr-4-019"]},"qa:notice3:7":{"grammar":["gr-3-005","gr-3-018"]},"qa:notice3:8":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0507"]},"qa:notice3:9":{"grammar":["gr-2-045","gr-pre1-025"]},"qa:notice3:10":{"grammar":["gr-3-039","gr-4-002"],"phrases":["ph-pre1-0502"]},"qa:notice3:11":{"grammar":["gr-pre2-039"]},"qa:notice3:12":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:13":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:14":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:15":{"grammar":["gr-pre2-011"],"phrases":["ph-2-0299"]},"qa:notice3:16":{"grammar":["gr-3-027","gr-3-039"],"phrases":["ph-pre2-0276"]},"qa:notice3:17":{"grammar":["gr-3-027","gr-3-039"]},"qa:notice3:18":{"grammar":["gr-3-001","gr-3-039"]},"qa:notice3:19":{"grammar":["gr-2-030","gr-pre2-013"]},"qa:notice3:20":{"grammar":["gr-2-030"]},"qa:notice3:21":{"grammar":["gr-pre2-015"]},"qa:notice3:22":{"grammar":["gr-4-014"]},"qa:notice3:23":{"grammar":["gr-2-030"]},"qa:notice3:24":{"grammar":["gr-2-056","gr-pre2-012"]},"qa:notice3:25":{"grammar":["gr-3-027","gr-3-039"]},"qa:notice3:26":{"grammar":["gr-5-013"]},"qa:notice3:27":{"grammar":["gr-2-030"]},"qa:mail3:0":{"grammar":["gr-3-006","gr-3-019"]},"qa:mail3:1":{"grammar":["gr-3-039","gr-4-007"],"phrases":["ph-pre2-0373"]},"qa:mail3:2":{"grammar":["gr-2-043"]},"qa:mail3:3":{"grammar":["gr-2-030"]},"qa:mail3:4":{"grammar":["gr-pre2-037","gr-pre2-053"],"phrases":["ph-2-0272"]},"qa:mail3:5":{"grammar":["gr-3-039","gr-5-015"]},"qa:mail3:6":{"grammar":["gr-pre2-056"]},"qa:mail3:7":{"grammar":["gr-3-039","gr-4-002"],"phrases":["ph-pre2-0331"]},"qa:mail3:8":{"grammar":["gr-3-001","gr-3-019"],"phrases":["ph-pre2-0289"]},"qa:mail3:9":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0507","ph-pre2-0331"]},"qa:mail3:10":{"grammar":["gr-3-039","gr-4-002"],"phrases":["ph-pre1-0133"]},"qa:mail3:11":{"grammar":["gr-pre2-048"]},"qa:rule3:0":{"grammar":["gr-3-001","gr-3-002"]},"qa:rule3:1":{"grammar":["gr-2-045","gr-pre2-041"]},"qa:rule3:2":{"grammar":["gr-pre2-040","gr-pre2-056"]},"qa:rule3:3":{"grammar":["gr-pre2-041"]},"qa:rule3:4":{"grammar":["gr-2-056"]},"qa:rule3:5":{"grammar":["gr-pre2-011"]},"qa:rule3:6":{"grammar":["gr-pre2-015"],"phrases":["ph-pre2-0351"]},"qa:rule3:7":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:rule3:8":{"grammar":["gr-pre2-015"],"phrases":["ph-2-0152"]},"qa:rule3:9":{"grammar":["gr-pre2-056"]},"qa:rule3:10":{"grammar":["gr-3-007","gr-3-027"]},"qa:rule3:11":{"grammar":["gr-pre2-011"],"phrases":["ph-pre2-0157","ph-pre1-0133"]},"qa:rule3:12":{"grammar":["gr-pre2-053"],"phrases":["ph-2-0152","ph-pre1-0099"]},"qa:rule3:13":{"grammar":["gr-pre2-041"]},"qa:rule3:14":{"grammar":["gr-3-007","gr-3-027"],"phrases":["ph-pre1-0133"]},"qa:rule3:15":{"grammar":["gr-3-007","gr-3-039"],"phrases":["ph-2-0152"]},"qa:speech4:0":{"grammar":["gr-3-005","gr-3-007"],"phrases":["ph-2-0272"]},"qa:speech4:1":{"grammar":["gr-3-001","gr-3-039"]},"qa:speech4:2":{"grammar":["gr-pre2-012","gr-3-001"]},"qa:speech4:3":{"grammar":["gr-2-030"]},"qa:speech4:4":{"grammar":["gr-pre2-014","gr-pre2-048"],"phrases":["ph-pre1-0133"]},"qa:speech4:5":{"grammar":["gr-2-030"]},"qa:speech4:6":{"grammar":["gr-2-030"]},"qa:speech4:7":{"grammar":["gr-2-030"],"phrases":["ph-2-0194","ph-pre1-0448"]},"qa:speech4:8":{"grammar":["gr-2-045"]},"qa:speech4:9":{"grammar":["gr-2-030"]},"qa:phone4:0":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone4:1":{"grammar":["gr-pre2-055","gr-pre2-065"]},"qa:phone4:2":{"grammar":["gr-pre2-055","gr-3-005"]},"qa:phone4:3":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone4:4":{"grammar":["gr-2-030"]},"qa:phone4:5":{"grammar":["gr-3-039","gr-4-003"]},"qa:phone4:6":{"grammar":["gr-pre2-038","gr-3-002"]},"qa:phone4:7":{"grammar":["gr-pre2-053","gr-pre2-065"],"phrases":["ph-2-0194"]},"qa:notice4:0":{"grammar":["gr-2-030"]},"qa:notice4:1":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0448"]},"qa:notice4:2":{"grammar":["gr-2-030"]},"qa:notice4:3":{"grammar":["gr-3-018","gr-3-019"],"phrases":["ph-pre1-0448"]},"qa:notice4:4":{"grammar":["gr-2-030"]},"qa:notice4:5":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133"]},"qa:notice4:6":{"grammar":["gr-pre2-037","gr-3-039"],"phrases":["ph-pre1-0100"]},"qa:notice4:7":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0448"]},"qa:notice4:8":{"grammar":["gr-pre1-025"]},"qa:notice4:9":{"grammar":["gr-2-056"]},"qa:notice4:10":{"grammar":["gr-2-030"]},"qa:notice4:11":{"grammar":["gr-2-030"]},"qa:notice4:12":{"grammar":["gr-3-019","gr-3-022"]},"qa:notice4:13":{"grammar":["gr-pre2-065","gr-3-001"]},"qa:notice4:14":{"grammar":["gr-3-027","gr-3-039"]},"qa:notice4:15":{"grammar":["gr-2-045"]},"qa:notice4:16":{"grammar":["gr-2-030"]},"qa:notice4:17":{"grammar":["gr-2-030"]},"qa:notice4:18":{"grammar":["gr-2-030"]},"qa:notice4:19":{"grammar":["gr-pre2-013","gr-3-027"]},"qa:notice4:20":{"grammar":["gr-2-030"]},"qa:notice4:21":{"grammar":["gr-3-039","gr-4-006"]},"qa:notice4:22":{"grammar":["gr-pre2-015","gr-3-019"]},"qa:notice4:23":{"grammar":["gr-2-030"]},"qa:notice4:24":{"grammar":["gr-2-030"]},"qa:notice4:25":{"grammar":["gr-3-019","gr-3-031"]},"qa:notice4:26":{"grammar":["gr-2-033"]},"qa:notice4:27":{"grammar":["gr-2-033"],"phrases":["ph-pre1-0146"]},"qa:notice4:28":{"grammar":["gr-3-039","gr-4-003"]},"qa:notice4:29":{"grammar":["gr-2-030","gr-2-045"]},"qa:mail4:0":{"grammar":["gr-2-030"],"phrases":["ph-2-0245"]},"qa:mail4:1":{"grammar":["gr-2-030"]},"qa:mail4:2":{"grammar":["gr-pre2-053","gr-3-001"]},"qa:mail4:3":{"grammar":["gr-2-020"],"phrases":["ph-2-0194","ph-pre1-0100"]},"qa:mail4:4":{"grammar":["gr-3-001","gr-3-003"]},"qa:mail4:5":{"grammar":["gr-pre2-015","gr-3-005"]},"qa:mail4:6":{"grammar":["gr-2-030"],"phrases":["ph-pre1-0133","ph-pre1-0448"]},"qa:mail4:7":{"grammar":["gr-pre2-011","gr-pre2-015"],"phrases":["ph-2-0194"]},"qa:mail4:8":{"grammar":["gr-pre2-014","gr-pre2-015"]},"qa:mail4:9":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"qa:mail4:10":{"grammar":["gr-pre2-014","gr-pre2-053"]},"qa:mail4:11":{"grammar":["gr-pre2-053","gr-3-001"]},"qa:rule4:0":{"grammar":["gr-2-030"]},"qa:rule4:1":{"grammar":["gr-pre2-041","gr-3-039"]},"qa:rule4:2":{"grammar":["gr-pre2-010","gr-pre2-011"]},"qa:rule4:3":{"grammar":["gr-2-030"]},"qa:rule4:4":{"grammar":["gr-pre2-011","gr-3-001"],"phrases":["ph-2-0194"]},"qa:rule4:5":{"grammar":["gr-3-030","gr-3-039"],"phrases":["ph-pre1-0133"]},"qa:rule4:6":{"grammar":["gr-3-001","gr-3-018"],"phrases":["ph-1-0321","ph-2-0194"]},"qa:rule4:7":{"grammar":["gr-3-019","gr-3-031"]},"qa:rule4:8":{"grammar":["gr-1-032"],"phrases":["ph-2-0152"]},"qa:rule4:9":{"grammar":["gr-2-056"]},"qa:rule4:10":{"grammar":["gr-1-032"],"phrases":["ph-2-0152"]},"qa:rule4:11":{"grammar":["gr-3-019","gr-3-039"]},"qa:rule4:12":{"grammar":["gr-pre2-014","gr-3-007"]},"qa:rule4:13":{"grammar":["gr-2-030"]},"qa:speech5:0":{"grammar":["gr-2-030","gr-pre2-014"]},"qa:speech5:1":{"grammar":["gr-2-056","gr-pre2-037"]},"qa:speech5:2":{"grammar":["gr-2-030","gr-2-056"]},"qa:speech5:3":{"grammar":["gr-2-030","gr-pre2-041"]},"qa:speech5:4":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:speech5:5":{"grammar":["gr-3-001","gr-3-005"]},"qa:speech5:6":{"grammar":["gr-2-030","gr-2-056"],"phrases":["ph-pre1-0146"]},"qa:speech5:7":{"grammar":["gr-pre2-037","gr-pre2-065"],"phrases":["ph-1-0102"]},"qa:phone5:0":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:phone5:1":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:phone5:2":{"grammar":["gr-1-032"],"phrases":["ph-pre1-0448"]},"qa:phone5:3":{"grammar":["gr-2-045","gr-pre2-037"]},"qa:phone5:4":{"grammar":["gr-2-056","gr-pre2-015"]},"qa:phone5:5":{"grammar":["gr-pre2-053","gr-3-019"]},"qa:phone5:6":{"grammar":["gr-2-030","gr-3-005"]},"qa:phone5:7":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone5:8":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:phone5:9":{"grammar":["gr-2-030","gr-pre2-065"]},"qa:notice5:0":{"grammar":["gr-pre2-037","gr-pre2-053"]},"qa:notice5:1":{"grammar":["gr-2-056","gr-pre2-012"]},"qa:notice5:2":{"grammar":["gr-2-020","gr-2-043"]},"qa:notice5:3":{"grammar":["gr-2-030","gr-2-056"]},"qa:notice5:4":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice5:5":{"grammar":["gr-pre2-037","gr-pre2-041"],"phrases":["ph-pre1-0422"]},"qa:notice5:6":{"grammar":["gr-2-056","gr-pre2-015"]},"qa:notice5:7":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice5:8":{"grammar":["gr-2-003","gr-2-030"]},"qa:notice5:9":{"grammar":["gr-2-056","gr-3-039"]},"qa:notice5:10":{"grammar":["gr-pre1-025"]},"qa:notice5:11":{"grammar":["gr-2-056","gr-3-005"],"phrases":["ph-1-0557"]},"qa:notice5:12":{"grammar":["gr-pre2-041","gr-3-006"]},"qa:notice5:13":{"grammar":["gr-pre2-015","gr-3-002"],"phrases":["ph-pre1-0448"]},"qa:notice5:14":{"grammar":["gr-pre2-014","gr-3-007"]},"qa:notice5:15":{"grammar":["gr-2-030","gr-2-045"]},"qa:notice5:16":{"grammar":["gr-1-032"]},"qa:notice5:17":{"grammar":["gr-3-007","gr-3-039"]},"qa:notice5:18":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice5:19":{"grammar":["gr-pre2-037","gr-pre2-053"]},"qa:notice5:20":{"grammar":["gr-pre2-048","gr-3-039"]},"qa:notice5:21":{"grammar":["gr-pre2-055","gr-3-001"]},"qa:notice5:22":{"grammar":["gr-3-001","gr-3-039"],"phrases":["ph-1-0311"]},"qa:notice5:23":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice5:24":{"grammar":["gr-5-013"]},"qa:notice5:25":{"grammar":["gr-pre2-037","gr-3-019"]},"qa:mail5:0":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:mail5:1":{"grammar":["gr-2-056","gr-3-005"]},"qa:mail5:2":{"grammar":["gr-pre2-015","gr-3-007"]},"qa:mail5:3":{"grammar":["gr-pre2-037","gr-pre2-055"],"phrases":["ph-pre1-0448"]},"qa:mail5:4":{"grammar":["gr-pre1-025"]},"qa:mail5:5":{"grammar":["gr-2-030","gr-pre2-056"]},"qa:mail5:6":{"grammar":["gr-1-032"]},"qa:mail5:7":{"grammar":["gr-2-020","gr-2-030"]},"qa:mail5:8":{"grammar":["gr-pre2-037","gr-3-039"]},"qa:mail5:9":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:mail5:10":{"grammar":["gr-3-001","gr-3-018"]},"qa:mail5:11":{"grammar":["gr-pre2-056","gr-3-027"]},"qa:rule5:0":{"grammar":["gr-pre2-056","gr-3-001"],"phrases":["ph-pre1-0452","ph-pre1-0448"]},"qa:rule5:1":{"grammar":["gr-3-001","gr-3-002"]},"qa:rule5:2":{"grammar":["gr-2-045","gr-pre2-037"]},"qa:rule5:3":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0448"]},"qa:rule5:4":{"grammar":["gr-1-032"]},"qa:rule5:5":{"grammar":["gr-2-030","gr-pre2-007"]},"qa:rule5:6":{"grammar":["gr-2-030","gr-2-056"]},"qa:rule5:7":{"grammar":["gr-3-039","gr-4-008"]},"qa:rule5:8":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:rule5:9":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:rule5:10":{"grammar":["gr-1-032"],"phrases":["ph-pre1-0100"]},"qa:rule5:11":{"grammar":["gr-pre2-015","gr-pre2-037"]},"qa:rule5:12":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:rule5:13":{"grammar":["gr-2-056","gr-3-007"]},"qa:rule5:14":{"grammar":["gr-2-003","gr-pre2-037"]},"qa:rule5:15":{"grammar":["gr-3-039","gr-4-003"]}};
// <<END:TAGS>>

// <<GEN:FORMS>>
const EXTRA_FORMS: Record<string, string[]> = {"house":["houses","housing"],"collect":["collected"],"in_end":["ended"],"friday":["fridays"],"old":["older"],"fine":["fines","fined"],"fill":["filled"],"receive":["receives","receiving"],"apply":["applied","applying"],"own":["owns"],"home":["homes"],"in_month":["month's","months'"],"week":["weeks'"],"vote":["voting"],"in_saturday":["saturdays"],"complain":["complaining","complains"],"begin":["begins","begun"],"inspection":["inspections"],"in_hear":["hearings"],"tuesday":["tuesdays"],"thursday":["thursdays"],"station":["stations"],"proposal":["proposals"],"deadline":["deadlines"],"in_explain":["explaining"],"in_owner":["owner's"],"list":["listed"],"ask":["asking"],"paint":["painted","painting"],"request":["requested"],"show":["shown"],"rise":["rises","rising"],"attend":["attended"],"morning":["mornings"],"address":["addresses"],"candidate":["candidates"],"report":["reported","reports"],"force":["forced"],"agree":["agrees"],"floor":["floors"],"clean":["cleaning"],"file":["filed"],"start":["starting"],"wednesday":["wednesdays"],"monday":["mondays"],"wife":["wife's"],"declare":["declared"],"neighbour":["neighbours"],"fall":["falls"],"in_third":["thirds"],"stop":["stopping"],"teacher":["teachers"],"large":["larger"],"in_aunt":["aunt's"],"father":["father's"],"sell":["sold"],"submit":["submitted"],"excuse":["excused","excuses"],"in_double":["doubled"],"decide":["deciding"],"mother":["mother's"],"except":["excepted"],"face":["faced"],"door":["doors"]};
// <<END:FORMS>>

// <<GEN:LEX>>
const LEX_SRC = `
# jth2_001 | 役場の住居（3級）
apartment|noun||アパート||th_apartment
garage|noun|garages|車庫||th_garage
garbage|noun||ごみ||th_garbage
trash|noun||くず（ごみ箱の中身）||th_trash
# jth2_002 | 役場の社会 ①（3級）
biscuit|noun||ビスケット（英）||th_biscuit
citizen|noun|citizens|市民||th_citizen
collection|noun||収集||th_collection
lily|noun||ユリ||th_lily
# jth2_003 | 役場の社会 ②（3級）
permit|verb|permits|許可する||th_permit
population|noun||人口||th_population
registry|noun||登録簿||th_registry
town hall|noun|town halls|町役場||th_town_hall
# jth3_004 | 役場の住居 ①（準2級）
brick|noun|bricks|れんが||th_brick
bulb|noun||電球||th_bulb
construction|noun||建設||th_construction
drain|noun||排水管||th_drain
dust|noun||ちり||th_dust
# jth3_005 | 役場の住居 ②（準2級）
electricity|noun||電気||th_electricity
fence|noun|fences|柵||th_fence
furniture|noun||家具||th_furniture
gym|noun||ジム||th_gym
# jth3_006 | 役場の住居 ③（準2級）
heating|noun||暖房||th_heating
mill|noun||製粉所||th_mill
mine|pron||私のもの||th_mine
pipe|noun|pipes|管||th_pipe
rich|adj||裕福な||th_rich
# jth3_007 | 役場の住居 ④（準2級）
staircase|noun||階段（全体）||th_staircase
statue|noun||像||th_statue
theater|noun||劇場||th_theater
tower|noun||塔||th_tower
# jth3_008 | 役場の自然（準2級）
crossing|noun||横断||th_crossing
fountain|noun||噴水||th_fountain
mud|noun||泥||th_mud
pond|noun||池||th_pond
# jth3_009 | 役場のことば ①（準2級）
cemetery|noun||共同墓地||th_cemetery
hole|noun||穴||th_hole
muddy|adj||泥をかぶった||th_muddy
square|adj||正方形の||th_square
# jth3_010 | 役場のことば ②（準2級）
instalment|noun|instalments|分割払いの1回分||th_instalment
security|noun||安全||th_security
playground|noun||遊び場||th_playground
# jth3_011 | 役場の社会（準2級）
administration|noun||行政||th_administration
center|noun||中心||th_center
district|noun|districts|地区||th_district
kindergarten|noun||幼稚園||th_kindergarten
# jth3_012 | 役場の交通（準2級）
lane|noun||車線||th_lane
meter|noun|meters|メートル||th_meter
sidewalk|noun||歩道||th_sidewalk
# jth4_013 | 役場の様子を表すことば ①（2級）
above|adv||上に||th_above
below|adv||下に||th_below
disabled|adj||身体障害の不具の||th_disabled
# jth4_014 | 役場の様子を表すことば ②（2級）
following|adj||次の||th_following
nowhere|adv||どこにも～ない||th_nowhere
sincerely|adv||心から||th_sincerely
# jth4_015 | 役場の財務（2級）
accountant|noun||会計士||th_accountant
assess|verb|assessed|評価する||th_assess
enterprise|noun|enterprises|事業||th_enterprise
taxpayer|noun|taxpayers|納税者||th_taxpayer
transaction|noun||取引||th_transaction
# jth4_016 | 役場の住居 ①（2級）
architect|noun||建築家||th_architect
builder|noun||建築業者||th_builder
demolish|verb|demolished|取り壊す||th_demolish
developer|noun||開発者||th_developer
fridge|noun|fridges|冷蔵庫||th_fridge
# jth4_017 | 役場の住居 ②（2級）
landlord|noun||家主||th_landlord
residential|adj||住宅の||th_residential
rid|verb||取り除く（get rid of）||th_rid
shelter|noun||避難所||th_shelter
# jth4_018 | 役場の人事 ①（2級）
applicant|noun|applicants|応募者||th_applicant
booking|noun||予約||th_booking
electrician|noun||電気技師||th_electrician
# jth4_019 | 役場の人事 ②（2級）
plumber|noun||配管工||th_plumber
reference|noun||参照||th_reference
vacancy|noun||空室||th_vacancy
# jth4_020 | 役場の法律（2級）
citizenship|noun||市民権||th_citizenship
contractor|noun||請負業者||th_contractor
identify|verb||特定する||th_identify
refusal|noun||拒否||th_refusal
vendor|noun||売る人||th_vendor
# jth4_021 | 役場のお金（2級）
allowance|noun||手当||th_allowance
deduction|noun||控除||th_deduction
earn|verb|earns|稼ぐ||th_earn
# jth4_022 | 役場のことば ①（2級）
bar|noun|bars|バー||th_bar
hostel|noun||ホステル||th_hostel
stream|noun||小川||th_stream
division|noun||分割||th_division
# jth4_023 | 役場のことば ②（2級）
executive|adj||経営の||th_executive
berth|noun||停泊所||th_berth
pier|noun||船着き場||th_pier
itself|pron||それ自体||th_itself
# jth4_024 | 役場のことば ③（2級）
somebody|pron||だれか（ある人）||th_somebody
development|noun||発展||th_development
proxy|noun||代理||th_proxy
# jth4_025 | 役場の社会 ①（2級）
accuracy|noun||正確さ||th_accuracy
banker|noun||銀行家||th_banker
boundary|noun||境界線||th_boundary
dig|noun|dug|掘ること||th_dig
# jth4_026 | 役場の社会 ②（2級）
foreign|adj||外国の||th_foreign
gardener|noun||植木屋||th_gardener
height|noun||高さ||th_height
identification|noun||身分証明書||th_identification
# jth4_027 | 役場の社会 ③（2級）
immigrant|noun||移民||th_immigrant
inhabitant|noun||住民||th_inhabitant
newcomer|noun||新人||th_newcomer
pensioner|noun||年金受給者||th_pensioner
# jth4_028 | 役場の社会 ④（2級）
queue|noun||列||th_queue
respect|noun||尊敬||th_respect
stallholder|noun||露店の店主||th_stallholder
subsidy|noun||補助金||th_subsidy
# jth4_029 | 役場の社会 ⑤（2級）
tenant|noun|tenant's|入居者||th_tenant
unemployed|adj||失業中の||th_unemployed
urban|adj||都市の||th_urban
veteran|noun||ベテラン||th_veteran
# jth5_030 | 役場の財務（準1級）
compensate|verb||補償する||th_compensate
revenue|noun||収益||th_revenue
surplus|noun||余剰||th_surplus
# jth5_031 | 役場の住居（準1級）
kerb|noun||縁石||th_kerb
mortgage|noun||抵当||th_mortgage
residence|noun||住宅||th_residence
# jth5_032 | 役場の法律 ①（準1級）
anybody|pron||だれか（疑問・否定で）||th_anybody
centimeter|noun|centimeters|センチメートル||th_centimeter
deed|noun||行為||th_deed
disturb|verb|disturbs|邪魔をする||th_disturb
enact|verb|enacted|制定する||th_enact
# jth5_033 | 役場の法律 ②（準1級）
enforce|verb|enforced|施行する||th_enforce
forbid|verb|forbids|禁じる||th_forbid
guarantee|noun||保証||th_guarantee
harvest|noun||収穫||th_harvest
# jth5_034 | 役場の法律 ③（準1級）
hesitate|verb||ためらう||th_hesitate
inherit|verb|inherited,inherits|相続する||th_inherit
legitimate|adj||合法的な||th_legitimate
nominate|verb||指名する||th_nominate
# jth5_035 | 役場の法律 ④（準1級）
obey|verb||従う||th_obey
obligation|noun||義務||th_obligation
obtain|verb||手に入れる||th_obtain
ordinance|noun|ordinances|条例||th_ordinance
# jth5_036 | 役場の法律 ⑤（準1級）
patrol|noun||巡回||th_patrol
pool|noun||プール||th_pool
prohibit|verb|prohibits|禁止する||th_prohibit
provision|noun||供給||th_provision
# jth5_037 | 役場の法律 ⑥（準1級）
regulate|verb|regulates|規制する||th_regulate
trustee|noun|trustees|受託者||th_trustee
violate|verb|violated,violates,violating|違反する||th_violate
whatever|det||どんな～でも||th_whatever
# jth5_038 | 役場のことば ①（準1級）
donation|noun||寄付||th_donation
nomination|noun|nominations|指名||th_nomination
pavement|noun||舗装||th_pavement
purpose|noun|purposes|目的||th_purpose
# jth5_039 | 役場のことば ②（準1級）
along|adv||一緒に||th_along
faithfully|adv||忠実に||th_faithfully
disability|noun||障害||th_disability
colleague|noun|colleagues|同僚||th_colleague
# jth5_040 | 役場のことば ③（準1級）
succeed|verb|succeeds|成功する||th_succeed
oak|noun||オーク||th_oak
trunk|noun||幹||th_trunk
van|noun|vans|バン||th_van
# jth5_041 | 役場のオフィス（準1級）
dispose|verb|disposed|処分する||th_dispose
documentation|noun||文書化||th_documentation
exception|noun|exceptions|例外||th_exception
guideline|noun|guidelines|ガイドライン||th_guideline
# jth5_042 | 役場の社会 ①（準1級）
administrator|noun||管理者||th_administrator
census|noun||国勢調査||th_census
chamber|noun||部屋||th_chamber
civic|adj||市民の||th_civic
# jth5_043 | 役場の社会 ②（準1級）
demonstration|noun||実演||th_demonstration
heritage|noun||遺産||th_heritage
minority|noun||少数||th_minority
municipal|adj||市の||th_municipal
# jth5_044 | 役場の社会 ③（準1級）
municipality|noun||自治体||th_municipality
parade|noun||行進||th_parade
utility|noun||公共料金||th_utility
welfare|noun||幸福||th_welfare
# jth6_045 | 役場の様子を表すことば ①（1級）
easy|adj||簡単な||th_easy
exceptional|adj||例外的な||th_exceptional
involved|adj||複雑な||th_involved
otherwise|adv||さもなければ||th_otherwise
precisely|adv||正確に||th_precisely
# jth6_046 | 役場の様子を表すことば ②（1級）
satisfied|adj||満足した||th_satisfied
tenth|adj||10分の1の||th_tenth
unsafe|adj||危険な||th_unsafe
whenever|adv||いったいいつ||th_whenever
# jth6_047 | 役場の財務（1級）
arrears|noun||滞納金||th_arrears
collateral|adj||付随的な||th_collateral
default|noun||債務不履行||th_default
monopoly|noun||独占||th_monopoly
offset|verb|offsets|相殺する||th_offset
# jth6_048 | 役場の住居（1級）
barn|noun||納家||th_barn
gas|noun||ガス||th_gas
sewage|noun||下水||th_sewage
temporary|adj||一時的な||th_temporary
# jth6_049 | 役場の法律 ①（1級）
abatement|noun||軽減||th_abatement
abolish|verb|abolished|廃止する||th_abolish
aged|adj||～歳の||th_aged
arbitration|noun||仲裁||th_arbitration
# jth6_050 | 役場の法律 ②（1級）
comply|verb|complies|従う||th_comply
concession|noun|concessions|譲歩||th_concession
corruption|noun||汚職||th_corruption
decree|noun||法令||th_decree
# jth6_051 | 役場の法律 ③（1級）
display|noun|displayed|展示||th_display
forgive|verb||許す||th_forgive
heir|noun|heirs|相続人||th_heir
injunction|noun||差止め命令||th_injunction
# jth6_052 | 役場の法律 ④（1級）
investigation|noun||調査||th_investigation
jurisdiction|noun||管轄権||th_jurisdiction
levy|verb||課す||th_levy
litigation|noun||訴訟||th_litigation
# jth6_053 | 役場の法律 ⑤（1級）
mediation|noun||調停||th_mediation
narrow|adj||狭い||th_narrow
offense|noun||違反||th_offense
punish|verb|punished|罰する||th_punish
# jth6_054 | 役場の法律 ⑥（1級）
regulation|noun|regulations|規則||th_regulation
remedy|noun|remedies|治療法||th_remedy
repeal|verb|repealed|廃止する||th_repeal
spoilt|adj||（投票用紙が）無効になった||th_spoilt
# jth6_055 | 役場の法律 ⑦（1級）
statute|noun||法令||th_statute
violation|noun||違反||th_violation
void|adj||無効の||th_void
workshop|noun||作業場||th_workshop
# jth6_056 | 役場の製造（1級）
cannery|noun||缶詰工場||th_cannery
produce|verb|produced|生産する||th_produce
storage|noun||保管||th_storage
# jth6_057 | 役場のことば ①（1級）
annex|noun||別館||th_annex
bundle|noun||束||th_bundle
drainage|noun||排水||th_drainage
heap|noun||山||th_heap
# jth6_058 | 役場のことば ②（1級）
holder|noun||保有者||th_holder
width|noun||幅||th_width
condemn|verb|condemned|非難する||th_condemn
paragraph|noun||段落||th_paragraph
# jth6_059 | 役場のことば ③（1級）
absence|noun|absences|欠席||th_absence
tenure|noun||在職期間||th_tenure
speaker|noun||話す人||th_speaker
liter|noun||リットル||th_liter
# jth6_060 | 役場のことば ④（1級）
milligram|noun|milligrams|ミリグラム||th_milligram
considering|conj||〜を考えると||th_considering
everybody|pron||みんな||th_everybody
microphone|noun|microphones|マイクロフォン||th_microphone
# jth6_061 | 役場のことば ⑤（1級）
setting|noun||設定||th_setting
charter|verb||チャーターする||th_charter
pothole|noun|potholes|道路の穴||th_pothole
count|verb|counted,counting|数える||th_count
# jth6_062 | 役場のオフィス（1級）
absent|adj||欠席の||th_absent
coordinate|verb|coordinates|調整する||th_coordinate
coordination|noun||調整||th_coordination
formal|adj||正式な||th_formal
# jth6_063 | 役場の社会 ①（1級）
appoint|verb|appointed|任命する||th_appoint
constituent|noun||構成要素||th_constituent
elect|verb|elected|選挙で選ぶ||th_elect
firefighter|noun|firefighters|消防士||th_firefighter
# jth6_064 | 役場の社会 ②（1級）
observer|noun|observers|観察者||th_observer
ratepayer|noun|ratepayers|（地方税の）納税者||th_ratepayer
successor|noun||後任者||th_successor
# jth2_065 | 役場のことば（3級）
nearly|adv||ほとんど||th_nearly
kilometer|noun|kilometers|キロメートル||th_kilometer
parking|noun||駐車||th_parking
`;
// <<END:LEX>>

const POS: Record<string, JobLexEntry['pos']> = { noun: 'noun', verb: 'verb', adj: 'adj', adv: 'adv', prep: 'prep', conj: 'conj', pron: 'pron', det: 'det', interj: 'interj' };

/** The compact word table: `# pageId | 検証ページの見出し` opens a page; `text|pos|forms|gloss|emoji|id` is a word. */
function lex(src: string): { entries: JobLexEntry[]; pages: VerificationPage[] } {
  const entries: JobLexEntry[] = [];
  const pages: VerificationPage[] = [];
  let group = '';
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      const [id, labelJa] = line.slice(1).split('|').map((s) => s.trim());
      pages.push({ id, labelJa });
      group = id;
      continue;
    }
    const [text, pos, forms, gloss, emoji, id] = line.split('|').map((s) => s.trim());
    entries.push({
      id: id || text.toLowerCase().replace(/[^a-z]+/g, '_'),
      text,
      pos: POS[pos] ?? 'noun',
      group,
      ...(forms ? { forms: forms.split(',').map((s) => s.trim()) } : {}),
      ...(gloss ? { gloss } : {}),
      ...(emoji ? { emoji } : {}),
    });
  }
  return { entries, pages };
}

// ---------------------------------------------------------------------------- authoring kit

interface Meta {
  grammar?: string[];
  phrases?: string[];
  features?: TaskFeature[];
}
type Tags = Record<string, { grammar?: string[]; phrases?: string[] }>;

const hash = (s: string): number => {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
/** The right reply plus the wrong ones, put in a fixed order that depends on the id. */
function slips(id: string, right: string, wrong: string[]): { options: string[]; answer: number } {
  const all = [right, ...wrong];
  const k = hash(id) % all.length;
  const options = [...all.slice(k), ...all.slice(0, k)].reverse();
  return { options, answer: options.indexOf(right) };
}
/** Sequence numbers within a rank: authored tasks are served in the order they are written. */
const SEQ: Record<number, number> = {};
const sq = (id: string, rank: number): number => SEQMAP[id] ?? 1000 + (SEQ[rank] = (SEQ[rank] ?? 0) + 1);
const slug = (label: string): string => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const meta = (id: string, m: Meta): Pick<AuthoredTask, 'grammar' | 'phrases' | 'features'> => {
  const t = TAGS[id];
  const grammar = m.grammar ?? t?.grammar;
  const phrases = m.phrases ?? t?.phrases;
  return { ...(grammar?.length ? { grammar } : {}), ...(phrases?.length ? { phrases } : {}), ...(m.features ? { features: m.features } : {}) };
};

/** A paper with labelled lines: rows are `Label|Value` (the field id comes from the label). */
const P = (kind: CheckDoc['kind'], title: string, rows: string[]): CheckDoc => ({
  kind,
  title,
  fields: rows.map((r) => {
    const i = r.indexOf('|');
    const label = r.slice(0, i);
    return { id: slug(label), label, value: r.slice(i + 1) };
  }),
});
/** A paper written out in lines (a notice, a rule, a letter). */
const N = (title: string, lines: string[], kind: CheckDoc['kind'] = 'note'): CheckDoc => ({ kind, title, lines });

/** check: the person says what they want; the first paper is the one to check; `wrong` = the label of the line that disagrees. */
function check(id: string, rank: number, person: string, say: string, docs: CheckDoc[], wrong: string | null, m: Meta & { fix?: [string, string]; target?: number } = {}): AuthoredTask {
  const target = m.target ?? 0;
  let fix: { fix: string; fixOptions: string[] } | undefined;
  if (m.fix && wrong) {
    const shown = docs[target].fields?.find((f) => f.id === slug(wrong))?.value ?? '';
    const o = slips(id, m.fix[0], [shown, m.fix[1]]);
    fix = { fix: m.fix[0], fixOptions: o.options };
  }
  return { id, rank, seq: sq(id, rank), arch: 'check', person, say, docs, target, wrong: wrong ? slug(wrong) : null, ...(fix ?? {}), ...meta(id, m) };
}
/** respond (choose): a spoken question; `right` is the one good reply. */
function ask(id: string, rank: number, person: string, q: string, right: string, wrong: string[], m: Meta = {}): AuthoredTask {
  return { id, rank, seq: sq(id, rank), arch: 'respond', person, say: q, mode: 'choose', msg: { kind: 'speech', lines: [q] }, ...slips(id, right, wrong), ...meta(id, m) };
}
/** respond (choose): a letter / e-mail / call / notice with lines; `say` is what is said at the counter (a call: the words heard). */
function msg(id: string, rank: number, person: string, kind: 'letter' | 'email' | 'phone' | 'memo', head: { from?: string; subject?: string; say?: string }, lines: string[], right: string, wrong: string[], m: Meta = {}): AuthoredTask {
  return {
    id, rank, seq: sq(id, rank), arch: 'respond', person, say: head.say ?? (kind === 'phone' ? lines.join(' ') : ''), mode: 'choose',
    msg: { kind, ...(head.from ? { from: head.from } : {}), ...(head.subject ? { subject: head.subject } : {}), lines },
    ...slips(id, right, wrong), ...meta(id, m),
  };
}
/** respond (form): the message pad; each field is [id, label, right, wrong[]]. */
function pad(id: string, rank: number, person: string, lines: string[], fields: [string, string, string, string[]][], m: Meta & { say?: string } = {}): AuthoredTask {
  return {
    id, rank, seq: sq(id, rank), arch: 'respond', person, say: m.say ?? lines.join(' '), mode: 'form',
    msg: { kind: 'phone', lines },
    fields: fields.map(([fid, label, answer, others]) => ({ id: fid, label, options: slips(`${id}:${fid}`, answer, others).options, answer })),
    ...meta(id, m),
  };
}
/** sort: items are [text, bin]. */
function sort(id: string, rank: number, say: string, bins: string[], items: [string, string][], m: Meta = {}): AuthoredTask {
  return { id, rank, seq: sq(id, rank), arch: 'sort', say, bins, items: items.map(([text, bin], i) => ({ id: `i${i + 1}`, text, bin })), ...meta(id, m) };
}
interface Axis { id: string; label: string; tags?: string[] }
/** slot: the one free cell that fits the wishes (`want` tags) and avoids the `avoid` tags; the other fitting cells are busy. */
function slot(id: string, rank: number, person: string, kind: 'speech' | 'letter' | 'email' | 'phone', lines: string[], rows: Axis[], cols: Axis[], want: string[], avoid: string[], answer: string, busyNames: string[], m: Meta & { say?: string; from?: string; extraBusy?: string[]; layout?: 'calendar' | 'rooms' } = {}): AuthoredTask {
  let bi = 0;
  const cells: RespondSlotCell[] = rows.flatMap((r) =>
    cols.map((c) => {
      const cid = `${r.id}-${c.id}`;
      const tags = [r.id, c.id, ...(r.tags ?? []), ...(c.tags ?? [])];
      const fits = want.every((t) => tags.includes(t)) && !avoid.some((t) => tags.includes(t));
      const busy = cid !== answer && (fits || (m.extraBusy ?? []).includes(cid));
      return { id: cid, row: r.id, col: c.id, tags, ...(busy ? { busy: busyNames[bi++ % busyNames.length] } : {}) };
    }),
  );
  return {
    id, rank, seq: sq(id, rank), arch: 'respond', person, say: m.say ?? (kind === 'speech' || kind === 'phone' ? lines.join(' ') : ''), mode: 'slot',
    msg: { kind, ...(m.from ? { from: m.from } : {}), lines },
    slot: { layout: m.layout ?? 'calendar', rows: rows.map(({ id: i, label }) => ({ id: i, label })), cols: cols.map(({ id: i, label }) => ({ id: i, label })), cells, answer },
    ...meta(id, m),
  };
}
/** A reply-bank item with its two near misses. */
const qa = (q: string, a: string, fn: string, rank: number, near: string[]): QaItem => ({ q, a, fn, rank, near });
const withBankTags = (bank: string, items: QaItem[]): QaItem[] =>
  items.map((q, i) => {
    const t = TAGS[`qa:${bank}:${i}`];
    return t ? { ...q, ...(t.grammar?.length ? { grammar: t.grammar } : {}), ...(t.phrases?.length ? { phrases: t.phrases } : {}) } : q;
  });
const withTemplateTags = (ts: TaskTemplate[]): TaskTemplate[] =>
  ts.map((t) => {
    const g = TAGS[t.id];
    return g ? { ...t, ...(t.grammar ? {} : g.grammar?.length ? { grammar: g.grammar } : {}), ...(t.phrases ? {} : g.phrases?.length ? { phrases: g.phrases } : {}) } : t;
  });

// ---------------------------------------------------------------------------- axes for the booking tasks

const DAYS: Axis[] = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
];
const TIMES: Axis[] = [
  { id: 't9', label: '9:00', tags: ['morning'] },
  { id: 't11', label: '11:00', tags: ['morning'] },
  { id: 't2', label: '2:00', tags: ['afternoon'] },
  { id: 't4', label: '4:00', tags: ['afternoon'] },
];
/** Later ranks: half-hour times. */
const TIMES2: Axis[] = [
  { id: 't9', label: '9:30', tags: ['morning'] },
  { id: 't11', label: '11:00', tags: ['morning'] },
  { id: 't1', label: '1:30', tags: ['afternoon'] },
  { id: 't3', label: '3:00', tags: ['afternoon'] },
];
/** The hearing room, the committee room and the council chamber (rank 4–5 bookings). */
const ROOMS: Axis[] = [
  { id: 'r1', label: 'Room 1', tags: ['small'] },
  { id: 'r2', label: 'Room 2', tags: ['small'] },
  { id: 'chamber', label: 'Council chamber', tags: ['large'] },
];
const OFFICERS = ['{Mr. Hollis|@}', '{Ms. Aldridge|@}', '{Mr. Farrow|@}', '{Ms. Okafor|@}', 'Lunch', 'Away'];

// ---------------------------------------------------------------------------- rank 1 (英検3級 · TOEIC 〜500)
// The first weeks at the counter: forms on the right desks, a name or an address that differs, opening hours and fees from a
// notice, a time to see someone, a message by the telephone.

const R1: AuthoredTask[] = [
  sort('th1_desks1', 1, 'Good morning. Please put the papers on the right desks.', ['license', 'tax', 'housing'], [['A form for a dog license', 'license'], ['A form to pay tax', 'tax'], ['A form for a new apartment', 'housing']]),
  check('th1_dog', 1, 'c_merchant', 'I want a license for my dog. Is my form right?', [P('card', 'Form', ['Name|{Mr. Grant|@}', 'Address|12 Bridge Street', 'Dog|Biscuit']), P('card', '{ID|@} card', ['Name|{Mr. Grant|@}', 'Address|21 Bridge Street'])], 'Address'),
  msg('th1_hours', 1, 'c_cook', 'memo', { say: 'Is the town hall open on Saturday?' }, ['Town Hall', 'Monday to Friday: 9 to 5', 'Saturday and Sunday: closed'], 'No, we are closed on Saturday.', ['Yes, we are open from nine to five.', 'Yes, but only in the morning.']),
  check('th1_ok1', 1, 'c_baker', 'Here is my form for a dog license. Please look at it.', [P('card', 'Form', ['Name|{Mrs. Hill|@}', 'Address|5 Harbour Street', 'Dog|Pepper']), P('card', '{ID|@} card', ['Name|{Mrs. Hill|@}', 'Address|5 Harbour Street'])], null),
  sort('th1_desks2', 1, 'Now these papers, please. Look at what each one asks for.', ['registry', 'waste', 'license'], [['The birth of a new baby', 'registry'], ['The garbage was not collected', 'waste'], ['A permit to park my car', 'license']]),
  slot('th1_slot1', 1, 'c_grandma', 'speech', ['I need to see someone about my apartment.', 'I can come on Tuesday.'], DAYS.slice(0, 3), TIMES.slice(0, 3), ['tue'], [], 'tue-t11', OFFICERS, {}),
  msg('th1_fee', 1, 'c_sailor', 'memo', { say: 'How much is a parking permit?' }, ['Fees', 'Dog license: $12', 'Parking permit: $20'], 'It is twenty dollars.', ['It is thirty dollars.', 'It is twelve dollars.']),
  check('th1_receipt', 1, 'c_docker', 'I paid for my dog license today. Is the fee on my receipt right?', [P('invoice', 'Receipt', ['Item|Dog license', 'Fee|$21']), N('Fee list', ['Dog license: $12', 'Parking permit: $20'])], 'Fee'),
  pad('th1_pad1', 1, 'p_hollis', ['Hello, this is {Mr. Grant|@}.', 'I want a dog license.', 'Please call me back after lunch.'], [
    ['who', 'Caller', '{Mr. Grant|@}', ['{Big Joe|@}', '{Captain Reed|@}']],
    ['want', 'About', 'a dog license', ['a parking permit', 'a new apartment']],
    ['call', 'Call back', 'after lunch', ['before lunch', 'tomorrow']],
  ], { say: 'The telephone is ringing. Please write down the message.' }),
  sort('th1_desks3', 1, 'Four more. Please read each one before you put it down.', ['housing', 'tax', 'registry', 'waste'], [['The rent of my apartment is too high', 'housing'], ['I want to pay my tax at the bank', 'tax'], ['We moved to a new address', 'registry'], ['Please take away our old chairs', 'waste']]),
  check('th1_date', 1, 'c_mom', 'I need a permit for the market on Saturday. Please check the date.', [P('card', 'Form', ['Name|{Anna|@}', 'Date|June 3']), P('card', 'Permit', ['Name|{Anna|@}', 'Date|June 13'])], 'Date'),
  msg('th1_garbage', 1, 'c_oldman', 'memo', { say: 'When is the garbage collected?' }, ['Garbage collection', 'Tuesday and Friday', 'Put your bags outside before 8:00'], 'On Tuesday and Friday, before eight.', ['On Monday and Thursday, before eight.', 'On Tuesday and Friday, after eight in the evening.']),
  slot('th1_slot2', 1, 'c_cook', 'speech', ['Please book a time for me.', 'I can only come in the afternoon.', 'I cannot come on Monday.'], DAYS.slice(0, 4), TIMES, ['afternoon'], ['mon'], 'wed-t2', OFFICERS, {}),
  msg('th1_desk', 1, 'c_boy', 'memo', { say: 'My father wants a dog license. Which desk is it?' }, ['Housing: Desk 1', 'Licenses: Desk 2', 'Taxes: Desk 3'], 'Please go to Desk 2.', ['Please go to Desk 1.', 'Please go to Desk 3.']),
  check('th1_birth', 1, 'c_mom', 'We have a new baby. Is the birthday on this form right?', [P('card', 'Birth form', ['Baby|Lily', 'Mother|{Anna|@}', 'Birthday|June 5']), P('card', 'Hospital paper', ['Baby|Lily', 'Mother|{Anna|@}', 'Birthday|June 6'])], 'Birthday'),
  ask('th1_ask1', 1, 'c_student', 'Where do I pay the fee?', 'At the desk next to the door.', ['At nine in the morning.', 'It is twelve dollars.']),
  pad('th1_pad2', 1, 'p_hollis', ['Good morning. This is {Mrs. Hill|@}.', 'The garbage was not collected today.', 'My address is 5 Harbour Street.'], [
    ['who', 'Caller', '{Mrs. Hill|@}', ['{Grandma Rose|@}', '{Nora|@}']],
    ['problem', 'Problem', 'the garbage', ['the water', 'the lamp']],
    ['address', 'Address', '5 Harbour Street', ['15 Harbour Street', '5 Bridge Street']],
  ], { say: 'Another call. Please write down the message.' }),
  msg('th1_closed', 1, 'p_aldridge', 'memo', { say: 'Can I come on Monday, May 5?' }, ['Notice', 'The town hall is closed on Monday, May 5.', 'We open again on Tuesday.'], 'No, we are closed on that day. Please come on Tuesday.', ['Yes, please come on Monday at nine.', 'No, we are closed on Tuesday.']),
  sort('th1_desks4', 1, 'Please read the names, too. Each paper goes to one desk.', ['license', 'housing', 'tax', 'waste'], [['{Nora|@} wants a permit for her shop', 'license'], ['{Big Joe|@} has a problem with his roof', 'housing'], ['{Mr. Grant|@} wants to pay his tax', 'tax'], ['There is garbage near the harbour', 'waste']]),
  slot('th1_slot3', 1, 'c_scholar', 'speech', ['I want to see someone at 11:00.', 'I cannot come on Friday.'], DAYS, TIMES, ['t11'], ['fri'], 'tue-t11', OFFICERS, { extraBusy: ['thu-t11'] }),
  ask('th1_ask2', 1, 'c_girl', 'Can I have a form, please?', 'Sure. Here you are.', ['At the desk next to the window.', 'Yes, we are closed on Sunday.']),
  check('th1_ok2', 1, 'c_sailor', 'This is my receipt for the permit. It is $20. Is everything right?', [P('invoice', 'Receipt', ['Item|Parking permit', 'Fee|$20']), N('Fee list', ['Dog license: $12', 'Parking permit: $20'])], null),
  ask('th1_ask3', 1, 'c_oldman', 'Thank you for your help.', 'You are welcome. Come again.', ['It is on the first floor.', 'Please write your name here.']),
];

// ---------------------------------------------------------------------------- rank 2 (英検準2級 · TOEIC 〜600)
// Applications and what they need: proof, dates, fees, deadlines; notices read and answered; two wishes for a time.

const R2: AuthoredTask[] = [
  sort('th2_desks1', 2, 'Please sort these papers. Read each one first.', ['license', 'roads', 'housing', 'waste'], [['A form for a parking permit', 'license'], ['A hole in the road near the school', 'roads'], ['We need someone to check the roof of our house', 'housing'], ['Please take away our old chairs on Friday', 'waste']]),
  check('th2_dob', 2, 'c_student', 'I want a new card. Please check my date of birth against my passport.', [P('card', 'Form', ['Name|{Ken|@}', 'Date of birth|June 9', 'Address|7 Bridge Street']), P('card', 'Passport', ['Name|{Ken|@}', 'Date of birth|June 19'])], 'Date of birth'),
  msg('th2_road', 2, 'c_merchant', 'memo', { say: 'Can I take my car on Harbour Road on Tuesday?' }, ['Notice', 'Harbour Road will be closed from Monday to Wednesday for new water pipes.', 'Please use Bridge Street.'], 'No, the road is closed on Tuesday. Please use Bridge Street.', ['Yes, but only after five in the evening.', 'No, Bridge Street is closed for new water pipes.']),
  check('th2_valid', 2, 'c_baker', 'I got my dog license last June. Is the day it ends right?', [P('card', 'License', ['Name|{Mrs. Hill|@}', 'Started|June 3', 'Ends|December 3']), N('Rule', ['A dog license is valid for one year.'])], 'Ends'),
  slot('th2_slot1', 2, 'c_student', 'speech', ['I need to see {Ms. Aldridge|@} about the rent.', 'I can come on Wednesday or Thursday, but not in the morning.'], DAYS.slice(1, 5), TIMES, ['afternoon'], ['tue'], 'wed-t2', OFFICERS, {}),
  msg('th2_renew', 2, 'c_sailor', 'memo', { say: 'My parking permit ended last week. How much must I pay to renew it?' }, ['Parking permits', 'A permit costs $20 and is valid for one year.', 'A late renewal costs $5 more.'], 'You must pay $25, because it is late.', ['You must pay $20, because it is not late.', 'You must pay $5, because it is late.']),
  sort('th2_desks2', 2, 'Four papers from the box. Each one belongs on one desk.', ['registry', 'tax', 'planning', 'elections'], [['I want to register to vote in the harbour election', 'elections'], ['My tax bill is higher than last year', 'tax'], ['We have moved, and I must change my address', 'registry'], ['I want to build a small garage next to my house', 'planning']]),
  check('th2_tax', 2, 'c_docker', 'I paid my tax yesterday. Please check my receipt against the bill.', [P('invoice', 'Receipt', ['Name|{Big Joe|@}', 'Amount|$180', 'Date|May 12']), P('invoice', 'Tax bill', ['Name|{Big Joe|@}', 'Amount|$810', 'Date|May 12'])], 'Amount'),
  msg('th2_hours', 2, 'c_grandma', 'memo', { say: 'What time do you close on Friday?' }, ['Notice', 'From June 1, the town hall opens at 8:30.', 'On Fridays it closes at 4:30.'], 'We close at 4:30 on Fridays.', ['We close at 5:00 on Fridays.', 'We close at 8:30 on Fridays.']),
  pad('th2_pad1', 2, 'p_hollis', ['Hello, this is {Mr. Grant|@}.', 'I want to apply for a market permit.', 'Please send the form to my office.'], [
    ['who', 'Caller', '{Mr. Grant|@}', ['{Captain Reed|@}', '{Professor Hale|@}']],
    ['about', 'About', 'a market permit', ['a parking permit', 'a tax bill']],
    ['send', 'Send the form to', 'his office', ['his house', 'the bank']],
  ], { say: 'The telephone again. Please write the message for me.' }),
  check('th2_addr', 2, 'c_oldman', 'I live in a new house now. Please check the address on my resident card.', [P('card', 'Resident card', ['Name|{Grandpa Sam|@}', 'Address|9 Station Road']), P('card', 'Moving form', ['Name|{Grandpa Sam|@}', 'Address|19 Station Road'])], 'Address'),
  msg('th2_letter1', 2, 'p_hollis', 'email', { from: '{Nora|@}', subject: 'My permit', say: 'An email came for the counter. Please read it and answer it.' }, ['Dear Sir,', 'I paid $20 for my parking permit on Monday.', 'Please confirm that I can collect it on Friday.', 'Best wishes, {Nora|@}'], 'Yes, you can collect your permit on Friday.', ['Yes, you can collect your permit on Monday.', 'Yes, please pay $20 when you collect it on Friday.']),
  slot('th2_slot2', 2, 'c_cook', 'speech', ['I need to show my shop to {Mr. Farrow|@}.', 'The morning is best for me.', 'I am not free on Wednesday.'], DAYS, TIMES, ['morning'], ['wed'], 'thu-t9', OFFICERS, {}),
  msg('th2_ask1', 2, 'c_mom', 'memo', { say: 'I need a copy of my birth certificate. Where can I get it?' }, ['Desks', 'Registry: births and certificates', 'Housing: rent and roofs', 'Taxes: bills and receipts'], 'You can get it at the registry.', ['You can get it at the housing desk.', 'You can get it at the tax desk.']),
  msg('th2_notice2', 2, 'c_merchant', 'memo', { say: 'Can I play loud music in my shop at ten on Sunday morning?' }, ['Noise rule', 'No loud music before 9:00 or after 10:00 at night.', 'On Sunday, no loud music before 11:00.'], 'No. On Sunday you must wait until eleven.', ['Yes. Loud music is fine after nine.', 'Yes. Loud music is fine until midnight.']),
  sort('th2_desks3', 2, 'The last papers of the day. Please read the names.', ['license', 'tax', 'roads', 'planning', 'elections'], [['{Mr. Grant|@} wants to change the name on his license', 'license'], ['{Nora|@} is late with her tax', 'tax'], ['{Big Joe|@} wants to close a street for a party', 'roads'], ['{Mrs. Hill|@} wants to put a sign on her shop', 'planning'], ['{Anna|@} is going to vote', 'elections']]),
  check('th2_ok1', 2, 'c_scholar', 'I am here for my library tax. Is everything on this bill right?', [P('invoice', 'Bill', ['Name|{Professor Hale|@}', 'Amount|$40', 'Pay by|June 30']), P('card', 'Notice', ['Name|{Professor Hale|@}', 'Amount|$40', 'Pay by|June 30'])], null),
  msg('th2_phone1', 2, 'p_aldridge', 'phone', { say: '{Mr. Grant|@} is on the telephone. Please listen and choose the answer.' }, ['Hello, this is {Mr. Grant|@}.', 'I have an appointment on Tuesday, but I cannot come.', 'Can I come on Thursday instead?'], 'Yes. I will move your appointment to Thursday.', ['Yes. I will move your appointment to Wednesday.', 'No. Your appointment is on Thursday already.']),
  slot('th2_slot3', 2, 'c_merchant', 'speech', ['Please book a time for a meeting with {Mr. Farrow|@}.', 'We need it in the afternoon.', 'We want Tuesday or Thursday.'], DAYS.slice(0, 4), TIMES, ['afternoon'], ['mon', 'wed'], 'thu-t4', OFFICERS, { extraBusy: [] }),
  check('th2_fee', 2, 'c_sailor', 'I paid for a permit for my boat. Is the fee on my receipt the same as on your list?', [P('invoice', 'Receipt', ['Item|Boat permit', 'Fee|$45']), P('card', 'Fee list', ['Item|Boat permit', 'Fee|$54'])], 'Fee'),
  msg('th2_rule2', 2, 'c_girl', 'memo', { say: 'I am sixteen. Can I vote in the election?' }, ['Election', 'People who are 18 or older can vote.', 'The election is on October 12.'], 'No, you must be eighteen or older.', ['Yes, you can vote on October 12.', 'No, the election is on October 18.']),
  ask('th2_ask2', 2, 'c_student', 'I lost my receipt. What should I do?', 'Please fill in this form, and we will make a new one.', ['You must pay the tax by the end of the month.', 'It is on the second floor, next to the window.']),
  pad('th2_pad2', 2, 'p_hollis', ['Good evening, this is {Mrs. Hill|@}.', 'There is a hole in the road near my shop.', 'Please send someone to look at it tomorrow.'], [
    ['who', 'Caller', '{Mrs. Hill|@}', ['{Grandma Rose|@}', '{Anna|@}']],
    ['problem', 'Problem', 'a hole in the road', ['a broken lamp', 'a loud noise']],
    ['when', 'Come', 'tomorrow', ['today', 'on Friday']],
  ], { say: 'The telephone is ringing. Please write the message down.' }),
];

// ---------------------------------------------------------------------------- rank 3 (英検2級 · TOEIC 〜730)
// By-laws and their conditions: stall permits, the property tax, the rent subsidy, the election, waste and noise rules.
// Papers side by side with the value to write in, heard-only calls, hearings and inspections booked into one free slot.

const STALL = N('Market permits', ['A permit is valid for 12 months.', 'The first stall costs $60, and each extra stall costs $40.', 'Applicants who have unpaid fines will be refused.']);
const TAXRULE = N('Property tax', ['The tax is 2 percent of the assessed value.', 'It can be paid in two instalments, by March 31 and by September 30.', 'Anyone who pays all of it by March 31 receives a discount of 3 percent.']);
const SUBSIDY = N('Rent subsidy', ['A household can apply for a rent subsidy if its income is below $24,000 a year and it has lived in the town for at least two years.', 'Residents over 65 do not need to have lived here for two years.', 'Owners of another property are not eligible.']);

/** The lines of a memo: its title, then its rules. */
const L = (d: CheckDoc): string[] => [d.title ?? '', ...(d.lines ?? [])];

const R3: AuthoredTask[] = [
  msg('th3_stall1', 3, 'c_cook', 'memo', { say: 'I would like two stalls at the Saturday market. How much will the permit cost?' }, L(STALL), 'It will cost $100 for the two stalls.', ['It will cost $120 for the two stalls.', 'It will cost $60, and the second stall is free.']),
  check('th3_stall2', 3, 'c_cook', 'I have filled in the application for my two stalls. Could you check the fee before I pay?', [P('invoice', 'Application', ['Name|{Nora|@}', 'Stalls|2', 'Fee|$120']), STALL], 'Fee', { fix: ['$100', '$80'] }),
  sort('th3_sort1', 3, 'The market papers are here. Please put each one on the right desk.', ['license', 'tax', 'roads', 'complaints'], [['A request for a stall permit for the spring market', 'license'], ['A letter from a stallholder who wants to pay the fee in two instalments', 'tax'], ['A request to close Harbour Road on market days', 'roads'], ['A complaint that a stall was in front of a shop door', 'complaints']]),
  msg('th3_stall3', 3, 'p_hollis', 'email', { from: '{Mr. Grant|@}', subject: 'My stall permit', say: 'A man with a stall has written to us. Please read the email and answer it.' }, ['Dear Sir,', 'My permit ends on June 30, and I want to renew it for another year.', 'I have not paid any fines, and I will pay the fee of $60 this week.', 'Could you confirm that I can keep my stall?'], 'Yes. You can renew your permit, because you have no unpaid fines.', ['Yes. You can renew your permit, but you must pay the fines first.', 'No. We cannot renew your permit, because the fee is $40.']),
  check('th3_ok1', 3, 'c_baker', 'I have my permit and my receipt here. Is everything in order?', [P('card', 'Permit', ['Name|{Mrs. Hill|@}', 'Stalls|1', 'Valid until|June 30']), P('invoice', 'Receipt', ['Name|{Mrs. Hill|@}', 'Stalls|1', 'Fee|$60']), STALL], null),
  msg('th3_ask1', 3, 'c_sailor', 'memo', { say: 'I was wondering whether I could pay the property tax in two instalments.' }, L(TAXRULE), 'Yes. The first part is due by March 31, and the second part by September 30.', ['Yes. Both parts are due by March 31.', 'No. The tax must be paid in one part.']),
  msg('th3_tax1', 3, 'c_docker', 'memo', { say: 'My house is assessed at $50,000. How much tax must I pay if I pay it all by March 31?' }, L(TAXRULE), 'You will pay $970, because you receive the 3 percent discount.', ['You will pay $1,000, because there is no discount.', 'You will pay $980, because you receive the 2 percent discount.']),
  check('th3_tax2', 3, 'c_docker', 'I received this tax bill. My house is assessed at $50,000, and I will pay in two instalments. Is each part right?', [P('invoice', 'Tax bill', ['Name|{Big Joe|@}', 'Assessed value|$50,000', 'Tax|$1,000', 'Each part|$600']), TAXRULE], 'Each part', { fix: ['$500', '$300'] }),
  pad('th3_pad1', 3, 'p_hollis', ['Good morning. This is {Ms. Okafor|@} from the tax office.', 'The bill for Harbour Street is ready.', 'Please send the letters on Thursday.'], [
    ['who', 'Caller', '{Ms. Okafor|@}', ['{Ms. Aldridge|@}', '{Mr. Farrow|@}']],
    ['about', 'About', 'the bill for Harbour Street', ['the bill for Bridge Street', 'the permit for Harbour Street']],
    ['send', 'Send the letters', 'on Thursday', ['on Tuesday', 'on Friday']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Listen carefully, please, and write the message.' }),
  msg('th3_tax3', 3, 'p_hollis', 'letter', { from: '{Professor Hale|@}', say: 'A resident has written to us. Please read the letter and answer it.' }, ['Dear {Ms. Okafor|@},', 'I paid the first part of my property tax on March 20.', 'Must I also pay the second part by March 31?'], 'The second part is not due until September 30, so you do not have to pay it by March 31.', ['The second part is due on March 31, so you must pay it now.', 'You do not have to pay the second part, because you paid the first part on March 20.']),
  slot('th3_slot1', 3, 'c_merchant', 'speech', ['I would like to see {Ms. Okafor|@} about my tax.', 'I cannot come in the morning, and I am away on Wednesday.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['wed'], 'thu-t3', OFFICERS, {}),
  check('th3_income1', 3, 'c_student', 'I am applying for a rent subsidy. Is my income the same on my form and on my tax paper?', [P('card', 'Form', ['Name|{Ken|@}', 'Household|2', 'Income|$21,000']), P('card', 'Tax paper', ['Name|{Ken|@}', 'Income|$12,000'])], 'Income', { fix: ['$12,000', '$13,000'] }),
  msg('th3_income2', 3, 'c_oldman', 'memo', { say: 'I am 72. Can I get a rent subsidy?' }, ['Rent subsidy', 'Residents over 65 can apply.', 'Residents under 65 must have lived here for two years.'], 'Yes. Residents over 65 can apply.', ['No. Only residents under 65 can apply.', 'Yes. But you must have lived here for two years.']),
  msg('th3_subsidy1', 3, 'c_student', 'memo', { say: 'I live with my mother. Our income is $20,000 a year, and we have lived here for four years. Can we apply for a rent subsidy?' }, L(SUBSIDY), 'Yes. Your income is below $24,000, and you have lived here for more than two years.', ['No. Your income is above $24,000, so you are not eligible.', 'Yes, but you must wait two more years.']),
  msg('th3_subsidy2', 3, 'c_oldman', 'memo', { say: 'I am 72, and I moved to the town last month. My income is $15,000. Am I eligible?' }, L(SUBSIDY), 'Yes. Residents over 65 do not need to have lived here for two years.', ['No. You must have lived here for at least two years.', 'No. Residents over 65 cannot apply for a rent subsidy.']),
  check('th3_subsidy3', 3, 'c_student', 'I have filled in the form for the rent subsidy. Please check my years in the town.', [P('card', 'Form', ['Name|{Ken|@}', 'Income|$21,000', 'Years in the town|1']), P('card', 'Resident record', ['Name|{Ken|@}', 'Income|$21,000', 'Years in the town|3']), SUBSIDY], 'Years in the town', { fix: ['3', '2'] }),
  msg('th3_subsidy4', 3, 'p_aldridge', 'memo', { say: '{Mrs. Hill|@} owns a small shop and rents a flat. Her income is $18,000, and she has lived here all her life. Can she get the subsidy?' }, [...L(SUBSIDY), 'A shop is a property.'], 'No. She owns another property, so she is not eligible.', ['Yes. Her income is below $24,000, and she has lived here for more than two years.', 'No. Her income is above $24,000.']),
  sort('th3_sort2', 3, 'These papers are all about housing, but each one is for a different desk. Please read them with care.', ['housing', 'tax', 'registry', 'complaints'], [['A tenant says that the landlord has not repaired the heating', 'complaints'], ['A request for a rent subsidy for a household of four', 'housing'], ['A new tenant wants to register his address', 'registry'], ['The owner of a flat wants to know when the property tax is due', 'tax']]),
  msg('th3_ask2', 3, 'c_mom', 'memo', { say: 'My landlord says that he will raise the rent next week. Is that allowed?' }, ['Rented homes', 'A landlord must give three months\' notice before he raises the rent.'], 'No. He must give you three months\' notice first.', ['Yes. A landlord can raise the rent at any time.', 'No. He must give you three weeks\' notice first.']),
  slot('th3_slot2', 3, 'c_grandma', 'speech', ['{Mr. Farrow|@} must inspect the heating in my flat.', 'Please book a time in the morning, and not on Monday.'], DAYS, TIMES2, ['morning'], ['mon'], 'tue-t9', OFFICERS, { extraBusy: ['fri-t11'] }),
  check('th3_repair', 3, 'c_mom', 'The inspector wrote this report about my flat, and I think the date of his visit is wrong. Can you check it?', [P('note', 'Report', ['Name|{Anna|@}', 'Visit|March 8', 'Repair before|April 8']), P('letter', 'Letter', ['Name|{Anna|@}', 'Visit|March 18', 'Repair before|April 8'])], 'Visit', { fix: ['March 18', 'March 28'] }),
  msg('th3_election1', 3, 'c_girl', 'memo', { say: 'I will be eighteen on October 1. Can I vote in the election on October 12?' }, ['Harbour council election', 'The election will be held on October 12.', 'Residents who are 18 or older on election day can vote.', 'You must register by September 14.'], 'Yes, but you must register by September 14.', ['No. You must be eighteen on September 14.', 'Yes, and you can register on October 12.']),
  msg('th3_election2', 3, 'c_scholar', 'memo', { say: 'I will be abroad on election day. Is there any way for me to vote?' }, ['Voting by proxy', 'A resident who is ill or abroad on election day may ask someone else to vote for him.', 'The form must be at the town hall by October 5.'], 'Yes. You can ask someone else to vote for you, but your form must be here by October 5.', ['Yes. You can vote at the town hall on October 5.', 'No. Only residents who are ill can vote by proxy.']),
  check('th3_election3', 3, 'c_boy', 'My sister filled in this form to register to vote. Is her address the same as on her {ID|@} card?', [P('card', 'Form', ['Name|{Lily|@}', 'Address|14 Mill Lane', 'Date of birth|May 3']), P('card', '{ID|@} card', ['Name|{Lily|@}', 'Address|41 Mill Lane', 'Date of birth|May 3'])], 'Address', { fix: ['41 Mill Lane', '14 Mill Road'] }),
  pad('th3_pad2', 3, 'p_hollis', ['Hello. This is {Mr. Farrow|@}.', 'The inspection of the school roof is on Monday at ten.', 'Please tell the head teacher.'], [
    ['who', 'Caller', '{Mr. Farrow|@}', ['{Mr. Hollis|@}', '{Ms. Okafor|@}']],
    ['what', 'What', 'the inspection of the school roof', ['the inspection of the school kitchen', 'the meeting at the school']],
    ['when', 'When', 'Monday at ten', ['Monday at two', 'Friday at ten']],
  ], { features: ['audioOnly'], say: 'Another call. Listen carefully, please, and write the message.' }),
  msg('th3_waste1', 3, 'c_oldman', 'memo', { say: 'I have an old fridge. How do I get rid of it?' }, ['Large items', 'Large items such as fridges are collected only if you book a collection at least 7 days before.', 'Each item costs $10.'], 'You must book a collection at least a week before, and it will cost $10.', ['You can put it outside on Tuesday, and it will be free.', 'You must book a collection, and it will cost $10 a day.']),
  check('th3_waste2', 3, 'c_baker', 'I booked the collection of two old chairs. Is the total on this slip right?', [P('invoice', 'Slip', ['Name|{Mrs. Hill|@}', 'Items|2', 'Total|$10']), N('Large items', ['Each item costs $10.'])], 'Total', { fix: ['$20', '$30'] }),
  msg('th3_noise1', 3, 'c_merchant', 'memo', { say: 'My builder wants to start at seven on Saturday morning. Is that allowed?' }, ['Building work', 'Work is allowed from 8:00 to 18:00 on weekdays and from 9:00 to 13:00 on Saturdays.', 'No building work is allowed on Sundays.'], 'No. On Saturdays building work cannot start before nine.', ['Yes. Work is allowed from eight on Saturdays.', 'No. Work is allowed only on Sundays.']),
  msg('th3_ask3', 3, 'c_girl', 'memo', { say: 'When should I put my glass bottles and paper outside?' }, ['Collection days', 'Garbage: Tuesday and Friday', 'Recycling (glass bottles and paper): Thursday'], 'Please put them outside on Thursday, which is the day for recycling.', ['Please put them outside on Tuesday, which is the day for recycling.', 'Please put them outside on Friday, which is the day for garbage.']),
  sort('th3_sort3', 3, 'A busy morning. Each of these papers belongs to a different desk.', ['waste', 'roads', 'planning', 'elections'], [['A request for the collection of a broken fridge', 'waste'], ['A complaint about a street lamp that does not work', 'roads'], ['A plan to build a second floor on a house', 'planning'], ['A form to register as a voter', 'elections']]),
  msg('th3_noise2', 3, 'p_hollis', 'email', { from: '{Mrs. Hill|@}', subject: 'Noise at night', say: 'A neighbour is complaining about noise. Please read the email and answer it.' }, ['Dear Sir,', 'The bar next to my shop plays loud music until midnight on weekdays.', 'I have not been able to sleep for two weeks.', 'What can I do?'], 'Please send us a written complaint. An officer will visit the bar and speak to the owner.', ['Please close your shop. An officer will visit you and speak to the owner.', 'Please send us a written complaint. The bar can play loud music until midnight.']),
  slot('th3_slot3', 3, 'c_cook', 'speech', ['I want to ask {Mr. Farrow|@} about my stall.', 'I am free on Tuesday or Thursday, but only in the afternoon.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'wed'], 'tue-t1', OFFICERS, {}),
  msg('th3_ask4', 3, 'c_student', 'memo', { say: 'I lost my permit. Must I pay for a new one?' }, ['Lost permits', 'If you lose your permit, please fill in a form.', 'A new permit is free if the old one was lost, but it costs $10 if the old one was damaged.'], 'No. A new permit is free if the old one was lost.', ['Yes. A new permit costs $10, because the old one was lost.', 'Yes. You must pay the full fee again.']),
  check('th3_notice', 3, 'c_mom', 'This is the notice about the water pipes. Is the day of the work the same as in the letter?', [P('note', 'Notice', ['Street|Harbour Road', 'Work begins|April 3', 'Work ends|April 7']), P('letter', 'Letter', ['Street|Harbour Road', 'Work begins|April 4', 'Work ends|April 7'])], 'Work begins', { fix: ['April 4', 'April 5'] }),
  msg('th3_notice2', 3, 'c_sailor', 'memo', { say: 'Can I park my car on Harbour Road during the work?' }, ['Notice', 'Between April 4 and April 7, nobody may park on Harbour Road.', 'Cars that are left there will be taken away.'], 'No. Cars that are left on the road will be taken away.', ['Yes. Cars may park there after April 7 only.', 'No. Cars may park there, but only at night.']),
  msg('th3_ask5', 3, 'c_docker', 'memo', { say: 'Whom should I ask about the tax on my boat?' }, ['Who does what', 'Taxes: {Ms. Okafor|@}', 'Housing: {Ms. Aldridge|@}', 'Inspections: {Mr. Farrow|@}'], 'You should ask {Ms. Okafor|@}, because she is in charge of taxes.', ['You should ask {Ms. Aldridge|@}, because she is in charge of taxes.', 'You should ask {Mr. Farrow|@}, because he is in charge of taxes.']),
  msg('th3_hearing1', 3, 'p_hollis', 'memo', { say: 'A resident wants to complain about a decision. When can the hearing be held?' }, ['Hearings', 'Hearings are held on Tuesdays and Thursdays at 2:00.', 'A resident must ask for a hearing within 14 days of the decision.'], 'The hearing can be held on a Tuesday or a Thursday at two.', ['The hearing can be held on a Monday or a Friday at two.', 'The hearing can be held on a Tuesday or a Thursday at ten.']),
  check('th3_hearing2', 3, 'c_sailor', 'I have asked for a hearing about my boat permit. Please check the date on this letter.', [P('letter', 'Letter', ['Name|{Captain Reed|@}', 'Hearing|Wednesday, 2:00', 'Room|Room 2']), N('Hearings', ['Hearings are held on Tuesdays and Thursdays at 2:00.'])], 'Hearing', { fix: ['Thursday, 2:00', 'Thursday, 10:00'] }),
  msg('th3_hearing3', 3, 'p_hollis', 'phone', { say: 'Listen, please. A caller has a question.' }, ['Hello, this is {Captain Reed|@}.', 'I asked for a hearing about my boat permit.', 'Could you tell me whether it will be this week?'], 'It will be held on the next Tuesday or Thursday, and we will send you a letter.', ['It will be held next month, because hearings are held only once a month.', 'It will be held on the next Wednesday, and we will send you a letter.'], { features: ['audioOnly'] }),
  slot('th3_slot4', 3, 'c_sailor', 'speech', ['Please book my hearing for the boat permit.', 'It must be on a Tuesday or a Thursday, at 2:00.'], DAYS.slice(0, 4), TIMES, ['t2'], ['mon', 'wed'], 'thu-t2', OFFICERS, {}),
  msg('th3_ask6', 3, 'c_oldman', 'memo', { say: 'Is it true that I do not have to pay the fee because I am over 65?' }, ['Fees', 'Everyone pays the fees for permits and licenses.', 'Only the rent subsidy has a special rule for residents over 65.'], 'No. Everyone pays the fees, even residents over 65.', ['Yes. Residents over 65 do not pay any fees.', 'Yes. Residents over 65 do not pay for permits.']),
  msg('th3_fine', 3, 'p_aldridge', 'memo', { say: '{Mr. Grant|@} left a bag of garbage next to the bridge. How much must he pay?' }, ['Fines', 'Leaving garbage in a public place: $50.', 'A fine that is paid within 14 days is reduced by half.'], 'He must pay $50, or $25 if he pays within 14 days.', ['He must pay $25, and he can pay it at any time.', 'He must pay $50, or $10 if he pays within 14 days.']),
  check('th3_fine2', 3, 'c_merchant', 'I paid my fine within a week. Please check my receipt.', [P('invoice', 'Receipt', ['Name|{Mr. Grant|@}', 'Fine|$50', 'Paid|$50']), N('Fines', ['Leaving garbage in a public place: $50.', 'A fine that is paid within 14 days is reduced by half.'])], 'Paid', { fix: ['$25', '$35'] }),
  msg('th3_phone2', 3, 'p_hollis', 'phone', { say: 'The telephone again. Please listen carefully.' }, ['Hello, this is {Mr. Grant|@}.', 'I have an appointment on Tuesday at 11:00, but I cannot come.', 'Could we move it to Thursday at the same time?'], 'Yes. I will move your appointment to Thursday at 11:00.', ['Yes. I will move your appointment to Thursday at 1:30.', 'Yes. I will move your appointment to Tuesday at 11:00.'], { features: ['audioOnly'] }),
  msg('th3_ask7', 3, 'c_scholar', 'memo', { say: 'Which desk should I go to if I want to complain about noise?' }, ['Desks', 'Complaints: noise, street lamps and garbage', 'Taxes: bills and receipts', 'Elections: voters and polling stations'], 'Please go to the complaints desk.', ['Please go to the tax desk.', 'Please go to the elections desk.']),
  sort('th3_sort4', 3, 'More papers. Please read each one.', ['hearings', 'complaints', 'ideas', 'harbour'], [['I wish to appeal against the refusal of my permit', 'hearings'], ['The street lamp near my house has not worked for a month', 'complaints'], ['I have an idea for the harbour market', 'ideas'], ['I want to rent a place for my boat in the harbour', 'harbour']]),
  msg('th3_idea', 3, 'p_hollis', 'letter', { from: '{Anna|@}', say: 'This letter came for the council. Please read it and answer it.' }, ['Dear Sir,', 'I suggest that the town should build a play area next to the market.', 'Many families come on Saturdays, and the children have nowhere to play.'], 'Thank you for your suggestion. We will send it to the council, which meets in May.', ['Thank you for your suggestion. We have built a play area next to the market.', 'Thank you for your suggestion. The council cannot meet until you pay a fee.']),
  check('th3_boat', 3, 'c_docker', 'This is my form for a place in the harbour. Is the length of my boat the same as in the record?', [P('card', 'Form', ['Name|{Big Joe|@}', 'Boat|{Seagull|@}', 'Length|8 meters']), P('card', 'Boat record', ['Name|{Big Joe|@}', 'Boat|{Seagull|@}', 'Length|6 meters']), N('Harbour rules', ['Boats longer than 7 meters pay the higher fee.'])], 'Length', { fix: ['6 meters', '7 meters'] }),
  msg('th3_boatfee', 3, 'c_docker', 'memo', { say: 'My boat is 6 meters long. Which fee must I pay?' }, ['Harbour fees', 'Boats up to 7 meters: $90 a year.', 'Boats longer than 7 meters: $140 a year.'], 'You must pay $90, because your boat is shorter than 7 meters.', ['You must pay $140, because your boat is shorter than 7 meters.', 'You must pay $90, because your boat is longer than 7 meters.']),
  check('th3_ok2', 3, 'c_oldman', 'I have the form for my subsidy and my record. Can you check my years in the town?', [P('card', 'Form', ['Name|{Grandpa Sam|@}', 'Years in the town|40', 'Income|$15,000']), P('card', 'Resident record', ['Name|{Grandpa Sam|@}', 'Years in the town|40', 'Income|$15,000']), SUBSIDY], null),
  msg('th3_ask8', 3, 'c_student', 'memo', { say: 'I am worried that I will miss the tax deadline. What should I do?' }, ['Tax deadlines', 'The tax is due by March 31 or by September 30.', 'If you cannot pay by the deadline, write to the tax office before it ends.'], 'Please write to the tax office before the deadline ends.', ['Please wait until the deadline ends, and then write to the tax office.', 'Please pay after the deadline, and you will receive a discount.']),
  msg('th3_final', 3, 'p_hollis', 'email', { from: '{Nora|@}', subject: 'Thank you', say: 'A resident has written to thank us. Please read the email and answer it.' }, ['Dear {Mr. Hollis|@},', 'Thank you for your help with my stall permit last week.', 'Everything was clear.'], 'Thank you for your kind words. We are glad that we could help.', ['Thank you for your question. We will send you the form tomorrow.', 'Thank you for your message. Your permit will end on June 30.']),
];

// ---------------------------------------------------------------------------- rank 4 (英検準1級 · TOEIC 〜860)
// Appeals against a refusal, repair grants with conditions and exceptions, a public tender, council minutes, trees and the
// harbour, nominations for the election, an event that needs a permit; longer letters and e-mails; messages heard only.

const APPEAL = N('Appeals', ['A refusal may be appealed within 28 days of the date of the decision letter.', 'The appeal must be in writing and must state the grounds for it.', 'The fee of $30 is refunded if the appeal succeeds.']);
const GRANT = N('Repair grants', ['A grant of up to $4,000 is available for repairs to roofs, windows and heating.', 'The house must have been built before 1980, and the owner must live in it.', 'Work must not begin before the grant has been approved.', 'The owner\'s income must be below $40,000, unless the house is a listed building.']);
const TENDER = N('Tender: painting the harbour fences', ['Bids must reach the town hall by noon on May 20 in a sealed envelope.', 'Late bids will not be opened.', 'The council need not accept the lowest bid.']);
const TREES = N('Trees', ['A tree with a trunk wider than 30 centimeters may not be cut without permission.', 'The only exception is a tree that is dangerous. An inspector must confirm in writing that it is dangerous.', 'The fine is up to $500.']);
const NOMINATION = N('Nominations', ['A candidate must be at least 21 and must have lived in the town for a year.', 'Each candidate needs the signatures of ten residents.', 'Nominations close on September 1.']);
const EVENTS = N('Events', ['An event for more than 200 people needs a permit, which must be requested 30 days in advance.', 'A smaller event needs a permit only if a road has to be closed.']);
const DEPOSIT = N('Deposits', ['A landlord must return a tenant\'s deposit within 30 days after the tenant leaves.', 'He may keep money for damage only if he can show the cost in writing.']);

/** Rooms and the days and times at which they can be booked (rank 4–5 hearings). */
const HEARCOLS: Axis[] = [
  { id: 'tue9', label: 'Tuesday 9:30', tags: ['tue', 'morning'] },
  { id: 'tue2', label: 'Tuesday 2:00', tags: ['tue', 'afternoon'] },
  { id: 'wed11', label: 'Wednesday 11:00', tags: ['wed', 'morning'] },
  { id: 'thu9', label: 'Thursday 9:30', tags: ['thu', 'morning'] },
  { id: 'thu2', label: 'Thursday 2:00', tags: ['thu', 'afternoon'] },
];

const R4: AuthoredTask[] = [
  msg('th4_appeal1', 4, 'c_sailor', 'memo', { say: 'My boat permit was refused on March 1. Until when can I appeal?' }, L(APPEAL), 'You can appeal within 28 days of the date of the decision letter.', ['You can appeal until the end of the year, in writing.', 'You can appeal within 28 days of the date on which you pay the $30.']),
  check('th4_appeal2', 4, 'c_sailor', 'I have written my appeal. Could you check that the grounds and the fee are as the rules say?', [P('letter', 'Appeal', ['Name|{Captain Reed|@}', 'Decision dated|March 1', 'Appeal dated|March 19', 'Fee paid|$20']), APPEAL], 'Fee paid', { fix: ['$30', '$25'] }),
  sort('th4_sort1', 4, 'The morning post includes several appeals and complaints. Please send each to the officer who must deal with it.', ['hearings', 'complaints', 'planning', 'tax'], [['An appeal against the refusal to let a resident build a second floor', 'planning'], ['An appeal against a $200 fine for leaving garbage in the street', 'hearings'], ['A complaint that the tax office sent a bill to the wrong address', 'complaints'], ['A letter explaining why the property tax will be paid six weeks late', 'tax']]),
  msg('th4_appeal3', 4, 'p_hollis', 'letter', { from: '{Nora|@}', say: 'A letter has arrived from a resident whose permit was refused. Please read it and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'My application for a second stall was refused on April 2, because I owed a fine.', 'I paid the fine on April 5. Could I appeal, or must I apply again?'], 'You may appeal until April 30, but since you have now paid the fine, you could also apply again.', ['You may appeal until May 30, but you cannot apply again.', 'You cannot appeal, because the fine was not paid on April 2.']),
  check('th4_ok1', 4, 'c_baker', 'This is my appeal, and I have enclosed the decision letter. Is everything in order?', [P('letter', 'Appeal', ['Name|{Mrs. Hill|@}', 'Decision dated|May 2', 'Appeal dated|May 20', 'Fee paid|$30']), P('letter', 'Decision letter', ['Name|{Mrs. Hill|@}', 'Decision dated|May 2']), APPEAL], null),
  msg('th4_grant1', 4, 'c_docker', 'memo', { say: 'I own the house where I live, and it was built in 1965. My roof needs repair, and I earn $35,000. Can I apply for the grant?' }, L(GRANT), 'Yes. Your house was built before 1980, you live in it, and your income is below $40,000.', ['No. Your income is above the limit for a repair grant.', 'Yes, but you must start the work before you apply.']),
  msg('th4_grant2', 4, 'c_oldman', 'memo', { say: 'My house is a listed building, and I earn $55,000. May I still ask for a grant to repair the windows?' }, L(GRANT), 'Yes. The income limit does not apply to a listed building.', ['No. Your income is above $40,000, so you cannot ask for the grant.', 'No. Only roofs and heating can be repaired with a grant.']),
  check('th4_grant3', 4, 'c_docker', 'I have asked for a grant for the roof. I think that the year in which my house was built is wrong on this form. Can you check it?', [P('card', 'Form', ['Owner|{Big Joe|@}', 'Built in|1992', 'Work|Roof']), P('card', 'Property record', ['Owner|{Big Joe|@}', 'Built in|1952', 'Work|Roof']), GRANT], 'Built in', { fix: ['1952', '1972'] }),
  msg('th4_grant4', 4, 'p_hollis', 'email', { from: '{Mrs. Hill|@}', subject: 'My roof', say: 'A resident is asking about the repair grant. Please read the email and answer it.' }, ['Dear {Mr. Hollis|@},', 'My builder can start work on my roof next week, and I have not yet heard whether my grant has been approved.', 'Is it all right if he begins now?'], 'No. Work must not begin before the grant has been approved, or you will lose the grant.', ['Yes. He may begin now, and the grant will be approved later.', 'No. The grant can only be approved after the work has been finished.']),
  slot('th4_slot1', 4, 'c_docker', 'speech', ['{Mr. Farrow|@} must inspect my roof before the grant is approved.', 'I can come on Tuesday or Wednesday, but not in the afternoon.'], DAYS.slice(0, 4), TIMES2, ['morning'], ['mon', 'thu'], 'tue-t11', OFFICERS, {}),
  msg('th4_tender1', 4, 'c_merchant', 'memo', { say: 'My bid for painting the fences is ready. I will bring it to the town hall at ten past twelve on May 20. Is that all right?' }, L(TENDER), 'No. Bids that reach the town hall after noon will not be opened.', ['Yes. You may bring it at any time on May 20.', 'No. You must send your bid in an open envelope.']),
  check('th4_tender2', 4, 'c_merchant', 'This is the receipt that you gave me for my bid. Please check it against your register and the tender notice.', [P('card', 'Receipt', ['Bid for|Harbour fences', 'Received|May 20, 12:40', 'Envelope|Sealed']), P('note', 'Bid register', ['Bid for|Harbour fences', 'Received|May 20, 11:40', 'Envelope|Sealed']), TENDER], 'Received', { fix: ['May 20, 11:40', 'May 20, 10:40'] }),
  msg('th4_tender3', 4, 'p_hollis', 'email', { from: '{Mr. Grant|@}', subject: 'Your tender', say: 'A builder has sent a question about the tender. Please read it and choose the answer.' }, ['Dear Sir,', 'Our bid is the lowest of the five that you received.', 'Please confirm that we will be given the contract for the fences.'], 'We cannot confirm that yet, because the council need not accept the lowest bid.', ['We confirm that you will be given the contract, because you offered the lowest price.', 'We cannot confirm that, because late bids will not be opened.']),
  pad('th4_pad1', 4, 'p_hollis', ['Good afternoon. This is {Ms. Aldridge|@}.', 'The meeting about the tender will be held in Room 2 on Thursday at 11:00.', 'Please bring the five bids, and please tell the chairman.'], [
    ['who', 'Caller', '{Ms. Aldridge|@}', ['{Ms. Okafor|@}', '{Mr. Farrow|@}']],
    ['where', 'Room', 'Room 2', ['Room 1', 'the council chamber']],
    ['when', 'When', 'Thursday at 11:00', ['Thursday at 1:30', 'Tuesday at 11:00']],
    ['bring', 'Bring', 'the five bids', ['the five appeals', 'the three bids']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('th4_minutes1', 4, 'c_scholar', 'memo', { say: 'I could not attend the council meeting. Who will send the new tax notices, and when?' }, ['Minutes of the council meeting of May 6', '1. The council approved a budget of $2.4 million.', '2. The council rejected the proposal to close the harbour office.', '3. Action: {Ms. Okafor|@} will send the new tax notices by May 20.'], '{Ms. Okafor|@} will send them by May 20.', ['{Ms. Aldridge|@} will send them by May 20.', '{Ms. Okafor|@} will send them by May 6.']),
  check('th4_minutes2', 4, 'p_hollis', 'The minutes have to match the decision that the council took. Please check the date of the next meeting.', [P('note', 'Minutes', ['Meeting|May 6', 'Budget|$2.4 million', 'Next meeting|June 13']), P('letter', 'Decision sheet', ['Meeting|May 6', 'Budget|$2.4 million', 'Next meeting|June 3'])], 'Next meeting', { fix: ['June 3', 'June 30'] }),
  msg('th4_minutes3', 4, 'c_merchant', 'memo', { say: 'Will the new road be built?' }, ['Minutes of the council meeting of May 6', '4. The council voted on a new road to the harbour. Seven councillors voted against it, and five voted for it.', '5. The road will not be built.'], 'No. More councillors voted against the road than for it.', ['Yes. The road will be built, because five councillors voted for it.', 'No. Nobody voted on the road.']),
  msg('th4_trees1', 4, 'c_cook', 'memo', { say: 'My tree has a trunk of 25 centimeters. Do I need permission to cut it?' }, ['Trees', 'A tree with a trunk wider than 30 centimeters may not be cut without permission.', 'The fine is up to $500.'], 'No. Your tree is not wider than 30 centimeters.', ['Yes. Every tree needs permission before it is cut.', 'No. But you must pay a fine of up to $500.']),
  msg('th4_trees3', 4, 'c_cook', 'memo', { say: 'The old tree in front of my shop is dangerous, and its trunk is 40 centimeters wide. May I cut it down?' }, L(TREES), 'Yes, but only if an inspector confirms in writing that the tree is dangerous.', ['No. A tree with a trunk wider than 30 centimeters may never be cut.', 'Yes. Anyone may cut a dangerous tree at any time.']),
  check('th4_trees2', 4, 'c_cook', 'Is the trunk of my tree the same on the report and in the notes?', [P('letter', 'Report', ['Tree|Harbour Street', 'Trunk|42 centimeters']), P('note', 'Notes', ['Tree|Harbour Street', 'Trunk|24 centimeters'])], 'Trunk', { fix: ['24 centimeters', '34 centimeters'] }),
  ask('th4_ask1', 4, 'c_student', 'I think I am at the wrong desk.', 'That is all right. Please tell me which desk you want.', ['You must pay $30 within 28 days.', 'The council need not accept the lowest bid.']),
  msg('th4_nomination1', 4, 'c_scholar', 'memo', { say: 'I am 23, and I have lived in the town for eleven months. Can I stand in the election?' }, L(NOMINATION), 'No. You must have lived in the town for a year.', ['Yes. You are older than 21, and nothing else is required.', 'No. You must be at least 25.']),
  check('th4_nomination2', 4, 'c_student', 'These are my nomination papers. I have collected the signatures. Can you check them?', [P('card', 'Nomination', ['Candidate|{Ken|@}', 'Age|23', 'Years in the town|3', 'Signatures|8']), NOMINATION], 'Signatures', { fix: ['10', '12'] }),
  slot('th4_slot2', 4, 'c_student', 'speech', ['I must hand in my nomination papers to {Ms. Aldridge|@}.', 'I can come in the afternoon, but not on Monday or Tuesday.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'tue'], 'wed-t1', OFFICERS, {}),
  msg('th4_nomination3', 4, 'p_hollis', 'email', { from: '{Grandpa Sam|@}', subject: 'The election', say: 'Please read this email, which came from a resident, and choose the answer.' }, ['Dear {Mr. Hollis|@},', 'I would like to stand in the harbour election, but I have only found nine people who will sign my nomination.', 'Nominations close on September 1. Is there any way for me to stand?'], 'You need one more signature, and you have until September 1 to find it.', ['You may stand with nine signatures, because you are over 21.', 'You need ten more signatures, and nominations have already closed.']),
  msg('th4_event1', 4, 'c_cook', 'memo', { say: 'We want to hold a harvest party for 150 people on the quay, and we will not close any road. Do we need a permit?' }, L(EVENTS), 'No. An event for fewer than 200 people needs a permit only if a road has to be closed.', ['Yes. Every event at the harbour needs a permit, which must be requested 30 days in advance.', 'No. A permit is needed only for events with more than 150 people.']),
  msg('th4_event2', 4, 'c_mom', 'memo', { say: 'Our school wants to hold a fair for about 300 people next month, and we will close the lane. When must we ask for a permit?' }, L(EVENTS), 'You must request a permit at least 30 days before the fair.', ['You do not need a permit, because the fair is held by a school.', 'You must request a permit at least 200 days before the fair.']),
  check('th4_event3', 4, 'c_mom', 'This is the permit for our school fair. Is the number of visitors the same as in our request?', [P('card', 'Permit', ['Event|School fair', 'Visitors|300', 'Road closed|Mill Lane']), P('letter', 'Request', ['Event|School fair', 'Visitors|350', 'Road closed|Mill Lane']), EVENTS], 'Visitors', { fix: ['350', '250'] }),
  sort('th4_sort2', 4, 'A heavy post bag. Please read each paper properly, and put it on the right desk.', ['roads', 'elections', 'harbour', 'waste'], [['A request to close Mill Lane on the afternoon of the school fair', 'roads'], ['The nomination papers of a candidate for the harbour election', 'elections'], ['An application to place a fishing boat in the new part of the harbour', 'harbour'], ['A complaint that the old fridges at the harbour have not been collected', 'waste']]),
  msg('th4_deposit1', 4, 'c_student', 'memo', { say: 'I left my flat on April 2, and the landlord still has my deposit. When must he return it?' }, L(DEPOSIT), 'He must return it by May 2, which is 30 days after you left.', ['He must return it by April 30, but only if he can show the damage.', 'He must return it within 30 days after you ask for it.']),
  check('th4_deposit2', 4, 'c_student', 'My landlord sent me this letter. Is the amount that he kept for damage the same as in his bill?', [P('letter', 'Letter', ['Deposit|$600', 'Kept for damage|$250', 'Returned|$350']), P('invoice', 'Bill for damage', ['Kept for damage|$150']), DEPOSIT], 'Kept for damage', { fix: ['$150', '$100'] }),
  msg('th4_deposit3', 4, 'p_hollis', 'letter', { from: '{Anna|@}', say: 'A tenant has written about her deposit. Please read the letter and choose the reply.' }, ['Dear Sir,', 'My landlord says that he will keep $300 of my deposit for damage to the kitchen floor, but he has not shown me any bill.', 'Is he allowed to do this?'], 'No. He may keep money for damage only if he can show you the cost in writing.', ['Yes. A landlord may keep any part of the deposit that he wishes.', 'No. A landlord must return the whole deposit within 30 days, whatever the damage.']),
  slot('th4_slot3', 4, 'c_mom', 'speech', ['I would like to ask {Ms. Aldridge|@} about my landlord.', 'I can come in the morning on Wednesday or Friday, but not at nine.'], DAYS, TIMES2, ['morning'], ['mon', 'tue', 'thu', 't9'], 'wed-t11', OFFICERS, {}),
  msg('th4_hearing1', 4, 'p_hollis', 'phone', { say: 'Please listen. A resident is calling about a hearing.' }, ['Hello, this is {Captain Reed|@}.', 'My appeal against the refusal of my boat permit will be heard on Thursday, I think.', 'Could you tell me the time and the room?'], 'The hearing is on Thursday at 2:00 in Room 2, and we will send you a letter.', ['The hearing is on Thursday at 2:00 in the council chamber, and we will send you a letter.', 'The hearing is on Tuesday at 2:00 in Room 2, and we will send you a letter.'], { features: ['audioOnly'] }),
  slot('th4_slot4', 4, 'p_hollis', 'email', ['Dear Sir,', 'We would like to ask for a hearing about the refusal of our permit.', 'There will be about 40 people, so we need the council chamber.', 'We can come in the afternoon, but not on Tuesday.', 'Yours faithfully, {Mr. Grant|@}'], ROOMS, HEARCOLS, ['large', 'afternoon'], ['tue'], 'chamber-thu2', OFFICERS, { say: 'A request for a hearing has arrived. Please look at the plan and choose the room and the time.', layout: 'rooms' }),
  check('th4_ok2', 4, 'c_docker', 'Here is the grant form that I filled in with the help of my daughter. Is it in order?', [P('card', 'Form', ['Owner|{Big Joe|@}', 'Built in|1952', 'Work|Roof', 'Income|$32,000']), P('card', 'Property record', ['Owner|{Big Joe|@}', 'Built in|1952', 'Work|Roof']), GRANT], null),
  msg('th4_noise1', 4, 'c_scholar', 'memo', { say: 'The building work next door started at half past seven this morning, which is a Saturday. What can I do about it?' }, ['Building work', 'Work is allowed from 8:00 to 18:00 on weekdays and from 9:00 to 13:00 on Saturdays.', 'Complaints about building work should be made in writing to the complaints desk.', 'An officer will visit the site within five working days.'], 'You can send a written complaint to the complaints desk, and an officer will visit the site within five working days.', ['You can telephone the builder, and an officer will visit the site within five days.', 'You can send a written complaint, but the work is allowed to start at half past seven on Saturdays.']),
  msg('th4_flood', 4, 'c_sailor', 'memo', { say: 'The river is rising. Will Harbour Road be closed?' }, ['Flood warning', 'If the river rises above 3 meters, Harbour Road will be closed at 9:00 in the evening.', 'The river will reach 3.4 meters at midnight.'], 'Yes. The river will rise above 3 meters, so the road will be closed at 9:00 in the evening.', ['No. The river will stay below 3 meters until midnight.', 'Yes. The road will be closed at midnight, when the river reaches 3.4 meters.']),
  check('th4_flood2', 4, 'p_hollis', 'Please check that the notice is the same as the warning.', [P('note', 'Notice', ['Road|Harbour Road', 'Closed at|9:00 in the evening', 'Level|3.4 meters']), P('letter', 'Warning', ['Road|Harbour Road', 'Closed at|9:00 in the evening', 'Level|4.3 meters'])], 'Level', { fix: ['4.3 meters', '3.3 meters'] }),
  msg('th4_phone2', 4, 'p_hollis', 'phone', { say: 'Another call. Please listen carefully.' }, ['Good morning. This is {Mrs. Hill|@}.', 'I filled in the form for the repair grant last week, and I would like to know whether it has been approved.', 'My number is 4 5 8 2.'], 'We will check, and {Ms. Aldridge|@} will call you back on 4 5 8 2.', ['We will check, and {Ms. Aldridge|@} will call you back on 4 5 2 8.', 'We will check, and {Ms. Aldridge|@} will call you back on 4 8 5 2.'], { features: ['audioOnly'] }),
  msg('th4_licence', 4, 'c_cook', 'memo', { say: 'I want a permit for a food van. What must I show?' }, ['Food vans', 'The owner must show a safety certificate and insurance.', 'A permit costs $120 a year.'], 'You must show a safety certificate and insurance.', ['You must show only a receipt for the fee of $120.', 'You must show insurance, but a certificate is not needed.']),
  pad('th4_pad2', 4, 'p_hollis', ['Hello, this is {Mr. Grant|@}.', 'My bid for the fences was sent by post on Monday.', 'Please tell me whether it arrived before noon on May 20.'], [
    ['who', 'Caller', '{Mr. Grant|@}', ['{Captain Reed|@}', '{Professor Hale|@}']],
    ['what', 'About', 'a bid sent by post', ['an appeal sent by post', 'a bid brought by hand']],
    ['sent', 'Sent on', 'Monday', ['Friday', 'Tuesday']],
    ['ask', 'He wants to know', 'whether it arrived before noon on May 20', ['whether it was opened on May 20', 'whether it arrived after noon on May 20']],
  ], { features: ['audioOnly'], say: 'One more call. Please listen carefully and write the message.' }),
  msg('th4_minutes4', 4, 'p_hollis', 'memo', { say: 'A councillor asks you to read the minutes and tell him who is responsible for the harbour fees.' }, ['Minutes of the council meeting of June 3', '1. The council decided that the harbour fees will be raised by 5 percent from January.', '2. Action: {Mr. Farrow|@} will inform the boat owners by October 31.'], '{Mr. Farrow|@} is responsible, and he must inform the boat owners by October 31.', ['{Ms. Okafor|@} is responsible, and she must inform the boat owners by October 31.', '{Mr. Farrow|@} is responsible, and he must inform the boat owners by January 31.']),
  check('th4_ok3', 4, 'c_scholar', 'This is my nomination form. Is the number of signatures what the rules require?', [P('card', 'Nomination', ['Candidate|{Professor Hale|@}', 'Age|58', 'Years in the town|30', 'Signatures|11']), NOMINATION], null),
  msg('th4_final', 4, 'p_hollis', 'email', { from: '{Grandma Rose|@}', subject: 'Thank you', say: 'A resident has written to us again. Please read the email and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'I wish to thank the young man at your counter, who explained the rules for my grant very clearly.', 'Without his help, I would have started the work too early.'], 'Thank you for your kind message. I am glad that he could help you, and I will tell him.', ['Thank you for your kind message. I am sorry that the work began before the grant was approved.', 'Thank you for your question. The grant is available only for houses built before 1980.']),
];

// ---------------------------------------------------------------------------- rank 5 (英検1級 · TOEIC 〜990)
// The planning hearing for the old warehouse, ordinances with provisos and exceptions, arrears and interest, requests for
// information, the recount rules, discharge permits; letters and calls that must be read to the last clause.

const PLAN5 = N('Planning application 31', ['Applicant: {Marlow Estates|@}. Site: the Old Cannery, {Quay|@} Road.', 'Proposal: to change the use of the building from storage to flats.', 'Objections must reach the planning desk within 21 days of the public notice.']);
const ABATE = N('Noise abatement', ['A person who does not comply with an abatement order within 7 days shall be liable to a fine of up to $1,000.', 'An abatement order shall not apply to work that is needed in an emergency.']);
const LATETAX = N('Tax arrears', ['Interest of 1 percent a month is charged on tax that is not paid by the due date.', 'A penalty of 5 percent is added if the tax is more than 60 days late.', 'Arrears of more than $500 may be paid in instalments, provided that 10 percent is paid at once.']);
const INFO5 = N('Requests for information', ['The council shall reply to a written request within 20 working days.', 'No fee is charged if the cost is below $50.', 'The council may refuse a request if the cost of the work would exceed $450, or if personal data would be disclosed.']);
const RECOUNT = N('Recounts', ['A candidate may demand a recount if the margin between two candidates is less than 1 percent of the votes cast.']);
const OBSERVERS = N('Observers', ['Each candidate may appoint two observers at each polling station.']);
const SPOILED = N('Counting', ['Spoilt ballots are not counted.']);
const DISCHARGE = N('Discharge permit', ['The discharge of waste water into the harbour must not exceed 50 milligrams in each liter.', 'Samples shall be taken once a month.', 'A permit holder who exceeds the limit must report it within 24 hours and submit a plan to correct it within 14 days.']);
const TRANS = N('Rent subsidy: new rules', ['From January 1, a household may apply only if its income is below $26,000.', 'A household that was receiving the subsidy on December 31 shall continue under the old rules until the end of that year.']);

const R5: AuthoredTask[] = [
  msg('th5_plan1', 5, 'c_merchant', 'memo', { say: 'I live next to the Old Cannery, and I wish to object to the flats. Until when can I send my objection?' }, L(PLAN5), 'You may send it to the planning desk within 21 days of the public notice.', ['You may send it to the planning desk within 21 days of the hearing.', 'You may send it to the harbour office within 21 days of the public notice.']),
  check('th5_plan2', 5, 'c_merchant', 'Here is the letter in which I object to the flats. Would you mind checking that the application number is the one on the notice?', [P('letter', 'Objection', ['From|{Mr. Grant|@}', 'Application|13', 'Sent on|April 9']), P('note', 'Public notice', ['Application|31', 'Site|Old Cannery']), PLAN5], 'Application', { fix: ['31', '33'] }),
  msg('th5_plan3', 5, 'p_hollis', 'letter', { from: '{Professor Hale|@}', say: 'A resident has written about the warehouse. Please read the letter carefully and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'I object to the proposal to turn the Old Cannery into flats, because the lane behind it is too narrow for ambulances.', 'I posted my objection on day 25 after the public notice. Will the council still consider it?'], 'I am afraid not, because objections must reach the planning desk within 21 days of the public notice.', ['Yes. The council will consider it, because you posted it within 25 days.', 'I am afraid not, because objections must be sent to the harbour office within 21 days.']),
  sort('th5_sort1', 5, 'The warehouse case has produced a heap of papers. Please send each paper to the officer who must deal with it.', ['planning', 'hearings', 'complaints', 'tax'], [['An objection to the flats from a neighbour who says that the building is too high', 'planning'], ['A request that the hearing on the warehouse be moved to the council chamber', 'hearings'], ['A complaint that the notice about the warehouse was not displayed near the lane', 'complaints'], ['A letter from the owner of the warehouse about the property tax that is unpaid', 'tax']]),
  check('th5_plan4', 5, 'p_hollis', 'The decision sheet must agree with the hearing record. Please check the number of objections.', [P('note', 'Decision sheet', ['Application|31', 'Objections|14', 'Decision|Refused']), P('ledger', 'Hearing record', ['Application|31', 'Objections|41', 'Decision|Refused']), PLAN5], 'Objections', { fix: ['41', '4'] }),
  msg('th5_plan5', 5, 'p_hollis', 'email', { from: '{Mr. Farrow|@}', subject: 'The warehouse hearing', say: 'The inspector has written about the hearing. Please read his email and choose the reply.' }, ['Dear colleagues,', 'The hearing on application 31 will take place in the council chamber on Thursday at 2:00.', 'Fourteen residents have asked to speak, so each speaker will be allowed three minutes.', 'Please confirm that the chamber is free, and that the microphones will be tested.'], 'The chamber is free on Thursday at 2:00, and I will see that the microphones are tested.', ['The chamber is free on Tuesday at 2:00, and I will see that the microphones are tested.', 'The chamber is free on Thursday at 4:00, and I will see that the microphones are tested.']),
  slot('th5_slot1', 5, 'p_farrow', 'email', ['Dear colleagues,', 'The hearing on application 31 will be attended by about 60 residents, so we shall need the council chamber.', 'It cannot be held on a Tuesday, because the council meets on Tuesdays, and I am unavailable in the mornings.'], ROOMS, HEARCOLS, ['large', 'afternoon'], ['tue'], 'chamber-thu2', OFFICERS, { say: 'Please look at the plan and book the room for the hearing.', layout: 'rooms' }),
  msg('th5_plan6', 5, 'c_cook', 'memo', { say: 'The council has granted permission for the flats, but I think that is a mistake. What can I do?' }, ['Appeals', 'A decision may be appealed within 28 days of the date of the decision letter.', 'Only a person who sent an objection within the time limit may appeal against a decision to grant permission.'], 'You can appeal only if you sent an objection within the time limit.', ['You can appeal within 28 days, whether or not you sent an objection.', 'You can appeal only if you spoke at the hearing.']),
  msg('th5_abate1', 5, 'c_scholar', 'memo', { say: 'My neighbour was given a noise abatement order ten days ago, and the noise has not stopped. What may happen to him?' }, L(ABATE), 'He may be fined up to $1,000, because he did not comply within seven days.', ['He may be fined up to $1,000, but only after thirty days.', 'He may not be fined, because the order does not apply to him.']),
  msg('th5_abate2', 5, 'c_docker', 'memo', { say: 'I received a noise abatement order, but my roof was broken and I had to repair it at night. Must I pay a fine?' }, L(ABATE), 'No. An order does not apply to work that is needed to deal with an emergency.', ['Yes. An order applies to every kind of work, even in an emergency.', 'Yes. You will be liable for a fine of up to $1,000 after seven days.']),
  check('th5_abate3', 5, 'c_docker', 'The order that I was given states the fine. Is it the same as in the ordinance?', [P('letter', 'Order', ['Name|{Big Joe|@}', 'Time to comply|7 days', 'Fine up to|$100']), ABATE], 'Fine up to', { fix: ['$1,000', '$500'] }),
  msg('th5_arrears1', 5, 'c_sailor', 'memo', { say: 'I am 75 days late with my property tax of $2,000. What must I pay, apart from the tax itself, if the interest for two months is $40?' }, L(LATETAX), 'You must pay the interest of $40, and also a penalty of 5 percent, because you are more than 60 days late.', ['You must pay only the interest of $40, because the penalty applies only after 90 days.', 'You must pay the interest of $40, and a penalty of 50 percent, because you are more than 60 days late.']),
  check('th5_arrears2', 5, 'c_sailor', 'This is the statement that you sent me for my late tax. Is the penalty right?', [P('invoice', 'Statement', ['Tax|$2,000', 'Days late|75', 'Interest|$40', 'Penalty|$200']), LATETAX], 'Penalty', { fix: ['$100', '$50'] }),
  msg('th5_arrears3', 5, 'c_oldman', 'memo', { say: 'I owe $800 in tax and cannot pay it all at once. May I pay in instalments?' }, L(LATETAX), 'Yes, provided that you pay 10 percent of the debt, which is $80, at once.', ['Yes, provided that you pay 10 percent of the debt, which is $8, at once.', 'No. Instalments are allowed only if the debt is less than $500.']),
  msg('th5_arrears4', 5, 'p_hollis', 'letter', { from: '{Mrs. Hill|@}', say: 'A letter from a resident has arrived. Please read it with care and choose the reply.' }, ['Dear {Ms. Okafor|@},', 'My tax of $450 was due on March 31, but I was in hospital, and I paid it on May 15.', 'I have received a bill for interest. Is a penalty also due?'], 'No penalty is due, because you were less than 60 days late, but interest is charged from March 31.', ['A penalty of 5 percent is due, because you were more than 60 days late.', 'No interest is due, because you were in hospital.']),
  slot('th5_slot2', 5, 'c_sailor', 'speech', ['I want to discuss a payment plan with {Ms. Okafor|@}.', 'I am free on Wednesday or Thursday afternoon, but I am at sea on Tuesday.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'tue'], 'wed-t3', OFFICERS, { extraBusy: [] }),
  msg('th5_info1', 5, 'c_scholar', 'memo', { say: 'I have asked the council for the records of the harbour fees for ten years, and I was told the work will cost $600. Can the council refuse?' }, L(INFO5), 'Yes. The council may refuse a request if the cost of the work would exceed $450.', ['No. The council must always give the records, but it may charge a fee.', 'Yes. The council may refuse a request only if the records contain personal data.']),
  msg('th5_info2', 5, 'c_student', 'memo', { say: 'I sent my request for the minutes of the council meetings on March 3, and I have heard nothing. By when must the council reply?' }, L(INFO5), 'It must reply within 20 working days of your request.', ['It must reply within 20 days, whether they are working days or not.', 'It must reply within 20 working days, but only if you pay a fee of $50.']),
  check('th5_info3', 5, 'c_student', 'This is the letter in which the council answers my request. Is the date of the reply the same as in your register?', [P('letter', 'Reply', ['Request received|March 3', 'Reply sent|April 2', 'Cost of the work|$320']), P('ledger', 'Register', ['Request received|March 3', 'Reply sent|March 31', 'Cost of the work|$320']), INFO5], 'Reply sent', { fix: ['March 31', 'April 3'] }),
  msg('th5_info4', 5, 'p_hollis', 'email', { from: '{Ken|@}', subject: 'My request', say: 'A student has written to ask about his request. Please read the email and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'I asked for a list of the addresses of the people who objected to the flats, but you refused.', 'May I ask why?'], 'We refused because the list would disclose personal data, which the council may not do.', ['We refused because the cost of the work would be below $50.', 'We refused because you did not send your request in writing.']),
  pad('th5_pad1', 5, 'p_hollis', ['Good morning. This is {Ms. Aldridge|@}.', 'The three households that were receiving the rent subsidy last year will continue under the old rules until December 31.', 'Please tell {Mr. Hollis|@} before the council meets on Tuesday.'], [
    ['who', 'Caller', '{Ms. Aldridge|@}', ['{Ms. Okafor|@}', '{Mr. Farrow|@}']],
    ['households', 'Households', 'three', ['thirteen', 'thirty']],
    ['until', 'Old rules until', 'December 31', ['January 1', 'November 30']],
    ['tell', 'Tell {Mr. Hollis|@} before', 'Tuesday', ['Thursday', 'Friday']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('th5_trans1', 5, 'c_mom', 'memo', { say: 'I received the rent subsidy last year, and my income is now $27,000. I shall be applying again in January. Will I still receive it?' }, L(TRANS), 'Yes. You were receiving it on December 31, so you continue under the old rules until the end of that year.', ['No. From January 1 the income limit is $26,000, so you are not eligible.', 'Yes. Under the new rules, your income is below $26,000, so you are eligible for another year.']),
  msg('th5_trans2', 5, 'c_student', 'memo', { say: 'I have never received the subsidy, and my income is $27,000. May I apply in February?' }, L(TRANS), 'No. From January 1 a household may apply only if its income is below $26,000.', ['Yes. A household that was not receiving the subsidy on December 31 may apply under the old rules.', 'No. A household may apply only if its income is below $27,000.']),
  check('th5_trans3', 5, 'c_mom', 'I am applying under the new rules. Is the income limit on my form the one that applies?', [P('card', 'Form', ['Name|{Anna|@}', 'Income|$25,000', 'Income limit|$24,000']), TRANS], 'Income limit', { fix: ['$26,000', '$25,000'] }),
  msg('th5_recount1', 5, 'c_cook', 'memo', { say: 'I lost the election by 30 votes out of 4,000 cast. May I demand a recount?' }, L(RECOUNT), 'Yes, because the margin is less than 1 percent of the votes cast, which is 40 votes.', ['No, because the margin is more than 1 percent of the votes cast.', 'Yes, because spoilt ballots are counted in a recount.']),
  msg('th5_recount2', 5, 'c_merchant', 'memo', { say: 'I am a candidate, and there will be three polling stations. How many observers may I appoint in all?' }, L(OBSERVERS), 'You may appoint six observers, two at each polling station.', ['You may appoint two observers, who must move between the polling stations.', 'You may appoint three observers, one at each polling station.']),
  slot('th5_slot3', 5, 'c_student', 'speech', ['I would like to inspect the ballot papers with a member of the election office.', 'I can come on Wednesday or Friday, but I have lectures in the morning.'], DAYS, TIMES2, ['afternoon'], ['mon', 'tue', 'thu'], 'fri-t3', OFFICERS, {}),
  check('th5_recount3', 5, 'p_hollis', 'The result sheet must agree with the count. Please check the number of spoilt ballots.', [P('note', 'Result sheet', ['Votes cast|4,000', 'Spoilt ballots|61']), P('ledger', 'Count', ['Votes cast|4,000', 'Spoilt ballots|16']), SPOILED], 'Spoilt ballots', { fix: ['16', '6'] }),
  msg('th5_discharge1', 5, 'c_cook', 'memo', { say: 'Our fish factory discharges waste water into the harbour. The last sample showed 62 milligrams in each liter. What must we do?' }, L(DISCHARGE), 'You must report it within 24 hours and submit a plan to correct it within 14 days.', ['You must report it within 14 days and submit a plan within 24 hours.', 'You need not do anything, because samples are taken only once a month.']),
  check('th5_discharge2', 5, 'c_cook', 'This is our report on the sample. Is the date by which the plan is due the same as in the permit?', [P('letter', 'Report', ['Sample|62 milligrams in each liter', 'Reported within|24 hours', 'Plan due in|41 days']), DISCHARGE], 'Plan due in', { fix: ['14 days', '24 days'] }),
  msg('th5_discharge3', 5, 'p_hollis', 'email', { from: '{Nora|@}', subject: 'Our samples', say: 'A permit holder has written to the counter. Please read the email and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'We have taken a sample every two months, because the inspector told us last year that this was enough.', 'Please confirm that we are following the permit.'], 'We cannot confirm that, because the permit requires a sample once a month.', ['We confirm that you are following the permit, because the inspector told you so.', 'We cannot confirm that, because the permit requires a sample once a year.']),
  msg('th5_phone1', 5, 'p_hollis', 'phone', { say: 'Please listen. A caller has a question about the warehouse.' }, ['Hello, this is {Mr. Grant|@}.', 'I sent my objection to the planning desk on April 9, and I would like to know whether it was received in time.', 'The public notice was posted on March 25.'], 'Yes. April 9 is within 21 days of March 25, so your objection was in time.', ['No. April 9 is more than 21 days after March 25, so your objection was late.', 'Yes. Objections may be sent at any time before the hearing.'], { features: ['audioOnly'] }),
  msg('th5_phone2', 5, 'p_hollis', 'phone', { say: 'Another call, and this one is not easy. Please listen carefully.' }, ['Good afternoon. This is {Mrs. Hill|@}.', 'I would like to ask for a hearing about my fine, but I received the decision letter on June 1, and today is July 3.', 'Is it too late?'], 'I am afraid so. An appeal must be made within 28 days of the date of the decision letter.', ['No. You may appeal within 28 days of the day on which you received the letter.', 'I am afraid so. An appeal must be made within 14 days of the date of the decision letter.'], { features: ['audioOnly'] }),
  slot('th5_slot4', 5, 'c_baker', 'speech', ['I wish to appeal against my fine, and I would like the hearing to be in a small room.', 'I cannot come in the morning, and I am away on Tuesday.'], ROOMS, HEARCOLS, ['small', 'afternoon'], ['tue'], 'r1-thu2', OFFICERS, { layout: 'rooms' }),
  sort('th5_sort2', 5, 'More papers have come in about the harbour. Please send each one to the right desk.', ['harbour', 'complaints', 'ideas', 'waste'], [['An application for a berth for a boat that is 9 meters long', 'harbour'], ['A letter saying that there is waste on the water near the old bridge', 'complaints'], ['A suggestion that the council should build a new market hall at the harbour', 'ideas'], ['A question about where to take the old boxes that are no longer used', 'waste']]),
  msg('th5_proviso1', 5, 'c_sailor', 'memo', { say: 'May I leave my boat in the harbour for the winter without paying, since I am over 65?' }, ['Harbour fees', 'The annual fee for a berth is $90.', 'Notwithstanding the above, residents who are over 65 and have kept a boat in the harbour for ten years shall pay half.'], 'You may not leave it free of charge, but if you have kept it here for ten years you will pay half.', ['You may leave it free of charge, because you are over 65.', 'You will pay half only if you have kept your boat in the harbour for one year.']),
  msg('th5_proviso2', 5, 'c_cook', 'memo', { say: 'I should like to put tables on the pavement outside my cafe on Sundays. Is that possible?' }, ['Tables on the pavement', 'Tables may be placed on the pavement from April to October, provided that at least 1.5 meters remain free for people who are walking.', 'No tables may be placed on the pavement on any day when a market is held in the street.'], 'Yes, from April to October, provided that 1.5 meters remain free, and unless a market is held that day.', ['Yes, at any time of the year, provided that 1.5 meters remain free.', 'Yes, from April to October, even on days when a market is held in the street.']),
  check('th5_proviso3', 5, 'c_cook', 'This is the permit for my tables. Please check it against the rule on the pavement.', [P('card', 'Permit', ['Holder|{Nora|@}', 'Valid|April to October', 'Free width|1.0 meters']), N('Tables on the pavement', ['Tables may be placed on the pavement from April to October, provided that at least 1.5 meters remain free for people who are walking.'])], 'Free width', { fix: ['1.5 meters', '2.5 meters'] }),
  msg('th5_final1', 5, 'p_hollis', 'letter', { from: '{Captain Reed|@}', say: 'This letter is from a long-standing resident. Please read it carefully and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'I have been told that the planning hearing may decide the future of the whole harbour, and I am afraid that the old fishing boats will be forced to leave.', 'Could you tell me whether the hearing will consider the harbour as a whole, or only the warehouse?'], 'The hearing concerns only application 31, the warehouse, and the harbour will be discussed at another meeting.', ['The hearing will consider the whole harbour, and the fishing boats will be forced to leave.', 'The hearing concerns only the harbour, and the warehouse will be discussed at another meeting.']),
  msg('th5_final2', 5, 'c_scholar', 'memo', { say: 'If I miss the deadline for my objection by one day, can the council still accept it in an exceptional case?' }, ['Planning objections', 'Objections must reach the planning desk within 21 days of the public notice.', 'An objection that arrives later may be accepted only if the applicant agrees in writing.'], 'Yes, but only if the applicant agrees in writing.', ['Yes, because the council may accept a late objection on any day before the hearing.', 'No. An objection that arrives later can never be accepted.']),
  check('th5_ok1', 5, 'c_scholar', 'I have brought my objection and a copy of the notice. Is everything in order?', [P('letter', 'Objection', ['From|{Professor Hale|@}', 'Application|31', 'Sent on|April 9']), P('note', 'Public notice', ['Application|31', 'Site|Old Cannery']), PLAN5], null),
  check('th5_ok2', 5, 'c_merchant', 'I have sent in my request for the minutes. Please check the register against my copy.', [P('letter', 'Request', ['From|{Mr. Grant|@}', 'Request received|March 3', 'Cost of the work|$320']), P('ledger', 'Register', ['Request received|March 3', 'Cost of the work|$320']), INFO5], null),
  msg('th5_final3', 5, 'p_hollis', 'email', { from: '{Mr. Farrow|@}', subject: 'The hearing is over', say: 'The inspector has written after the hearing. Please read the email and choose the reply.' }, ['Dear colleagues,', 'The council has granted permission for the flats on two conditions: the building may be no higher than three floors, and a new pavement must be built along {Quay|@} Road.', 'Residents who objected have 28 days to appeal. Please write to them today.'], 'I will write to the residents who objected today, and I will tell them that they have 28 days to appeal.', ['I will write to the residents who objected today, and I will tell them that they have 21 days to appeal.', 'I will write to the owner today, and I will tell him that the building may have four floors.']),
  ask('th5_ask1', 5, 'c_girl', 'Excuse me, I think I have made a mistake on my form.', 'Please do not worry. Let me look at it, and we will correct it together.', ['The council may refuse a request if the work would cost more than $450.', 'An appeal must be made within 28 days of the decision letter.']),
  msg('th5_final4', 5, 'p_hollis', 'email', { from: '{Grandma Rose|@}', subject: 'My letter', say: 'A resident has written to say thank you. Please read the email and choose the reply.' }, ['Dear {Mr. Hollis|@},', 'I wish to thank you for your patience last week, when I came three times to ask about the same form.', 'I am eighty-one, and the rules are too difficult for me.'], 'Thank you for your kind words. We are always glad to help, and you may come at any time.', ['Thank you for your kind words. The rules say that you may come only three times.', 'Thank you for your question. The form must be sent to the planning desk within 21 days.']),
];

// ---------------------------------------------------------------------------- template kit

type Field = { id: string; label: string; values: string[] };
const choose = (id: string, rank: number, bank: string, kind: 'speech' | 'phone' | 'email' | 'memo' | 'letter', say?: string): TaskTemplate => ({ id, rank, arch: 'respond', mode: 'choose', kind, bank, ...(say ? { say } : {}) });
const frm = (id: string, rank: number, lines: string[], fields: Field[], say: string): TaskTemplate => ({ id, rank, arch: 'respond', mode: 'form', kind: 'phone', lines, fields, say });
const srt = (id: string, rank: number, say: string, count: [number, number], bins: string[], patterns: [string, string][]): TaskTemplate => ({ id, rank, arch: 'sort', say, count, bins, patterns: patterns.map(([text, bin]) => ({ text, bins: [bin] })) });
const slt = (id: string, rank: number, kind: 'speech' | 'email', say: string, rows: Axis[], cols: Axis[], want: [string, string][], avoid: [string, string][], busy: string[], open?: string[], close?: string[], layout: 'calendar' | 'rooms' = 'calendar'): TaskTemplate => ({
  id, rank, arch: 'respond', mode: 'slot', kind, layout, say, ...(kind === 'speech' && !open ? { open: [say] } : {}), rows: rows.map(({ id: i, label }) => ({ id: i, label })), cols: cols.map(({ id: i, label }) => ({ id: i, label })),
  cellTags: Object.fromEntries([...rows, ...cols].filter((a) => a.tags).map((a) => [a.id, a.tags!])),
  want: want.map(([tag, text]) => ({ tag, text })), avoid: avoid.map(([tag, text]) => ({ tag, text })), busy, ...(open ? { open } : {}), ...(close ? { close } : {}),
});
type CF = { id: string; label: string; values?: string[]; range?: [number, number] | [number, number, number]; fmt?: string; names?: string[]; calc?: string };
/** check: `docs` are [kind, title, field ids or lines]; the first paper is the one that is checked. */
const chk = (id: string, rank: number, say: string, fields: CF[], docs: { kind: CheckDoc['kind']; title: string; fields?: string[]; lines?: string[] }[], wrongable: string[], pWrong = 0.6, person?: string): TaskTemplate => ({
  id, rank, arch: 'check', say, fields, docs, target: 0, pWrong, wrongable, ...(person ? { person } : {}),
});
const HALL_CALLERS = ['{Mr. Grant|@}', '{Captain Reed|@}', '{Nora|@}', '{Big Joe|@}', '{Mrs. Hill|@}', '{Professor Hale|@}'];
const HALL_BUSY = ['Meeting', 'Lunch', '{Mr. Hollis|@}', 'Busy', 'Away'];

// ---------------------------------------------------------------------------- rank 1 banks and templates

const QA_SPEECH1: QaItem[] = [
  qa('Good morning. Can I have a form for a parking permit, please?', 'Sure. Here you are.', 'request', 1, ['It is twenty dollars.', 'No, we are closed on Sunday.']),
  qa('Thank you for your help.', 'You are welcome. Come again.', 'thanks', 1, ['Please write your name here.', 'It is on the first floor.']),
  qa('I am sorry. I am late.', 'That is all right. Please come in.', 'apology', 1, ['It is twelve dollars.', 'You can pay at Desk 3.']),
  qa('Where do I pay the fee?', 'You can pay at the desk next to the door.', 'place', 1, ['It is twelve dollars.', 'The town hall opens at nine.']),
  qa('How much is a dog license?', 'It is twelve dollars.', 'price', 1, ['It is on the second floor.', 'Yes, we are open until five.']),
  qa('Is this the right desk for taxes?', 'Yes, this is the tax desk.', 'confirm', 1, ['It is twenty dollars.', 'Please come back on Monday.']),
  qa('Can you help me with this form?', 'Of course. Please sit down.', 'help', 1, ['It is next to the bank.', 'The fee is twenty dollars.']),
  qa('Hello. I need to pay my tax.', 'Please go to Desk 3. That is the tax desk.', 'direction', 1, ['Yes, you are welcome.', 'The town hall opens at nine.']),
  qa('What is the number of this form?', 'It is number five.', 'number', 1, ['You can pay at the desk next to the window.', 'Yes, please sit down.']),
];
const QA_PHONE1: QaItem[] = [
  qa('Hello. Is this the town hall?', 'Yes, this is the town hall.', 'confirm', 1, ['It is twelve dollars.', 'No, thank you.']),
  qa('Hello. I want to talk to {Mr. Hollis|@}.', 'Just a moment, please.', 'transfer', 1, ['You are welcome.', 'It is on the second floor.']),
  qa('Can I leave a message?', 'Yes, please. Tell me your name.', 'message', 1, ['It is twenty dollars.', 'Please come on Monday.']),
  qa('Who is calling, please?', 'This is {Mr. Grant|@}.', 'name', 1, ['It is next to the bank.', 'Please write your name here.']),
  qa('Thank you for calling.', 'You are welcome. Goodbye.', 'thanks', 1, ['Yes, it is. Can I help you?', 'It is twelve dollars.']),
  qa('Please call me back after lunch.', 'Yes. I will call you after lunch.', 'callback', 1, ['It is on the first floor.', 'No, thank you.']),
  qa('What is your phone number?', 'My number is 4 5 8 2.', 'number', 1, ['You are welcome.', 'It is next to the window.']),
];
const QA_NOTICE1: QaItem[] = [
  qa('The town hall is closed on Monday. Can I come on Monday?', 'No, we are closed on Monday.', 'closed', 1, ['Yes, please come on Monday at nine.', 'Yes, we are open on Monday until five.']),
  qa('Garbage is collected on Tuesday and Friday. Is it collected on Thursday?', 'No, it is collected on Tuesday and Friday.', 'garbage', 1, ['Yes, it is collected on Thursday.', 'No, it is collected on Monday and Thursday.']),
  qa('The town hall opens at 9:00 and closes at 5:00. Is it open at 8:00?', 'No, it opens at nine.', 'hours', 1, ['Yes, it is open at eight.', 'No, it closes at nine.']),
  qa('A dog license is $12, and a parking permit is $20. How much is a parking permit?', 'It is twenty dollars.', 'price', 1, ['It is twelve dollars.', 'It is thirty dollars.']),
  qa('Licenses: Desk 2. Taxes: Desk 3. Housing: Desk 1. Which desk is for taxes?', 'Please go to Desk 3.', 'desk', 1, ['Please go to Desk 2.', 'Please go to Desk 1.']),
  qa('Pay the fee before Friday. Can I pay on Monday?', 'Yes, you can pay on Monday.', 'deadline', 1, ['No, you must pay after Friday.', 'No, you can pay only on Saturday.']),
  qa('The registry is open from 9:00 to 12:00. Is it open at 2:00?', 'No, it is closed at two.', 'hours', 1, ['Yes, it is open at two.', 'No, it opens at two.']),
  qa('You must show your {ID|@} card. Do I need my {ID|@} card?', 'Yes, you must show your {ID|@} card.', 'rule', 1, ['No, you do not need an {ID|@} card.', 'Yes, you must show your dog.']),
];

const T1: TaskTemplate[] = [
  srt('tt1_sort1', 1, 'Please put the papers on the right desks.', [3, 4], ['license', 'tax', 'housing', 'registry', 'waste'], [
    ['A form for a dog license', 'license'], ['A form for a parking permit', 'license'], ['A form to pay tax', 'tax'], ['A bill for tax', 'tax'],
    ['A form for a new apartment', 'housing'], ['The rent of my apartment', 'housing'], ['A new baby in the family', 'registry'], ['We moved to a new address', 'registry'],
    ['The garbage was not collected', 'waste'], ['Please take away our old chairs', 'waste'],
  ]),
  chk('tt1_check_name', 1, 'Please check the name and the address on my form.', [
    { id: 'name', label: 'Name', values: ['{Mr. Grant|@}', '{Nora|@}', '{Big Joe|@}', '{Mrs. Hill|@}'] },
    { id: 'address', label: 'Address', values: ['12 Bridge Street', '21 Bridge Street', '5 Harbour Street', '15 Harbour Street', '8 Station Road', '18 Station Road'] },
  ], [{ kind: 'card', title: 'Form', fields: ['name', 'address'] }, { kind: 'card', title: '{ID|@} card', fields: ['name', 'address'] }], ['name', 'address'], 0.65),
  chk('tt1_check_fee', 1, 'Please check the fee on my receipt.', [
    { id: 'kind', label: 'Item', range: [1, 3], names: ['', 'Dog license', 'Parking permit', 'Market permit'] },
    { id: 'fee', label: 'Fee', calc: 'kind == 1 ? 12 : kind == 2 ? 20 : 30', fmt: '${n}' },
  ], [{ kind: 'invoice', title: 'Receipt', fields: ['kind', 'fee'] }, { kind: 'card', title: 'Fee list', fields: ['kind', 'fee'] }], ['fee'], 0.65),
  chk('tt1_check_date', 1, 'Is the date on my permit the same as on my form?', [
    { id: 'name', label: 'Name', values: ['{Mr. Grant|@}', '{Nora|@}', '{Anna|@}', '{Captain Reed|@}'] },
    { id: 'date', label: 'Date', values: ['June 3', 'June 13', 'July 2', 'July 12', 'August 5', 'August 15'] },
  ], [{ kind: 'card', title: 'Permit', fields: ['name', 'date'] }, { kind: 'card', title: 'Form', fields: ['name', 'date'] }], ['date'], 0.65),
  slt('tt1_slot', 1, 'speech', 'Please book a time for me.', DAYS.slice(0, 4), TIMES, [['mon', 'I can come on Monday.'], ['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'I want to come in the morning.'], ['afternoon', 'I want to come in the afternoon.']], [['mon', 'I cannot come on Monday.'], ['t9', 'I cannot come at nine.'], ['t4', 'I cannot come at four.']], HALL_BUSY),
  choose('tt1_speech', 1, 'speech1', 'speech'),
  choose('tt1_phone', 1, 'phone1', 'phone', 'The telephone is ringing. Please answer the call.'),
  choose('tt1_notice', 1, 'notice1', 'memo'),
  frm('tt1_pad', 1, ['Hello, this is {who}.', 'I want {want}.', 'Please call me back {call}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'want', label: 'About', values: ['a dog license', 'a parking permit', 'a new form'] },
    { id: 'call', label: 'Call back', values: ['after lunch', 'before lunch', 'tomorrow'] },
  ], 'The telephone is ringing. Please write down the message.'),
];

// ---------------------------------------------------------------------------- rank 2 banks and templates

const QA_SPEECH2: QaItem[] = [
  qa('I would like to apply for a student card. What should I do?', 'Please fill in this form, and bring your passport.', 'apply', 2, ['The town hall is closed on Monday.', 'The fee is twelve dollars.']),
  qa('I think there is a mistake on my receipt.', 'I am sorry. Let me look at it.', 'complaint', 2, ['Please come back on Friday.', 'You can pay at Desk 3.']),
  qa('Could you tell me where the registry is?', 'It is on the first floor, next to the stairs.', 'place', 2, ['It is twenty dollars a year.', 'Please fill in this form.']),
  qa('Do I have to pay now?', 'Yes, please pay at the desk next to the door.', 'payment', 2, ['The registry is on the first floor.', 'Please bring your passport.']),
  qa('I have lost my receipt. Can you help me?', 'Of course. Please fill in this form.', 'help', 2, ['The town hall opens at nine.', 'You can pay at the bank.']),
  qa('May I use the telephone?', 'Yes, of course. It is on the desk.', 'permission', 2, ['The fee is thirty dollars.', 'Please sit over there.']),
  qa('Thank you very much. You have been very kind.', 'It was my pleasure. Have a nice day.', 'thanks', 2, ['The form is on the table.', 'You must pay by Friday.']),
  qa('Excuse me, is there someone at this desk?', 'Yes, I am sorry to keep you waiting.', 'attention', 2, ['The permit is valid for one year.', 'The registry is closed today.']),
];
const QA_PHONE2: QaItem[] = [
  qa('Good morning. I would like to speak to the housing desk.', 'I will put you through. Please hold the line.', 'transfer', 2, ['The permit is valid for one year.', 'You are welcome. Goodbye.']),
  qa('Could you tell {Ms. Aldridge|@} that I called?', 'Yes, I will tell her. Please give me your name.', 'message', 2, ['The fee is twenty dollars.', 'The town hall is closed on Sunday.']),
  qa('I am calling about my application. Is {Mr. Hollis|@} in?', 'I am afraid he is out. I can take a message.', 'absent', 2, ['The permit is ready.', 'Please pay at Desk 3.']),
  qa('Could you repeat that number, please?', 'Of course. It is 4 5 8 2.', 'repeat', 2, ['Yes, I will tell her.', 'It is twenty dollars.']),
  qa('Thank you. I will call again tomorrow.', 'All right. Goodbye.', 'closing', 2, ['The form is on the desk.', 'Please fill in this form.']),
  qa('Is the registry open this afternoon?', 'I am sorry. The registry is closed this afternoon.', 'hours', 2, ['The fee is twenty dollars.', 'Please bring your passport.']),
];
const QA_NOTICE2: QaItem[] = [
  qa('Notice: Harbour Road is closed from Monday to Wednesday. Can I drive there on Tuesday?', 'No, the road is closed on Tuesday.', 'road', 2, ['Yes, you can drive there on Tuesday.', 'No, the road is closed on Thursday.']),
  qa('A parking permit costs $20. A late renewal costs $5 more. How much is a late renewal?', 'It is twenty-five dollars.', 'fee', 2, ['It is twenty dollars.', 'It is five dollars.']),
  qa('People who are 18 or older can vote. I am seventeen. Can I vote?', 'No, you must be eighteen or older.', 'vote', 2, ['Yes, you can vote.', 'No, you must be twenty-one.']),
  qa('From June 1, the town hall closes at 4:30 on Fridays. What time does it close on Friday?', 'It closes at 4:30.', 'hours', 2, ['It closes at 5:00.', 'It closes at 6:30.']),
  qa('No loud music before 9:00 or after 10:00 at night. Can I play loud music at eleven at night?', 'No, loud music is not allowed after ten.', 'noise', 2, ['Yes, loud music is allowed until midnight.', 'No, loud music is not allowed after eleven.']),
  qa('A dog license is valid for one year. I got mine on March 3. When does it end?', 'It ends next March 3.', 'valid', 2, ['It ends on September 3.', 'It ends next March 13.']),
  qa('The registry is open on Monday, Wednesday and Friday. Is it open on Tuesday?', 'No, it is open on Monday, Wednesday and Friday.', 'days', 2, ['Yes, it is open on Tuesday.', 'No, it is open on Tuesday and Thursday.']),
  qa('Please bring your passport and a proof of your address. What must I bring?', 'You must bring your passport and a proof of your address.', 'bring', 2, ['You must bring your dog and a receipt.', 'You must bring only your passport.']),
];
const QA_MAIL2: QaItem[] = [
  qa('Dear Sir, I paid $20 for my permit on Monday. Please confirm that I can collect it on Friday.', 'Yes, you can collect your permit on Friday.', 'confirm', 2, ['Yes, you can collect your permit on Monday.', 'Yes, please pay $20 when you collect it on Friday.']),
  qa('Dear Sir, {Ms. Aldridge|@} sees visitors on Tuesday afternoon only. I would like to see her on Tuesday afternoon. May I?', 'Yes, she sees visitors on Tuesday afternoon.', 'meet', 2, ['No, she sees visitors on Thursday afternoon only.', 'Yes, she sees visitors on Tuesday morning.']),
  qa('Dear Sir, please send me a form for a market permit. My address is 8 Mill Street.', 'We will send the form to 8 Mill Street.', 'request', 2, ['We will send the form to 18 Mill Street.', 'We will send the form to 8 Mill Lane.']),
  qa('Dear Sir, thank you for your help last week. Everything was very clear.', 'Thank you for your kind words. We are glad that we could help.', 'thanks', 2, ['We will send the form to you tomorrow.', 'Your permit will end on June 30.']),
  qa('Dear Sir, my tax is due on May 31, but I will be away. May I pay on May 20?', 'Yes, you may pay on May 20.', 'deadline', 2, ['Yes, you may pay on May 31 only.', 'No, you must pay on June 20.']),
  qa('Dear Sir, I cannot come on Wednesday at 2:00. Can we meet on Thursday at the same time?', 'Yes. We can meet on Thursday at 2:00.', 'move', 2, ['Yes. We can meet on Thursday at 4:00.', 'Yes. We can meet on Wednesday at 2:00.']),
];

const T2: TaskTemplate[] = [
  srt('tt2_sort1', 2, 'Please read each paper and put it on the right desk.', [4, 5], ['license', 'roads', 'housing', 'waste', 'registry', 'tax', 'planning', 'elections'], [
    ['An application for a parking permit', 'license'], ['A request to change the name on a license', 'license'], ['A complaint about a hole in the road', 'roads'], ['A broken street lamp near the school', 'roads'],
    ['Please check the roof of our house', 'housing'], ['The heating in our flat does not work', 'housing'], ['Please collect our old furniture on Friday', 'waste'], ['The garbage near the bridge is not collected', 'waste'],
    ['We have moved and must change our address', 'registry'], ['I need a copy of my birth certificate', 'registry'], ['My tax bill is higher than last year', 'tax'], ['I want to pay my tax in two instalments', 'tax'],
    ['I want to build a small garage next to my house', 'planning'], ['I want to put a sign on my shop', 'planning'], ['I want to register to vote', 'elections'], ['Where is my polling station?', 'elections'],
  ]),
  chk('tt2_check_dob', 2, 'Please check my date of birth against my passport.', [
    { id: 'name', label: 'Name', values: ['{Ken|@}', '{Anna|@}', '{Lily|@}', '{Tom|@}'] },
    { id: 'dob', label: 'Date of birth', values: ['March 9', 'March 19', 'May 4', 'May 14', 'October 2', 'October 12'] },
  ], [{ kind: 'card', title: 'Application', fields: ['name', 'dob'] }, { kind: 'card', title: 'Passport', fields: ['name', 'dob'] }], ['dob'], 0.65),
  chk('tt2_check_tax', 2, 'Please check the tax on my bill.', [
    { id: 'value', label: 'Value of the house', range: [10000, 90000, 10000], fmt: '${n,}' },
    { id: 'tax', label: 'Tax', calc: 'value / 50', fmt: '${n,}' },
  ], [{ kind: 'invoice', title: 'Tax bill', fields: ['value', 'tax'] }, { kind: 'note', title: 'Rule', lines: ['The tax is 2 percent of the value of the house.'] }], ['tax'], 0.65),
  chk('tt2_check_addr', 2, 'I live in a new house now. Please check the address on my card.', [
    { id: 'name', label: 'Name', values: ['{Grandpa Sam|@}', '{Mrs. Hill|@}', '{Mr. Grant|@}', '{Nora|@}'] },
    { id: 'address', label: 'Address', values: ['9 Station Road', '19 Station Road', '4 Mill Lane', '14 Mill Lane', '7 Harbour Street', '17 Harbour Street'] },
  ], [{ kind: 'card', title: 'Resident card', fields: ['name', 'address'] }, { kind: 'card', title: 'Moving form', fields: ['name', 'address'] }], ['address'], 0.65),
  chk('tt2_check_fee', 2, 'I paid for a permit. Is the fee on my receipt the same as on your list?', [
    { id: 'kind', label: 'Item', range: [1, 4], names: ['', 'Boat permit', 'Market permit', 'Dog license', 'Parking permit'] },
    { id: 'fee', label: 'Fee', calc: 'kind == 1 ? 45 : kind == 2 ? 60 : kind == 3 ? 12 : 20', fmt: '${n}' },
  ], [{ kind: 'invoice', title: 'Receipt', fields: ['kind', 'fee'] }, { kind: 'card', title: 'Fee list', fields: ['kind', 'fee'] }], ['fee'], 0.65),
  slt('tt2_slot', 2, 'speech', 'Please book a time for me.', DAYS.slice(0, 4), TIMES, [['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'The morning is best for me.'], ['afternoon', 'I can only come in the afternoon.']], [['mon', 'I am not free on Monday.'], ['wed', 'I am not free on Wednesday.'], ['t11', 'I cannot come at eleven.']], HALL_BUSY),
  choose('tt2_speech', 2, 'speech2', 'speech'),
  choose('tt2_phone', 2, 'phone2', 'phone', 'The telephone is ringing. Please answer the call.'),
  choose('tt2_notice', 2, 'notice2', 'memo'),
  choose('tt2_mail', 2, 'mail2', 'email', 'An email came for us. Please read it and answer it.'),
  frm('tt2_pad', 2, ['Hello, this is {who}.', 'There is a problem with {what}, near {where}.', 'Please send someone to look at it {when}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'what', label: 'Problem', values: ['a hole in the road', 'a broken lamp', 'the garbage', 'a loud noise'] },
    { id: 'where', label: 'Place', values: ['the school', 'the bridge', 'the market', 'the station'] },
    { id: 'when', label: 'Come', values: ['today', 'tomorrow', 'on Friday'] },
  ], 'The telephone is ringing. Please write down the message.'),
];

// ---------------------------------------------------------------------------- rank 3 banks and templates

const QA_SPEECH3: QaItem[] = [
  qa('I was wondering if you could help me with my application.', 'Of course. Please sit down, and tell me what you need.', 'help', 3, ['The permit is valid for twelve months.', 'The fee must be paid by March 31.']),
  qa('Would you mind checking my form before I hand it in?', 'Not at all. Let me look at it.', 'check', 3, ['The hearing will be held on Thursday.', 'A fine is reduced by half if it is paid within 14 days.']),
  qa('Excuse me, could you tell me which desk deals with noise?', 'The complaints desk deals with noise. It is on the first floor.', 'direction', 3, ['The tax is two percent of the assessed value.', 'You may vote by proxy if you are abroad.']),
  qa('I am afraid that I did not understand the letter that I received.', 'I am sorry about that. Let me explain it to you.', 'explain', 3, ['The council meets on the first Tuesday of the month.', 'Large items must be booked a week before.']),
  qa('Would it be possible to speak to someone in charge of taxes?', 'Certainly. I will ask {Ms. Okafor|@} to come.', 'request', 3, ['The permit costs sixty dollars for the first stall.', 'Residents over 65 do not need two years in the town.']),
  qa('I should like to thank you for your patience.', 'It was no trouble. I am glad to help.', 'thanks', 3, ['The inspector will visit on Monday.', 'The election will be held on October 12.']),
  qa('Could you give me a receipt, please?', 'Certainly. Here is your receipt.', 'receipt', 3, ['The deadline for objections is in three weeks.', 'The hearing will be held in Room 2.']),
  qa('I am sorry to trouble you again. I have one more question.', 'It is no trouble at all. Please ask.', 'question', 3, ['The garbage is collected on Tuesday and Friday.', 'The fine is fifty dollars.']),
];
const QA_PHONE3: QaItem[] = [
  qa('Good morning. This is {Mr. Grant|@}. I cannot come on Tuesday. Can I come on Thursday instead?', 'Yes. I will move your appointment to Thursday.', 'move', 3, ['Yes. I will move your appointment to Wednesday.', 'Yes. I will keep your appointment on Tuesday.']),
  qa('I have an appointment at 11:00 on Wednesday, but I shall be late. May I come at noon?', 'Yes. I will tell the officer that you will come at noon.', 'late', 3, ['Yes. I will tell the officer that you will come at 11:00.', 'Yes. I will tell the officer that you will come on Thursday.']),
  qa('Hello. I am calling about the stall permit that I applied for last week. Has it been approved?', 'I will check, and I will call you back this afternoon.', 'status', 3, ['The fee for a second stall is forty dollars.', 'The market is held on Saturdays.']),
  qa('Please tell {Ms. Okafor|@} that I paid the first part of my tax on Monday.', 'Yes, I will tell her that you paid the first part on Monday.', 'message', 3, ['Yes, I will tell her that you paid the second part on Monday.', 'Yes, I will tell her that you paid the first part on Friday.']),
  qa('This is {Nora|@}. My permit ends at the end of June. How can I renew it?', 'Please fill in the renewal form and pay the fee before the end of June.', 'renew', 3, ['Please fill in the form and bring it to the hearing.', 'Please pay the fee after the end of June.']),
  qa('Could you send the form for the rent subsidy to 14 Mill Lane?', 'Yes, I will send the form to 14 Mill Lane.', 'send', 3, ['Yes, I will send the form to 41 Mill Lane.', 'Yes, I will send the form to 14 Mill Road.']),
  qa('Hello, I would like to complain about the noise from the bar next to my shop.', 'I am sorry to hear that. Please send us a written complaint.', 'complaint', 3, ['Thank you. The permit will be ready on Friday.', 'The tax must be paid by March 31.']),
  qa('Thank you for your help. I will come to the town hall on Friday.', 'You are welcome. We shall see you on Friday.', 'closing', 3, ['You are welcome. We shall see you on Monday.', 'Thank you. The permit is valid for twelve months.']),
];
const QA_NOTICE3: QaItem[] = [
  qa('A permit is valid for 12 months. Mine started on May 1. Until when is it valid?', 'It is valid until the end of next April.', 'valid', 3, ['It is valid until the end of October.', 'It is valid until next May 31.']),
  qa('A fine that is paid within 14 days is reduced by half. My fine is $50, and I paid it after 10 days. How much did I pay?', 'You paid $25, because you paid within 14 days.', 'fine', 3, ['You paid $50, because you paid within 14 days.', 'You paid $25, because you paid after 14 days.']),
  qa('Large items are collected only if you book at least 7 days before. I booked on Monday for the following Friday. Will my fridge be collected?', 'Yes, because you booked more than seven days before.', 'waste', 3, ['No, because you booked less than seven days before.', 'Yes, because you booked on Friday.']),
  qa('Hearings are held on Tuesdays and Thursdays at 2:00. Can my hearing be on Wednesday?', 'No. Hearings are held only on Tuesdays and Thursdays.', 'hearing', 3, ['Yes. Hearings are held on Wednesdays at 2:00.', 'No. Hearings are held only on Mondays and Fridays.']),
  qa('Building work is allowed from 8:00 to 18:00 on weekdays. Can my builder start at 7:30 on Wednesday?', 'No. Building work cannot start before eight on weekdays.', 'noise', 3, ['Yes. Building work can start at any time on weekdays.', 'No. Building work cannot start before nine on weekdays.']),
  qa('Residents must register by September 14 in order to vote. May I register on September 20?', 'No. You must register by September 14.', 'election', 3, ['Yes. You may register until September 30.', 'No. You must register by September 4.']),
  qa('Boats up to 7 meters pay $90 a year, and longer boats pay $140. My boat is 8 meters long. What do I pay?', 'You pay $140, because your boat is longer than 7 meters.', 'fee', 3, ['You pay $90, because your boat is longer than 7 meters.', 'You pay $140, because your boat is shorter than 7 meters.']),
  qa('If you lose your permit, a new one is free. If it is damaged, a new one costs $10. My permit was damaged. What do I pay?', 'You pay $10, because your permit was damaged.', 'permit', 3, ['You pay nothing, because your permit was damaged.', 'You pay $10, because your permit was lost.']),
];
const QA_MAIL3: QaItem[] = [
  qa('Dear Sir, I paid the first part of my property tax on March 20. Must the second part also be paid by March 31?', 'The second part is not due until September 30, so you do not have to pay it by March 31.', 'tax', 3, ['The second part is due on March 31, so you must pay it now.', 'The second part is not due until September 30, so you must pay it by March 31.']),
  qa('Dear {Ms. Okafor|@}, I would like to move my appointment from Tuesday at 11:00 to Thursday at the same time. Is that possible?', 'Yes. We can move your appointment to Thursday at 11:00.', 'move', 3, ['Yes. We can move your appointment to Thursday at 1:30.', 'Yes. We can keep your appointment on Tuesday at 11:00.']),
  qa('Dear Sir, I suggest that the town build a play area next to the market. Many families come on Saturdays.', 'Thank you for your suggestion. We will send it to the council.', 'idea', 3, ['Thank you for your suggestion. We have built a play area next to the market.', 'Thank you for your suggestion. The council cannot meet on Saturdays.']),
  qa('Dear Sir, the street lamp outside my house has not worked for a month. Please repair it.', 'We are sorry about the lamp. We will send someone to repair it this week.', 'repair', 3, ['We are sorry about the lamp. Please pay the fee at the tax desk.', 'We are sorry about the lamp. It will be repaired by the owner of the house.']),
  qa('Dear Sir, I could not pay my fine within 14 days. Do I still have to pay the full amount?', 'Yes. Only a fine that is paid within 14 days is reduced by half.', 'fine', 3, ['No. A fine is reduced by half at any time.', 'Yes. Only a fine that is paid within 4 days is reduced by half.']),
  qa('Dear Sir, thank you for the quick answer to my question about my permit.', 'Thank you for your kind words. We are glad that we could help.', 'thanks', 3, ['Thank you for your question. The permit costs sixty dollars.', 'Thank you for your message. The hearing is on Tuesday.']),
  qa('Dear Sir, I will be abroad on election day. May somebody vote for me?', 'Yes. You may ask another person to vote for you, but the form must reach us by October 5.', 'proxy', 3, ['Yes. You may ask another person to vote for you, and the form may reach us after October 5.', 'No. Only residents who are ill may ask another person to vote.']),
  qa('Dear Sir, my neighbour is cutting down a large tree. Is that allowed?', 'Please send us the address, and an officer will go and look at the tree.', 'tree', 3, ['Please send us the address, and you must pay a fine of $50.', 'Trees may always be cut down, so there is nothing to do.']),
];
const QA_RULE3: QaItem[] = [
  qa('A rent subsidy is for households with an income below $24,000 who have lived here for at least two years. Our income is $20,000, and we have lived here for four years. Are we eligible?', 'Yes. Your income is below $24,000, and you have lived here for more than two years.', 'subsidy', 3, ['No. Your income is above $24,000.', 'No. You have not lived here for two years.']),
  qa('Residents over 65 do not need to have lived here for two years to ask for a rent subsidy. I am 70 and moved here last month, and my income is $15,000. Am I eligible?', 'Yes. You are over 65, so you do not need two years in the town.', 'subsidy', 3, ['No. You must live here for two years before you can apply.', 'No. Residents over 65 cannot apply for the subsidy.']),
  qa('Owners of another property are not eligible for a rent subsidy. I rent a flat and own a small shop, and my income is $18,000. Am I eligible?', 'No. You own another property, so you are not eligible.', 'subsidy', 3, ['Yes. Your income is below $24,000, so you are eligible.', 'No. Your income is too low.']),
  qa('A stall permit is refused if the applicant has unpaid fines. I paid my last fine yesterday. May I apply for a stall permit?', 'Yes. You have no unpaid fines now, so you may apply.', 'permit', 3, ['No. You must wait one year after paying a fine.', 'Yes, but you must pay the fine again.']),
  qa('Early payment of the property tax by March 31 earns a discount of 3 percent. I paid on April 2. Do I receive the discount?', 'No. The discount is only for payment by March 31.', 'discount', 3, ['Yes. The discount is for payment until April 30.', 'Yes. The discount is 30 percent.']),
  qa('A person who is 18 or older on election day can vote. I shall be 18 on election day. Can I vote?', 'Yes. You will be 18 on election day, so you can vote.', 'vote', 3, ['No. You must be 18 a year before election day.', 'No. You must be 21 on election day.']),
  qa('A dog license is $12 for the first dog and $8 for each other dog. I have two dogs. How much must I pay?', 'You must pay $20, which is $12 and $8.', 'fee', 3, ['You must pay $24, which is twice $12.', 'You must pay $16, which is twice $8.']),
  qa('A hearing must be requested within 14 days of the decision. My decision letter is dated May 1, and today is May 20. May I still request a hearing?', 'No. More than 14 days have passed since the decision.', 'hearing', 3, ['Yes. You may request a hearing within 30 days.', 'Yes. You have until May 30.']),
];

const T3: TaskTemplate[] = [
  srt('tt3_sort1', 3, 'The morning post is here. Please put each paper on the desk that deals with it.', [4, 5], ['license', 'tax', 'housing', 'waste', 'roads', 'complaints', 'planning'], [
    ['A request for a stall permit for the spring market', 'license'], ['An application to renew a boat permit', 'license'], ['A letter about paying the property tax in two instalments', 'tax'], ['A question about the discount for early payment', 'tax'],
    ['A tenant who says the landlord has not repaired the heating', 'housing'], ['An application for a rent subsidy for a household of four', 'housing'], ['A request for the collection of a broken fridge', 'waste'], ['A question about where to put glass bottles', 'waste'],
    ['A complaint about a street lamp that does not work', 'roads'], ['A request to close the road on market days', 'roads'], ['A complaint about the noise from a bar', 'complaints'], ['A complaint that a stall blocked a shop entrance', 'complaints'],
    ['A plan to build a second floor on a house', 'planning'], ['A request to cut down a large tree', 'planning'],
  ]),
  srt('tt3_sort2', 3, 'These papers concern hearings, elections and the harbour. Please read each one with care.', [4, 4], ['hearings', 'elections', 'harbour', 'ideas', 'complaints'], [
    ['I wish to appeal against the refusal of my permit', 'hearings'], ['I would like to ask for a hearing about my fine', 'hearings'], ['I want to register as a voter', 'elections'], ['My sister wants to vote by proxy because she is abroad', 'elections'],
    ['I want to rent a place for my boat in the harbour', 'harbour'], ['What is the fee for a boat longer than 7 meters?', 'harbour'], ['I suggest that the town plant trees on Harbour Road', 'ideas'], ['I suggest a play area next to the market', 'ideas'],
    ['The street lamp near my house has not worked for a month', 'complaints'], ['My neighbour plays loud music at night', 'complaints'],
  ]),
  chk('tt3_check_fee', 3, 'Please check the fee on this form against the rule.', [
    { id: 'stalls', label: 'Stalls', range: [1, 4] },
    { id: 'fee', label: 'Fee', calc: '60 + (stalls - 1) * 40', fmt: '${n}' },
  ], [{ kind: 'invoice', title: 'Application', fields: ['stalls', 'fee'] }, { kind: 'note', title: 'Market permits', lines: ['The first stall costs $60, and each extra stall costs $40.'] }], ['fee'], 0.7),
  chk('tt3_check_tax', 3, 'Please check the tax on my bill. The rule is 2 percent of the value.', [
    { id: 'value', label: 'Assessed value', range: [20000, 90000, 10000], fmt: '${n,}' },
    { id: 'tax', label: 'Tax', calc: 'value / 50', fmt: '${n,}' },
  ], [{ kind: 'invoice', title: 'Tax bill', fields: ['value', 'tax'] }, { kind: 'note', title: 'Property tax', lines: ['The tax is 2 percent of the assessed value.'] }], ['tax'], 0.7),
  chk('tt3_check_fine', 3, 'I paid my fine within a week. Please check my receipt.', [
    { id: 'fine', label: 'Fine', range: [30, 90, 20], fmt: '${n}' },
    { id: 'paid', label: 'Paid', calc: 'fine / 2', fmt: '${n}' },
  ], [{ kind: 'invoice', title: 'Receipt', fields: ['fine', 'paid'] }, { kind: 'note', title: 'Fines', lines: ['A fine that is paid within 14 days is reduced by half.'] }], ['paid'], 0.7),
  chk('tt3_check_date', 3, 'Is the date of the work the same on the notice and in the letter?', [
    { id: 'street', label: 'Street', values: ['Harbour Road', 'Bridge Street', 'Mill Lane', 'Station Road'] },
    { id: 'begins', label: 'Work begins', values: ['April 3', 'April 4', 'May 6', 'May 16', 'June 2', 'June 12'] },
  ], [{ kind: 'note', title: 'Notice', fields: ['street', 'begins'] }, { kind: 'letter', title: 'Letter', fields: ['street', 'begins'] }], ['begins'], 0.7),
  slt('tt3_slot1', 3, 'speech', 'Please book a time for me with an officer.', DAYS.slice(0, 4), TIMES2, [['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'I would like to come in the morning.'], ['afternoon', 'I can come only in the afternoon.']], [['mon', 'I cannot come on Monday.'], ['wed', 'I am away on Wednesday.'], ['t9', 'I cannot come at 9:30.']], HALL_BUSY),
  slt('tt3_slot2', 3, 'email', 'A request for an appointment has arrived. Please look at the calendar.', DAYS.slice(0, 4), TIMES2, [['tue', 'I would like to see someone on Tuesday.'], ['thu', 'I would like to see someone on Thursday.'], ['morning', 'The morning is best for me.'], ['afternoon', 'I am free in the afternoon.']], [['mon', 'I am not free on Monday.'], ['wed', 'I am not free on Wednesday.'], ['t3', 'I cannot come at 3:00.']], HALL_BUSY, ['Dear {Mr. Hollis|@},'], ['Yours sincerely, {Mr. Grant|@}']),
  frm('tt3_pad1', 3, ['Good morning. This is {who}.', 'The bill for {street} is ready.', 'Please send the letters {when}.'], [
    { id: 'who', label: 'Caller', values: ['{Ms. Okafor|@}', '{Ms. Aldridge|@}', '{Mr. Farrow|@}'] },
    { id: 'street', label: 'Street', values: ['Harbour Street', 'Bridge Street', 'Mill Lane', 'Station Road'] },
    { id: 'when', label: 'Send the letters', values: ['on Tuesday', 'on Thursday', 'on Friday'] },
  ], 'The telephone is ringing. Listen carefully, please, and write the message.'),
  frm('tt3_pad2', 3, ['Hello. This is {who}.', 'The inspection of {what} is on {day} at {time}.', 'Please tell {person}.'], [
    { id: 'who', label: 'Caller', values: ['{Mr. Farrow|@}', '{Ms. Aldridge|@}', '{Ms. Okafor|@}'] },
    { id: 'what', label: 'What', values: ['the school roof', 'the market stalls', 'the harbour wall', 'the old fridge'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Thursday', 'Friday'] },
    { id: 'time', label: 'Time', values: ['ten', 'eleven', 'two', 'four'] },
    { id: 'person', label: 'Tell', values: ['the owner', 'the manager', 'the mayor'] },
  ], 'Another call. Listen carefully, please, and write the message.'),
  choose('tt3_speech', 3, 'speech3', 'speech'),
  choose('tt3_phone', 3, 'phone3', 'phone', 'The telephone is ringing. Please listen carefully.'),
  choose('tt3_notice', 3, 'notice3', 'memo'),
  choose('tt3_mail', 3, 'mail3', 'email', 'An email came for us. Please read it and answer it.'),
  choose('tt3_rule', 3, 'rule3', 'memo'),
];

// ---------------------------------------------------------------------------- rank 4 banks and templates

const QA_SPEECH4: QaItem[] = [
  qa('I should like to speak to someone about a decision that was made last week, if that is possible.', 'Certainly. Please tell me which department made the decision.', 'request', 4, ['The grant is available only for houses built before 1980.', 'The bid must reach us by noon on Friday.']),
  qa('I have been waiting for more than an hour, and I have an appointment with {Mr. Farrow|@} at eleven.', 'I apologize for the delay. I will tell him that you are here.', 'complaint', 4, ['A late renewal costs five dollars more.', 'The council is not obliged to accept the lowest bid.']),
  qa('I am afraid that I have filled in the wrong form. What should I do now?', 'Please do not worry. I will give you the right one, and you can copy what you have written.', 'problem', 4, ['The appeal must state the grounds for it.', 'Nominations close on September 1.']),
  qa('Could you possibly explain why my application was refused?', 'Of course. The reasons are given in the letter, and I can go through them with you.', 'explain', 4, ['The hearing will take place in the council chamber.', 'The deposit must be returned within thirty days.']),
  qa('I should like to make a donation to the new play area. To whom should I give it?', 'Thank you. You may give it to {Ms. Okafor|@} at the tax desk, and she will give you a receipt.', 'donation', 4, ['A tree with a wide trunk may not be cut down.', 'An event for more than 200 people needs a permit.']),
  qa('I came on the wrong day, I am afraid. Is there anybody who could help me now?', 'Let me see. I will ask a colleague whether he can spare a few minutes.', 'help', 4, ['The grant must be approved before the work begins.', 'Bids that arrive late will not be opened.']),
  qa('Would you be kind enough to tell me when the council will make its decision?', 'The council will decide at its next meeting, and we shall write to you the same week.', 'date', 4, ['The appeal fee will be refunded if the appeal succeeds.', 'The flood warning has been withdrawn.']),
  qa('Thank you so much. I do not know what I would have done without your help.', 'It was a pleasure. Please do not hesitate to come back if you have any more questions.', 'thanks', 4, ['The deposit may be reduced only if the cost is shown in writing.', 'The nomination needs ten signatures.']),
];
const QA_PHONE4: QaItem[] = [
  qa('Good afternoon. This is {Captain Reed|@}. My appeal will be heard on Thursday, I think. Could you tell me the time and the room?', 'The hearing is on Thursday at 2:00 in Room 2, and we will send you a letter.', 'hearing', 4, ['The hearing is on Thursday at 2:00 in the council chamber, and we will send you a letter.', 'The hearing is on Tuesday at 2:00 in Room 2, and we will send you a letter.']),
  qa('Hello, this is {Mrs. Hill|@}. I would like to know whether my grant has been approved. My number is 4 5 8 2.', 'We will check, and {Ms. Aldridge|@} will call you back on 4 5 8 2.', 'status', 4, ['We will check, and {Ms. Aldridge|@} will call you back on 4 5 2 8.', 'We will check, and {Ms. Aldridge|@} will call you back on 4 8 5 2.']),
  qa('My bid for the fences was posted on Monday. Did it arrive before noon on May 20?', 'We will check the register and tell you this afternoon whether it arrived before noon on May 20.', 'tender', 4, ['We will check the register and tell you this afternoon whether it arrived before noon on May 2.', 'We will check the register and tell you this afternoon whether it arrived after noon on May 20.']),
  qa('Could you tell {Mr. Farrow|@} that I shall not be able to meet him on Thursday, but that I can come on Friday at ten?', 'Yes, I will tell him that you cannot come on Thursday, but that you can come on Friday at ten.', 'message', 4, ['Yes, I will tell him that you cannot come on Friday, but that you can come on Thursday at ten.', 'Yes, I will tell him that you cannot come on Thursday, but that you can come on Friday at two.']),
  qa('I am calling about the flood warning. Will Harbour Road be closed tonight?', 'It will be closed at 9:00 in the evening if the river rises above three meters.', 'flood', 4, ['It will be closed at 9:00 in the morning if the river rises above three meters.', 'It will be closed at 9:00 in the evening if the river rises above four meters.']),
  qa('Hello. I should like to nominate myself for the harbour council. What do I have to do?', 'You must collect ten signatures, and your nomination must reach us by September 1.', 'nomination', 4, ['You must collect twenty signatures, and your nomination must reach us by September 1.', 'You must collect ten signatures, and your nomination must reach us by September 11.']),
  qa('Hello. This is {Nora|@}. My permit for the fish van was due to be issued on Monday, but I have not received it.', 'I am sorry about the delay. I will find out why and call you back today.', 'delay', 4, ['The fee for the fish van permit is $120 a year.', 'You will need a food-safety certificate.']),
  qa('This is {Professor Hale|@}. I should like to withdraw my nomination. Is that still possible?', 'Yes, but please put your request in writing, and we will confirm that it has been received.', 'withdraw', 4, ['Yes, but the nominations closed on September 1, so you must pay a fine.', 'No, the council has already adopted the proposal.']),
];
const QA_NOTICE4: QaItem[] = [
  qa('A refusal may be appealed within 28 days of the date of the decision letter. My letter is dated March 1. Until when may I appeal?', 'You may appeal until March 29.', 'appeal', 4, ['You may appeal until April 1.', 'You may appeal until March 15.']),
  qa('A grant is available only if work has not begun before approval. My builder began the work last week, and my grant is not yet approved. Can I still receive the grant?', 'No. Work must not begin before the grant has been approved.', 'grant', 4, ['Yes. The grant can be approved after the work has begun.', 'No. A grant is available only for work that has already been finished.']),
  qa('Bids that arrive after noon on May 20 will not be opened. My bid arrived at 12:05. Will it be opened?', 'No. Your bid arrived after noon, so it will not be opened.', 'tender', 4, ['Yes. Bids that arrive within an hour of noon will be opened.', 'No. Your bid arrived before noon, so it will not be opened.']),
  qa('A tree with a trunk wider than 30 centimeters may not be cut without permission. My tree has a trunk of 25 centimeters. May I cut it?', 'Yes. Your tree is not wider than 30 centimeters, so you do not need permission.', 'tree', 4, ['No. Every tree needs permission before it can be cut.', 'Yes, but only if an inspector confirms that the tree is dangerous.']),
  qa('A candidate needs ten signatures. I have collected eleven. Do I have enough?', 'Yes. You have more than the ten that are needed.', 'nomination', 4, ['No. You need twelve signatures.', 'No. Each signature must be confirmed by the mayor.']),
  qa('An event for more than 200 people needs a permit requested 30 days in advance. Our fair is in 20 days, and about 250 people will come. Is it too late?', 'Yes. A permit must be requested at least 30 days in advance, so it is too late.', 'event', 4, ['No. A permit can be requested up to 10 days before an event.', 'Yes. An event for 250 people needs a permit requested 20 days in advance.']),
  qa('A landlord must return the deposit within 30 days. My tenant left on April 2. By when must I return the deposit?', 'You must return it by May 2.', 'deposit', 4, ['You must return it by April 30.', 'You must return it by June 2.']),
  qa('If the river rises above 3 meters, the road will be closed. The river is expected to reach 2.8 meters tonight. Will the road be closed?', 'No. The river is expected to stay below 3 meters, so the road will stay open.', 'flood', 4, ['Yes. The river will rise above 3 meters, so the road will be closed.', 'No. The road will be closed only if the river falls below 3 meters.']),
];
const QA_MAIL4: QaItem[] = [
  qa('Dear Sir, my builder can start work on my roof next week, but my grant is not yet approved. May he begin now?', 'No. Work must not begin before the grant has been approved, or you will lose the grant.', 'grant', 4, ['Yes. He may begin now, and the grant will be approved later.', 'No. The grant can be approved only after the work has been finished.']),
  qa('Dear Sir, our bid is the lowest of the five. Please confirm that we will be given the contract.', 'We cannot confirm that yet, because the council is not obliged to accept the lowest bid.', 'tender', 4, ['We confirm that you will be given the contract, because you offered the lowest price.', 'We cannot confirm that, because late bids will not be opened.']),
  qa('Dear Sir, I have found only nine people who will sign my nomination, and nominations close on September 1. May I still stand?', 'You need one more signature, and you have until September 1 to find it.', 'nomination', 4, ['You may stand with nine signatures, because you are over 21.', 'You need ten more signatures, and nominations have already closed.']),
  qa('Dear Sir, my landlord wants to keep $300 of my deposit, but he has not shown me any bill. Is this allowed?', 'No. He may keep money for damage only if he can show you the cost in writing.', 'deposit', 4, ['Yes. A landlord may keep any part of the deposit that he wishes.', 'No. A landlord must return the whole deposit, whatever the damage.']),
  qa('Dear Sir, my permit was refused on April 2 because I owed a fine, but I paid it on April 5. Can I appeal?', 'You may appeal until April 30, but since you have paid the fine, you could also apply again.', 'appeal', 4, ['You may appeal until May 30, but you cannot apply again.', 'You cannot appeal, because the fine was unpaid on April 2.']),
  qa('Dear Sir, I wish to thank your young colleague, who explained the rules for my grant very clearly.', 'Thank you for your kind message. I am glad that he could help you, and I will tell him.', 'thanks', 4, ['Thank you for your kind message. I am sorry that the work began before the grant was approved.', 'Thank you for your question. The grant is available only for houses built before 1980.']),
  qa('Dear Sir, we expect 150 people at our harvest party at the harbour, and no road will be closed. Do we need a permit?', 'No. An event for fewer than 200 people needs a permit only if a road has to be closed.', 'event', 4, ['Yes. Every event at the harbour needs a permit requested 30 days in advance.', 'No. A permit is needed only for events with more than 150 people.']),
  qa('Dear Sir, an inspector wrote that the oak in front of my shop is dangerous. May I cut it down now?', 'Yes. The inspector has confirmed in writing that it is dangerous, which is the exception to the rule.', 'tree', 4, ['No. A protected tree may never be cut down, even if it is dangerous.', 'Yes. Any tree may be cut down without permission.']),
];
const QA_RULE4: QaItem[] = [
  qa('A repair grant needs a house built before 1980 and an owner who lives in it. My house was built in 1965, and I rent it to a family. Do I qualify?', 'No. The owner must live in the house.', 'grant', 4, ['Yes. The house was built before 1980.', 'No. The house must have been built after 1980.']),
  qa('The income limit for a repair grant is $40,000, unless the house is a listed building. My house is listed, and I earn $55,000. Do I qualify?', 'Yes. The income limit does not apply to a listed building.', 'grant', 4, ['No. Your income is above $40,000.', 'No. Only houses that are not listed may receive a grant.']),
  qa('A candidate must be at least 21, must have lived in the town for a year and needs ten signatures. I am 25, have lived here for two years and have twelve signatures. May I stand?', 'Yes. You meet all three conditions.', 'nomination', 4, ['No. You need twenty signatures.', 'No. You must have lived here for three years.']),
  qa('An appeal must be made within 28 days and must state the grounds. I wrote on day 20, but I gave no reason. Is my appeal valid?', 'No. You wrote within 28 days, but you did not state the grounds.', 'appeal', 4, ['Yes. You wrote within 28 days.', 'No. You wrote after the 28 days had ended.']),
  qa('A tree with a trunk wider than 30 centimeters is protected, unless an inspector confirms in writing that it is dangerous. My tree is 45 centimeters wide and not dangerous. May I cut it?', 'No. The tree is protected, and the exception does not apply.', 'tree', 4, ['Yes. Any tree on your own land may be cut.', 'Yes. The inspector has confirmed that the tree is dangerous.']),
  qa('A food van needs a food-safety certificate and proof of insurance. I have a certificate but no insurance. May I receive a permit?', 'No. You need proof of insurance as well.', 'permit', 4, ['Yes. A certificate is enough.', 'No. You need proof of insurance, but a certificate is not needed.']),
  qa('A landlord may keep part of a deposit only if he can show the cost of the damage in writing. My landlord has shown me a bill for $120. May he keep $120?', 'Yes. He has shown the cost in writing.', 'deposit', 4, ['No. He may keep nothing without a court order.', 'No. He may keep only $12.']),
  qa('Bids must arrive by noon in a sealed envelope. Mine arrived at 11:30 in an open envelope. Will it be opened?', 'No. The envelope was not sealed.', 'tender', 4, ['Yes. It arrived before noon.', 'No. It arrived after noon.']),
];

const T4: TaskTemplate[] = [
  srt('tt4_sort1', 4, 'The morning post includes appeals and requests. Please send each one to the officer who must deal with it.', [4, 5], ['hearings', 'complaints', 'planning', 'tax', 'roads', 'elections'], [
    ['An appeal against the refusal to let a resident build a second floor', 'planning'], ['An application to cut down a protected tree', 'planning'], ['An appeal against a fine of $200 for leaving garbage in the street', 'hearings'], ['A request for a hearing about a refused permit', 'hearings'],
    ['A complaint that the tax office sent a bill to the wrong address', 'complaints'], ['A complaint about building work that began before eight', 'complaints'], ['A letter explaining why the property tax will be paid six weeks late', 'tax'], ['A request to pay a tax debt in instalments', 'tax'],
    ['A request to close Mill Lane on the afternoon of the school fair', 'roads'], ['A report that the harbour road is flooded', 'roads'], ['The nomination papers of a candidate for the harbour election', 'elections'], ['A question about where the polling station will be', 'elections'],
  ]),
  srt('tt4_sort2', 4, 'A heavy post bag. Please read each paper properly, and put it on the right desk.', [4, 5], ['harbour', 'waste', 'housing', 'ideas', 'license'], [
    ['An application to place a fishing boat in the new part of the harbour', 'harbour'], ['A question about the harbour fees for next year', 'harbour'], ['A complaint that the old fridges have not been collected', 'waste'], ['A request to collect the old boxes', 'waste'],
    ['A request for a grant to repair a roof', 'housing'], ['A tenant who wants the deposit to be returned', 'housing'], ['A suggestion that the council should plant trees along the road', 'ideas'], ['A suggestion to build a small market hall', 'ideas'],
    ['An application for a permit for a food van', 'license'], ['An application for a permit for an event at the harbour', 'license'],
  ]),
  chk('tt4_check_appeal', 4, 'Could you check that the appeal and the fee are as the rules say?', [
    { id: 'decision', label: 'Decision dated', values: ['March 1', 'April 2', 'May 6', 'June 3'] },
    { id: 'fee', label: 'Fee paid', range: [10, 50, 10], fmt: '${n}' },
  ], [{ kind: 'letter', title: 'Appeal', fields: ['decision', 'fee'] }, { kind: 'note', title: 'Appeals', lines: ['The fee for an appeal is $30.'] }], ['fee'], 0.7),
  chk('tt4_check_grant', 4, 'Please check the year in which my house was built against the property record.', [
    { id: 'owner', label: 'Owner', values: ['{Big Joe|@}', '{Mrs. Hill|@}', '{Grandpa Sam|@}', '{Nora|@}'] },
    { id: 'built', label: 'Built in', values: ['1952', '1925', '1961', '1916', '1974', '1947'] },
  ], [{ kind: 'card', title: 'Form', fields: ['owner', 'built'] }, { kind: 'card', title: 'Property record', fields: ['owner', 'built'] }], ['built'], 0.7),
  chk('tt4_check_nom', 4, 'These are my nomination papers. Can you check the number of signatures?', [
    { id: 'candidate', label: 'Candidate', values: ['{Ken|@}', '{Professor Hale|@}', '{Mr. Grant|@}', '{Nora|@}'] },
    { id: 'signatures', label: 'Signatures', range: [8, 14] },
  ], [{ kind: 'card', title: 'Nomination', fields: ['candidate', 'signatures'] }, { kind: 'ledger', title: 'Register', fields: ['candidate', 'signatures'] }], ['signatures'], 0.7),
  chk('tt4_check_dep', 4, 'My landlord sent me this letter. Is the amount that he kept the same as in his bill?', [
    { id: 'deposit', label: 'Deposit', values: ['$800', '$900'] },
    { id: 'kept', label: 'Kept for damage', range: [50, 200, 50], fmt: '${n}' },
  ], [{ kind: 'letter', title: 'Letter', fields: ['deposit', 'kept'] }, { kind: 'invoice', title: 'Bill for damage', fields: ['kept'] }], ['kept'], 0.7),
  slt('tt4_slot1', 4, 'speech', 'Please book a time for me with an officer.', DAYS.slice(0, 4), TIMES2, [['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'I can come only in the morning.'], ['afternoon', 'I can come only in the afternoon.']], [['mon', 'I cannot come on Monday.'], ['thu', 'I cannot come on Thursday.'], ['t9', 'I cannot come at 9:30.'], ['t3', 'I cannot come at three.']], HALL_BUSY),
  slt('tt4_slot2', 4, 'email', 'A request for a hearing has arrived. Please look at the plan and choose the room and the time.', ROOMS, HEARCOLS, [['large', 'There will be about 40 people, so we need the council chamber.'], ['small', 'We shall be only five people, so a small room is enough.'], ['afternoon', 'We can come in the afternoon.'], ['morning', 'We can come only in the morning.']], [['tue', 'We cannot come on Tuesday.'], ['thu', 'We cannot come on Thursday.']], HALL_BUSY, ['Dear Sir,', 'We would like to ask for a hearing about a refusal.'], ['Yours faithfully, {Mr. Grant|@}'], 'rooms'),
  frm('tt4_pad1', 4, ['Good afternoon. This is {who}.', 'The meeting about {what} will be held in {room} on {day} at {time}.', 'Please bring {bring}.'], [
    { id: 'who', label: 'Caller', values: ['{Ms. Aldridge|@}', '{Ms. Okafor|@}', '{Mr. Farrow|@}'] },
    { id: 'what', label: 'Meeting', values: ['the tender', 'the grant', 'the appeal', 'the election'] },
    { id: 'room', label: 'Room', values: ['Room 1', 'Room 2', 'the council chamber'] },
    { id: 'day', label: 'Day', values: ['Tuesday', 'Wednesday', 'Thursday'] },
    { id: 'time', label: 'Time', values: ['9:30', '11:00', '1:30', '3:00'] },
    { id: 'bring', label: 'Bring', values: ['the papers', 'the record', 'the letters', 'the file'] },
  ], 'The telephone is ringing. Please listen carefully and write the message.'),
  frm('tt4_pad2', 4, ['Hello, this is {who}.', 'My {what} was sent by post on {day}.', 'Please tell me whether it arrived before {when}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'what', label: 'Sent', values: ['bid', 'appeal', 'nomination', 'application'] },
    { id: 'day', label: 'Sent on', values: ['Monday', 'Tuesday', 'Friday'] },
    { id: 'when', label: 'Before', values: ['noon on May 20', 'noon on June 3', 'five on Friday', 'noon on Monday'] },
  ], 'One more call. Please listen carefully and write the message.'),
  choose('tt4_speech', 4, 'speech4', 'speech'),
  choose('tt4_phone', 4, 'phone4', 'phone', 'The telephone is ringing. Please listen carefully.'),
  choose('tt4_notice', 4, 'notice4', 'memo'),
  choose('tt4_mail', 4, 'mail4', 'email', 'An email came for us. Please read it carefully and choose the reply.'),
  choose('tt4_rule', 4, 'rule4', 'memo'),
];

// ---------------------------------------------------------------------------- rank 5 banks and templates

const QA_SPEECH5: QaItem[] = [
  qa('I should like to lodge a formal complaint about the way in which my application was handled.', 'I am sorry to hear that. You may put your complaint in writing, and it will be investigated.', 'complaint', 5, ['The council may refuse a request if the cost would exceed $450.', 'Objections must reach the planning desk within 21 days.']),
  qa('I wonder whether it would be possible to see the file on the planning application, since I am a neighbour.', 'You may ask for it in writing, and the council will reply within 20 working days.', 'file', 5, ['A penalty of 5 percent is added if the tax is more than 60 days late.', 'Each candidate may appoint two observers at each station.']),
  qa('I hope that you will forgive my coming without an appointment, but the matter is rather urgent.', 'Not at all. Please take a seat, and I shall see whether an officer is free.', 'urgent', 5, ['A recount may be demanded if the margin is less than 1 percent.', 'The discharge of waste water must not exceed the limit.']),
  qa('I am not sure that I understand the condition in the second paragraph of the decision letter.', 'Let me read it with you, and I shall explain what it requires.', 'explain', 5, ['The appeal fee will be refunded if the appeal succeeds.', 'An abatement order shall not apply to work needed in an emergency.']),
  qa('Would you be able to tell me whether the council has received my objection to the flats?', 'I shall check the register, and I shall tell you before you leave.', 'status', 5, ['The tables may be placed on the pavement from April to October.', 'The fine may be reduced by half within 14 days.']),
  qa('I have come to collect the permit that was promised for today, but I understand that there is a problem.', 'There is a small problem with one signature, but we shall put it right today.', 'problem', 5, ['The rent subsidy is for households with an income below $26,000.', 'The hearing is open to the public.']),
  qa('May I take it that the decision will not take effect until the appeal has been heard?', 'I am afraid that I cannot say. Please ask the hearings desk, which deals with appeals.', 'effect', 5, ['Samples shall be taken once a month.', 'Interest of 1 percent a month is charged on late tax.']),
  qa('I am grateful for all that you have done, and I shall certainly recommend this counter to my friends.', 'That is very kind of you. We are always glad to help.', 'thanks', 5, ['The planning hearing has been moved to Thursday.', 'The council shall reply within 20 working days.']),
];
const QA_PHONE5: QaItem[] = [
  qa('Hello, this is {Mr. Grant|@}. I sent my objection to the planning desk on April 9. The public notice was posted on March 25. Was my objection in time?', 'Yes. April 9 is within 21 days of March 25, so your objection was in time.', 'objection', 5, ['No. April 9 is more than 21 days after March 25, so your objection was late.', 'Yes. Objections may be sent at any time before the hearing.']),
  qa('Good afternoon. This is {Mrs. Hill|@}. The decision letter on my fine is dated June 1, and today is July 3. May I still appeal?', 'I am afraid not. An appeal must be made within 28 days of the date of the decision letter.', 'appeal', 5, ['Yes. You may appeal within 28 days of the day on which you read the letter.', 'I am afraid not. An appeal must be made within 14 days of the date of the decision letter.']),
  qa('Hello. I owe $800 in tax and cannot pay it at once. Could I pay in instalments?', 'Yes, provided that you pay 10 percent of the debt, which is $80, at once.', 'arrears', 5, ['Yes, provided that you pay 10 percent of the debt, which is $8, at once.', 'No. Instalments are allowed only if the debt is less than $500.']),
  qa('This is {Nora|@}. Our last water sample showed more than the limit. What must we do?', 'You must report it within 24 hours and submit a plan to correct it within 14 days.', 'discharge', 5, ['You must report it within 14 days and submit a plan within 24 hours.', 'You need not do anything, because samples are taken once a month.']),
  qa('Hello. I lost the election by 30 votes out of 4,000. May I demand a recount?', 'Yes, because the margin is less than 1 percent of the votes cast, which is 40 votes.', 'recount', 5, ['No, because the margin is more than 1 percent of the votes cast.', 'Yes, because spoilt ballots are counted in a recount.']),
  qa('Hello. I received the rent subsidy last year, and my income is now $27,000. Will I still receive it?', 'Yes. You were receiving it on December 31, so you continue under the old rules until the end of that year.', 'subsidy', 5, ['No. From January 1 the income limit is $26,000, so you are not eligible.', 'Yes. Under the new rules, your income is below $26,000, so you are eligible.']),
  qa('Good morning. Could you confirm that the hearing on application 31 will be held on Thursday at 2:00?', 'Yes. The hearing on application 31 will be held on Thursday at 2:00.', 'confirm', 5, ['Yes. The hearing on application 31 will be held on Tuesday at 2:00.', 'Yes. The hearing on application 13 will be held on Thursday at 2:00.']),
  qa('Please tell {Ms. Aldridge|@} that I shall bring the signed form to the town hall on Wednesday at 11:00.', 'Yes, I will tell her that you will bring the signed form on Wednesday at 11:00.', 'message', 5, ['Yes, I will tell her that you will bring the signed form on Wednesday at 1:00.', 'Yes, I will tell her that you will bring the signed form on Friday at 11:00.']),
];
const QA_NOTICE5: QaItem[] = [
  qa('Objections must reach the planning desk within 21 days of the public notice. The notice was posted on March 25. Is April 20 still in time?', 'Yes. April 20 is within 21 days of March 25.', 'objection', 5, ['No. April 20 is more than 21 days after March 25.', 'No. Objections must reach the harbour office, not the planning desk.']),
  qa('Interest of 1 percent a month is charged on late tax, and a penalty of 5 percent is added after 60 days. My tax of $1,000 is 70 days late. What is the penalty?', 'The penalty is $50, which is 5 percent of the tax.', 'penalty', 5, ['The penalty is $10, which is 1 percent of the tax.', 'The penalty is $500, which is 50 percent of the tax.']),
  qa('The council shall reply to a written request within 20 working days, but may refuse a request if the cost would exceed $450. The cost of my request would be $300. May the council refuse?', 'No. The cost would not exceed $450, so the council may not refuse for that reason.', 'info', 5, ['Yes. The council may refuse every request that costs more than $50.', 'No. The council must reply within 20 days, whatever the cost.']),
  qa('A candidate may demand a recount if the margin is less than 1 percent of the votes cast. The margin was 60 votes out of 4,000. May the candidate demand a recount?', 'No. The margin is 1.5 percent, which is more than 1 percent.', 'recount', 5, ['Yes. The margin is less than 1 percent.', 'No. A recount may be demanded only by the winner.']),
  qa('Tables may be placed on the pavement from April to October if 1.5 meters remain free, but not on market days. May I put tables out on a market day in May?', 'No. Tables may not be placed on the pavement on a market day.', 'tables', 5, ['Yes. May is between April and October.', 'No. Tables may be placed only from November to March.']),
  qa('A person who fails to comply with a noise abatement order within 7 days shall be liable to a fine of up to $1,000. An order does not apply to emergency work. My neighbour was repairing a leaking roof at night. Is he liable?', 'No. The order does not apply to emergency work.', 'order', 5, ['Yes. He is liable to a fine of up to $1,000.', 'Yes. The order applies to all work after seven days.']),
  qa('Residents over 65 who have kept a boat in the harbour for ten years pay half the annual fee of $90. I am 70 and have kept my boat here for twelve years. What do I pay?', 'You pay $45, which is half of $90.', 'fee', 5, ['You pay $90, because the fee is the same for everybody.', 'You pay $9, which is a tenth of $90.']),
  qa('The discharge of waste water must not exceed 50 milligrams in each liter, and a sample must be taken once a month. We took samples in January and March only. Are we following the permit?', 'No. A sample must be taken every month, and none was taken in February.', 'discharge', 5, ['Yes. A sample must be taken every two months.', 'No. The limit is 50 units, and you took only two samples.']),
];
const QA_MAIL5: QaItem[] = [
  qa('Dear {Mr. Hollis|@}, I posted my objection to the flats on day 25 after the public notice. Will the council still consider it?', 'I am afraid not, because objections must reach the planning desk within 21 days of the public notice.', 'objection', 5, ['Yes. The council will consider it, because you posted it within 25 days.', 'I am afraid not, because objections must be sent to the harbour office within 21 days.']),
  qa('Dear {Ms. Okafor|@}, my tax of $450 was due on March 31, but I paid it on May 15. Is a penalty also due?', 'No penalty is due, because you were less than 60 days late, but interest is charged from March 31.', 'penalty', 5, ['A penalty of 5 percent is due, because you were more than 60 days late.', 'No interest is due, because the tax was paid in May.']),
  qa('Dear Sir, I asked for the list of the people who objected, but you refused. May I ask why?', 'We refused because the list would disclose personal data, which the council may not do.', 'info', 5, ['We refused because the cost of the work would be below $50.', 'We refused because you did not send your request in writing.']),
  qa('Dear Sir, the council has granted permission for the flats. I think that is a mistake. What can I do?', 'You can appeal only if you sent an objection within the time limit.', 'appeal', 5, ['You can appeal within 28 days, whether or not you sent an objection.', 'You can appeal only if you spoke at the hearing.']),
  qa('Dear Sir, we have taken a water sample every two months, because the inspector told us last year that this was enough. Please confirm that we are following the permit.', 'We cannot confirm that, because the permit requires a sample once a month.', 'discharge', 5, ['We confirm that you are following the permit, because the inspector told you so.', 'We cannot confirm that, because the permit requires a sample once a year.']),
  qa('Dear Sir, I have been told that the hearing will decide the future of the whole harbour. Will it consider the harbour as a whole, or only the warehouse?', 'The hearing concerns only application 31, the warehouse, and the harbour will be discussed at another meeting.', 'hearing', 5, ['The hearing will consider the whole harbour, and the fishing boats will be forced to leave.', 'The hearing concerns only the harbour, and the warehouse will be discussed at another meeting.']),
  qa('Dear Sir, I should like to put tables outside my cafe on Sundays. Is that possible?', 'Yes, from April to October, provided that 1.5 meters remain free, and unless a market is held that day.', 'tables', 5, ['Yes, at any time of the year, provided that 1.5 meters remain free.', 'Yes, from April to October, even on days when a market is held in the street.']),
  qa('Dear Sir, thank you for the patience that you showed me last week, when I came three times to ask about the same form.', 'Thank you for your kind words. We are always glad to help, and you may come whenever you need us.', 'thanks', 5, ['Thank you for your kind words. The rules say that you may come only three times.', 'Thank you for your question. The form must be sent to the planning desk within 21 days.']),
];
const QA_RULE5: QaItem[] = [
  qa('Households receiving the rent subsidy on December 31 continue under the old rules for another year; new applicants need an income below $26,000. I have never received the subsidy, and my income is $27,000. May I apply?', 'No. New applicants need an income below $26,000.', 'subsidy', 5, ['Yes. New applicants may apply under the old rules.', 'No. A household may apply only if its income is below $27,000.']),
  qa('A person aged over 65 who has kept a boat in the harbour for ten years pays half the fee. I am 66 and have kept my boat here for six years. Do I pay half?', 'No. You have not kept your boat in the harbour for ten years.', 'fee', 5, ['Yes. You are over 65, so you pay half.', 'Yes. Six years is enough for a person over 65.']),
  qa('Only a person who sent an objection within the time limit may appeal against a decision to grant permission. I did not object, but I live next to the site. May I appeal?', 'No. You did not send an objection, so you may not appeal.', 'appeal', 5, ['Yes. A neighbour may always appeal.', 'Yes. You may appeal if you speak at the hearing.']),
  qa('An objection that arrives late may be accepted only if the applicant agrees in writing. Mine arrived two days late, and the applicant has agreed in writing. Will it be accepted?', 'Yes. The applicant has agreed in writing, so a late objection may be accepted.', 'objection', 5, ['No. A late objection can never be accepted.', 'No. The applicant must agree before the objection is written.']),
  qa('Arrears of more than $500 may be paid in instalments, provided that 10 percent is paid at once. I owe $400 in tax. May I pay in instalments?', 'No. The debt is not more than $500.', 'arrears', 5, ['Yes. Any debt may be paid in instalments.', 'Yes, provided that you pay 10 percent at once.']),
  qa('The council may refuse a request if the cost would exceed $450 or if personal data would be disclosed. I asked for the minutes of a public meeting, which would cost $120. May the council refuse?', 'No. The cost is below $450, and no personal data is involved.', 'info', 5, ['Yes. The council may refuse every request for minutes because of personal data.', 'Yes. The cost is more than $50, so the council may refuse the request.']),
  qa('Spoilt ballots are not counted, and a recount may be demanded if the margin is below 1 percent of the votes cast. The margin is 35 votes out of 3,000 votes cast. May a candidate demand a recount?', 'Yes. 1 percent of 3,000 is 30, and the margin is less than that.', 'recount', 5, ['No. 1 percent of 3,000 is 30, and the margin is more than that.', 'No. Spoilt ballots must be counted first.']),
  qa('No building work is allowed on Sundays, save that work needed in an emergency is exempt. A builder wants to mend a broken gas pipe on a Sunday. May he work?', 'Yes. Work needed in an emergency is exempt.', 'work', 5, ['No. No work is allowed on Sundays.', 'Yes. Any work is allowed on Sundays.']),
];

const T5: TaskTemplate[] = [
  srt('tt5_sort1', 5, 'The warehouse case has produced a heap of papers. Please send each paper to the officer who must deal with it.', [4, 5], ['planning', 'hearings', 'complaints', 'tax', 'roads', 'elections'], [
    ['An objection from a neighbour who says that the building is too high', 'planning'], ['A request to change the use of a barn into a workshop', 'planning'], ['A request that the hearing be moved to the council chamber', 'hearings'], ['An appeal against the decision to grant permission', 'hearings'],
    ['A complaint that the public notice was not displayed near the lane', 'complaints'], ['A complaint that the council has not replied within 20 working days', 'complaints'], ['A letter from an owner about tax that is unpaid and the penalty', 'tax'], ['A request to pay the tax debt in instalments', 'tax'],
    ['A request to close the road during the hearing', 'roads'], ['A report that the new pavement is too narrow', 'roads'], ['A demand for a recount in the harbour election', 'elections'], ['The names of the observers appointed by a candidate', 'elections'],
  ]),
  srt('tt5_sort2', 5, 'More papers have come in about the harbour. Please send each one to the right desk.', [4, 5], ['harbour', 'complaints', 'ideas', 'waste', 'license'], [
    ['An application for a berth for a boat that is 9 meters long', 'harbour'], ['A request to pay half the annual fee, because the owner is over 65', 'harbour'], ['A letter saying that there is waste on the water near the old bridge', 'complaints'], ['A report that waste water is going into the harbour', 'complaints'],
    ['A suggestion that the council should build a new market hall at the harbour', 'ideas'], ['A proposal to open a market for fish on Sundays', 'ideas'], ['A question about where to take the old boxes', 'waste'], ['A request to collect the broken boats at the harbour', 'waste'],
    ['An application for a permit to put tables on the pavement', 'license'], ['An application for a discharge permit', 'license'],
  ]),
  chk('tt5_check_pen', 5, 'This is the statement that you sent me for my late tax. Is the penalty right?', [
    { id: 'tax', label: 'Tax', range: [1000, 5000, 1000], fmt: '${n,}' },
    { id: 'penalty', label: 'Penalty', calc: 'tax / 20', fmt: '${n,}' },
  ], [{ kind: 'invoice', title: 'Statement', fields: ['tax', 'penalty'] }, { kind: 'note', title: 'Late tax', lines: ['A penalty of 5 percent is added if the tax is more than 60 days late.'] }], ['penalty'], 0.7),
  chk('tt5_check_info', 5, 'Is the date of the reply the same as in your register?', [
    { id: 'received', label: 'Request received', range: [1, 4], names: ['', 'March 3', 'April 4', 'May 5', 'June 2'] },
    { id: 'reply', label: 'Reply sent', calc: 'received', names: ['', 'March 31', 'May 2', 'June 3', 'June 30'] },
  ], [{ kind: 'letter', title: 'Reply', fields: ['received', 'reply'] }, { kind: 'ledger', title: 'Register', fields: ['received', 'reply'] }], ['reply'], 0.7),
  chk('tt5_check_app', 5, 'Would you mind checking that the application number is the one on the notice?', [
    { id: 'from', label: 'From', values: ['{Mr. Grant|@}', '{Professor Hale|@}', '{Mrs. Hill|@}', '{Captain Reed|@}'] },
    { id: 'application', label: 'Application', values: ['31', '13', '24', '42', '57', '75'] },
  ], [{ kind: 'letter', title: 'Objection', fields: ['from', 'application'] }, { kind: 'note', title: 'Public notice', fields: ['application'] }], ['application'], 0.7),
  chk('tt5_check_limit', 5, 'This is the report on the water sample. Is the date by which the plan is due the same as in the permit?', [
    { id: 'sample', label: 'Sample', values: ['62 milligrams', '58 milligrams', '71 milligrams'] },
    { id: 'plan', label: 'Plan due in', values: ['14 days', '41 days', '24 days', '10 days'] },
  ], [{ kind: 'letter', title: 'Report', fields: ['sample', 'plan'] }, { kind: 'note', title: 'Discharge permit', fields: ['plan'] }], ['plan'], 0.7),
  slt('tt5_slot1', 5, 'speech', 'Please look at the plan and book the time for me.', DAYS.slice(0, 4), TIMES2, [['wed', 'I am free on Wednesday.'], ['thu', 'I am free on Thursday.'], ['fri', 'I am free on Friday.'], ['afternoon', 'I have another appointment in the morning.'], ['morning', 'I can come only in the morning.']], [['mon', 'I am not free on Monday.'], ['tue', 'I am not free on Tuesday.'], ['t3', 'I must leave before three.']], HALL_BUSY),
  slt('tt5_slot2', 5, 'email', 'Please look at the plan and book the room for the hearing.', ROOMS, HEARCOLS, [['large', 'There will be about 60 residents, so we shall need the council chamber.'], ['small', 'Only a few people will attend, so a small room is enough.'], ['afternoon', 'The hearing must be held in the afternoon.'], ['morning', 'The hearing must be held in the morning.']], [['tue', 'It cannot be held on a Tuesday, because the council meets on Tuesdays.'], ['thu', 'I am unavailable on Thursdays.']], HALL_BUSY, ['Dear colleagues,'], [], 'rooms'),
  frm('tt5_pad1', 5, ['Good morning. This is {who}.', 'The {what} that were receiving the rent subsidy last year will continue under the old rules until {until}.', 'Please tell {Mr. Hollis|@} before the council meets on {day}.'], [
    { id: 'who', label: 'Caller', values: ['{Ms. Aldridge|@}', '{Ms. Okafor|@}', '{Mr. Farrow|@}'] },
    { id: 'what', label: 'Households', values: ['three households', 'thirteen households', 'thirty households'] },
    { id: 'until', label: 'Old rules until', values: ['December 31', 'January 1', 'November 30'] },
    { id: 'day', label: 'Council meets on', values: ['Tuesday', 'Thursday', 'Friday'] },
  ], 'The telephone is ringing. Please listen carefully and write the message.'),
  frm('tt5_pad2', 5, ['Hello, this is {who}.', 'I wish to ask for {what} about {topic}, which was decided on {date}.', 'My number is {number}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'what', label: 'Asks for', values: ['a hearing', 'a copy of the file', 'a recount', 'a payment plan'] },
    { id: 'topic', label: 'About', values: ['my fine', 'my permit', 'the election', 'my tax'] },
    { id: 'date', label: 'Decided on', values: ['June 1', 'June 11', 'July 2', 'July 12'] },
    { id: 'number', label: 'Number', values: ['4 5 8 2', '4 5 2 8', '4 8 5 2'] },
  ], 'One more call, and it is not easy. Please listen carefully and write the message.'),
  choose('tt5_speech', 5, 'speech5', 'speech'),
  choose('tt5_phone', 5, 'phone5', 'phone', 'Please listen. A caller has a question.'),
  choose('tt5_notice', 5, 'notice5', 'memo'),
  choose('tt5_mail', 5, 'mail5', 'email', 'A resident has written to us. Please read the email carefully and choose the reply.'),
  choose('tt5_rule', 5, 'rule5', 'memo'),
];

const BANKS: Record<string, QaItem[]> = {
  speech1: QA_SPEECH1, phone1: QA_PHONE1, notice1: QA_NOTICE1,
  speech2: QA_SPEECH2, phone2: QA_PHONE2, notice2: QA_NOTICE2, mail2: QA_MAIL2,
  speech3: QA_SPEECH3, phone3: QA_PHONE3, notice3: QA_NOTICE3, mail3: QA_MAIL3, rule3: QA_RULE3,
  speech4: QA_SPEECH4, phone4: QA_PHONE4, notice4: QA_NOTICE4, mail4: QA_MAIL4, rule4: QA_RULE4,
  speech5: QA_SPEECH5, phone5: QA_PHONE5, notice5: QA_NOTICE5, mail5: QA_MAIL5, rule5: QA_RULE5,
};

// ---------------------------------------------------------------------------- more reply items (rank 1–5): the town's everyday business

const MORE: Record<string, QaItem[]> = {
  notice1: [
    qa('The fire station is next to the town hall. Is the fire station next to the bank?', 'No, it is next to the town hall.', 'place', 1, ['Yes, it is next to the bank.', 'No, it is next to the school.']),
    qa('A bus pass costs $15 a month. How much is a bus pass for one month?', 'It is fifteen dollars.', 'price', 1, ['It is fifty dollars.', 'It is five dollars.']),
    qa('The speed limit in the village is 30 kilometers an hour. Can I drive at 50 kilometers an hour?', 'No, the speed limit is 30 kilometers an hour.', 'rule', 1, ['Yes, you can drive at 50 kilometers an hour.', 'No, the speed limit is 40 kilometers an hour.']),
    qa('The public garden is open from 8:00 to 6:00. Is it open at 7:00 in the evening?', 'No, it closes at six.', 'hours', 1, ['Yes, it is open until eight.', 'No, it opens at seven.']),
    qa('Please put your garbage in the trash can near the entrance. Where do I put my garbage?', 'Please put it in the trash can near the entrance.', 'place', 1, ['Please put it in the garage.', 'Please put it on the roof.']),
    qa('The citizens of the town can pay the fee at the bank or at the town hall. Can I pay at the bank?', 'Yes, you can pay at the bank or at the town hall.', 'pay', 1, ['No, you can pay only at the town hall.', 'No, you can pay only at the fire station.']),
  ],
  notice2: [
    qa('Health insurance cards are made at Desk 4. Which desk makes health insurance cards?', 'Desk 4 makes them.', 'desk', 2, ['Desk 2 makes them.', 'Desk 5 makes them.']),
    qa('Electricity bills are paid at the post office or the bank. Can I pay my electricity bill at the post office?', 'Yes, you can pay it at the post office or the bank.', 'pay', 2, ['No, you can pay it only at the tax desk.', 'No, you can pay it only at the library.']),
    qa('Pollution in the harbour must be reported to the harbour office. Who should I tell about the oil on the water?', 'You should tell the harbour office.', 'report', 2, ['You should tell the tax desk.', 'You should tell the election desk.']),
    qa('Every new resident will receive a welcome letter. I moved here last week. Will I receive a welcome letter?', 'Yes, new residents will receive a welcome letter.', 'letter', 2, ['No, only old residents receive a welcome letter.', 'No, only people who own a shop will receive it.']),
    qa('The papers must be signed by the owner. My papers are signed by the owner. Will the town hall accept them?', 'Yes, the papers are signed by the owner.', 'document', 2, ['No, the papers must be signed by the mayor.', 'No, the papers must not be signed.']),
    qa('Fences between gardens may not be higher than 1.5 meters. My fence is 1.8 meters. Is it allowed?', 'No, it is higher than 1.5 meters.', 'fence', 2, ['Yes, it is lower than 1.5 meters.', 'No, it is lower than 1.5 meters.']),
    qa('Capital Street is closed for the market on Saturdays. Can I drive on Capital Street on Saturday?', 'No, it is closed for the market.', 'road', 2, ['Yes, it is open for cars on Saturdays.', 'No, it is closed on Sundays.']),
    qa('Garages must be at least 3 meters from the road. My garage is 2 meters from the road. Is it too close?', 'Yes, it must be at least 3 meters from the road.', 'garage', 2, ['No, it may be 2 meters from the road.', 'Yes, it must be at least 2 meters from the road.']),
  ],
  notice3: [
    qa('An income tax return must be sent to the tax office by April 30. I sent mine on May 5. Was it in time?', 'No. A tax return must be sent by April 30.', 'tax', 3, ['Yes. May 5 is before April 30.', 'Yes. A tax return may be sent at any time.']),
    qa('The lease says that the tenant must give two months of notice. I plan to leave in three weeks. Is that enough notice?', 'No. The lease requires two months of notice.', 'lease', 3, ['Yes. Three weeks is more than two months.', 'Yes. The lease requires three weeks of notice.']),
    qa('A bank statement must show the name of the owner of the account. Mine shows my wife\'s name. Will it be accepted?', 'No. The statement must show your name.', 'statement', 3, ['Yes. A statement with any name is accepted.', 'Yes. A statement with your wife\'s name is better.']),
    qa('Residential areas are closed to heavy trucks between 8:00 and 18:00. May a truck deliver to a house at noon?', 'No. Heavy trucks may not enter residential areas at noon.', 'trucks', 3, ['Yes. Trucks may enter residential areas at any time.', 'No. Heavy trucks may not enter residential areas at night.']),
    qa('A taxpayer who pays in instalments must pay the first instalment by March 31. I paid the first instalment on April 3. Was it in time?', 'No. The first instalment was due by March 31.', 'tax', 3, ['Yes. The first instalment was due by April 30.', 'Yes. Instalments may be paid at any time.']),
    qa('Every household must declare its income to the tax office, but a pension is not income. I have only a pension. Must I declare it?', 'No. A pension is not income, so you do not have to declare it.', 'declare', 3, ['Yes. A pension is income, so you must declare it.', 'No. Only a pension must be declared.']),
    qa('The town will protect the old harbour buildings. A developer wants to demolish a warehouse built in 1850. Will that be allowed?', 'No. The town protects old harbour buildings.', 'protect', 3, ['Yes. Every warehouse may be demolished.', 'No. Only new buildings are protected.']),
    qa('A reference letter from an employer must be less than six months old. Mine is eight months old. Will the town hall accept it?', 'No. A reference letter must be less than six months old.', 'reference', 3, ['Yes. A reference letter may be eight months old.', 'No. A reference letter must be less than eight months old.']),
  ],
  rule3: [
    qa('The town gives a grant to a household that has a vacancy for a lodger, provided that the home is residential. We have a spare room in our house, which is residential. Do we qualify?', 'Yes. Your house is residential, and you have a vacancy.', 'grant', 3, ['No. Only shops may receive the grant.', 'No. You must not have a spare room.']),
    qa('Only a citizen who is registered as an inhabitant of the town may vote in the local election. I am a citizen, but I live in another town. May I vote here?', 'No. You are not registered as an inhabitant of this town.', 'vote', 3, ['Yes. Every citizen may vote in every town.', 'No. Only foreign visitors may vote here.']),
    qa('The town gives a discount to taxpayers who pay by bank transfer. I pay by cash. Do I receive the discount?', 'No. The discount is only for payment by bank transfer.', 'discount', 3, ['Yes. Cash is better than a bank transfer.', 'Yes. The discount is for every taxpayer.']),
    qa('Every vendor at the market needs a permit and must show a receipt for the fee. I have a permit, but I have lost my receipt. May I sell tomorrow?', 'No. You must be able to show a receipt for the fee.', 'vendor', 3, ['Yes. A permit is enough.', 'Yes. A receipt is needed only on Sundays.']),
    qa('A tenant who has lived in a flat for ten years may buy it, provided that the owner agrees. The owner has refused. May the tenant still buy the flat?', 'No. The owner has not agreed.', 'buy', 3, ['Yes. The tenant may buy it after ten years.', 'No. A tenant may buy a flat only after twenty years.']),
    qa('Homeless people may sleep in the town shelter for up to three nights without paying. A man has slept there for four nights. Must he pay for the fourth night?', 'Yes. Only the first three nights are free.', 'shelter', 3, ['No. The shelter is free for ever.', 'No. Only the fourth night is free.']),
    qa('A shop owner who wants to put a table outside needs a permit, unless the table is on private land. Mine is on private land. Do I need a permit?', 'No. A table on private land needs no permit.', 'table', 3, ['Yes. Every table needs a permit.', 'No. Only tables on public land need no permit.']),
    qa('A citizen who is unemployed may ask for a free bus pass, provided that he shows a letter from the job office. I have no letter. May I receive the pass?', 'No. You must show a letter from the job office.', 'pass', 3, ['Yes. A bus pass is free for everyone.', 'Yes. You need no letter.']),
  ],
  mail3: [
    qa('Dear Sir, I have lived in a rented flat for five years, and now the owner wants to sell it. Do I have to leave at once?', 'No. The lease protects you, and the new owner must respect it.', 'lease', 3, ['Yes. The owner may sell the flat, and you must leave at once.', 'No. You must leave after the sale, but you will receive a grant.']),
    qa('Dear Sir, my tax return was sent on April 28, but I have received a letter saying it was late. Please explain.', 'A tax return must be sent by April 30, so yours was in time. We will correct our mistake.', 'tax', 3, ['A tax return must be sent by April 30, so yours was late. You must pay a fine.', 'A tax return must be sent by April 28, so yours was late.']),
    qa('Dear {Ms. Aldridge|@}, I am a vendor, and I want to sell flowers at the market on Saturdays. How can I get a permit?', 'Please fill in the application form and pay the fee. We will send you the permit.', 'vendor', 3, ['Please fill in the application form. The permit is free, and you need not pay a fee.', 'Please come to the market on Saturday. We will give you a permit there.']),
    qa('Dear Sir, there is pollution in the stream behind my house. Whom should I tell?', 'Please tell the environment desk. An officer will visit the stream this week.', 'pollution', 3, ['Please tell the tax desk. An officer will pay you a visit.', 'Please do nothing. The stream will clean itself in a week.']),
  ],
  speech3: [
    qa('I am a citizen of another country. May I register as a resident here?', 'Yes. Please bring your passport and a document that shows your address.', 'register', 3, ['The permit costs sixty dollars.', 'The hearing will be held on Tuesday.']),
    qa('Would it be possible to see the minutes of last month\'s meeting? I am an inhabitant of the town.', 'Certainly. Public documents are kept at the registry.', 'minutes', 3, ['The fine is fifty dollars.', 'The tax must be paid by March 31.']),
  ],
  notice4: [
    qa('A municipal ordinance prohibits the burning of garbage in the garden. My neighbour burns his garbage. Is he violating the ordinance?', 'Yes. The ordinance prohibits burning garbage in the garden.', 'ordinance', 4, ['No. The ordinance allows burning garbage in the garden.', 'Yes. The ordinance prohibits burning garbage in the street only.']),
    qa('The council must obtain the consent of the residents before it closes a public road. Two thirds of the residents have consented. Is that a majority?', 'Yes. Two thirds is a majority of the residents.', 'consent', 4, ['No. Two thirds is a minority of the residents.', 'No. The council needs the consent of every resident.']),
    qa('Any resident may submit a petition with at least 50 signatures, and the council must discuss it. We have 60 signatures. Must the council discuss our petition?', 'Yes. A petition with at least 50 signatures must be discussed.', 'petition', 4, ['No. A petition needs at least 100 signatures.', 'No. The council need not discuss a petition.']),
    qa('Welfare payments are made on the first day of the month. The first day of this month is Saturday. When will the payment be made?', 'It will be made on the first day, which is Saturday.', 'welfare', 4, ['It will be made on the last day of the month.', 'It will be made on the first Monday.']),
    qa('The utility company must give seven days of notice before cutting off the water. My water was cut off after three days. Is that allowed?', 'No. The company must give seven days of notice.', 'utility', 4, ['Yes. Three days of notice is enough.', 'No. The company must give three days of notice.']),
    qa('An owner who violates the building guidelines must pay a fine, and the council may enforce the guidelines by stopping the work. The work has been stopped. Was that allowed?', 'Yes. The council may enforce the guidelines by stopping the work.', 'enforce', 4, ['No. The council may not stop any work.', 'Yes. But the council must pay a fine.']),
    qa('Only residents of the municipality may use the municipal pool at the lower price. I live in a village near the town. Do I pay the lower price?', 'No. The lower price is only for residents of the municipality.', 'price', 4, ['Yes. The lower price is for every visitor.', 'No. The lower price is only for visitors.']),
    qa('The town has the right to inspect any building with the consent of the owner. The owner refuses to give consent. May the inspector enter?', 'No. The inspector needs the consent of the owner.', 'inspect', 4, ['Yes. The inspector may always enter.', 'No. The inspector needs the consent of the mayor.']),
    qa('Housing documentation must be kept for ten years. My landlord has kept the papers for six years. Has he done enough?', 'No. The documentation must be kept for ten years.', 'documents', 4, ['Yes. Six years is enough.', 'No. The documentation must be kept for six years.']),
    qa('The referendum on the new harbour road will be held on June 14. Residents who are 18 or older may vote. When is the referendum?', 'It is on June 14.', 'referendum', 4, ['It is on June 4.', 'It is on July 14.']),
  ],
  rule4: [
    qa('A resident may inherit his father\'s boat permit, provided that he applies within 60 days and pays the fee. {Ken|@} applied after 90 days. May he inherit the permit?', 'No. He did not apply within 60 days.', 'inherit', 4, ['Yes. A resident may inherit the permit at any time.', 'No. He did not pay the fee.']),
    qa('A petition is valid if it has the signatures of at least 5 percent of the residents. The town has 2,000 residents, and the petition has 120 signatures. Is it valid?', 'Yes. Five percent of 2,000 is 100, and 120 is more.', 'petition', 4, ['No. Five percent of 2,000 is 200.', 'No. A petition is valid only with 1,000 signatures.']),
    qa('The council may compensate an owner for damage caused by road works, provided that the owner reports the damage within 14 days. An owner reported the damage after 20 days. May the council compensate him?', 'No. The damage was not reported within 14 days.', 'compensate', 4, ['Yes. The council must compensate every owner.', 'Yes. Twenty days is within the time limit.']),
    qa('An ordinance states that no shop may open before 6:00. A baker wishes to open at 5:00 to sell bread. Does the ordinance allow it?', 'No. No shop may open before 6:00.', 'ordinance', 4, ['Yes. A baker may open at any time.', 'No. No shop may open before 5:00.']),
    qa('A trustee of the harbour fund may not vote on a matter in which he has a personal interest. A trustee owns a boat and wants to vote on the harbour fees. May he vote?', 'No. He has a personal interest in the matter.', 'trustee', 4, ['Yes. Every trustee may vote on every matter.', 'No. Only the owner of a boat may vote.']),
    qa('Waste may be disposed of at the town site only on Saturdays, unless the waste is dangerous. I want to bring old paint on a Tuesday. Is that allowed?', 'No. Dangerous waste may not be disposed of on a Tuesday.', 'disposal', 4, ['Yes. Waste may be disposed of on any day.', 'Yes. Paint is accepted on Tuesdays.']),
  ],
  mail4: [
    qa('Dear Sir, I should like to submit a petition against the closure of the library, signed by 120 residents. To whom should I give it?', 'Please give it to the clerk of the council, who will put it on the agenda.', 'petition', 4, ['Please give it to the tax desk, which will put it in the register.', 'Please keep it, because petitions are not accepted by the council.']),
    qa('Dear Sir, my neighbour has ignored an ordinance on noise for three weeks. What will the town do to enforce it?', 'An officer will warn him in writing, and if he refuses to obey, he may be fined.', 'enforce', 4, ['An officer will move him to another house, and he may not be fined.', 'An officer will do nothing, because ordinances cannot be enforced.']),
    qa('Dear Sir, I was a trustee of the harbour fund until last year. May I still see its accounts?', 'Yes. A former trustee may see the accounts of the years in which he served.', 'accounts', 4, ['No. Only the mayor may see the accounts.', 'Yes. A former trustee may see the accounts of all future years.']),
    qa('Dear Sir, I have inherited my aunt\'s house. Do I have to pay property tax on it?', 'Yes. The owner of a house pays property tax, and you are now the owner.', 'inherit', 4, ['No. A house that was inherited is free of tax for ever.', 'Yes. Your aunt must still pay the property tax.']),
  ],
  speech4: [
    qa('I should like to lodge a protest against the decision to close the road. Whom should I address?', 'Please address it to the clerk of the council, and I will register it today.', 'protest', 4, ['A late renewal costs five dollars more.', 'The grant is available only for houses built before 1980.']),
    qa('Would it be possible to speak to the municipal administrator, if he is free?', 'I shall see whether he can see you now.', 'request', 4, ['Nominations close on September 1.', 'The deposit may be reduced if the cost is shown.']),
  ],
  notice5: [
    qa('Under the statute, a petition must be submitted to the clerk and registered within 10 days, otherwise it is void. A petition was registered after 12 days. Is it void?', 'Yes. It was not registered within 10 days.', 'statute', 5, ['No. It was registered within 10 days.', 'No. A petition can never be void.']),
    qa('The council may repeal an ordinance by a majority of two thirds. Seven of ten councillors voted to repeal it. Was the ordinance repealed?', 'Yes. Seven of ten is more than two thirds.', 'repeal', 5, ['No. Seven of ten is less than two thirds.', 'No. An ordinance can never be repealed.']),
    qa('An amendment to the budget requires the consent of the majority of the trustees. Four of seven trustees consented. Is the amendment adopted?', 'Yes. Four of seven is a majority.', 'amend', 5, ['No. Four of seven is a minority.', 'No. An amendment needs all seven trustees.']),
    qa('The levy is 3 percent of the sales tax, offset by any subsidy that was received. A vendor owes $90 in levy and received a subsidy of $30. What does he pay?', 'He pays $60, because the subsidy offsets part of the levy.', 'levy', 5, ['He pays $90, because the subsidy is ignored.', 'He pays $120, because the subsidy is added to the levy.']),
    qa('A violation of the ordinance is punished by a fine, and a repeated offense by a higher fine. A shop owner violated it twice. Which fine does he pay for the second violation?', 'He pays the higher fine, because it is a repeated offense.', 'offense', 5, ['He pays the lower fine, because it is a repeated offense.', 'He pays no fine, because a second violation is ignored.']),
    qa('The tribunal may hear an appeal only if the person who appeals has first used the municipal remedy, which is a written complaint to the clerk. A man appealed without complaining first. May the tribunal hear it?', 'No. He has not used the municipal remedy first.', 'tribunal', 5, ['Yes. The tribunal may hear any appeal.', 'No. He must appeal to the clerk after the tribunal.']),
    qa('Default interest runs from the day after the due date. The due date was March 31. From which day does interest run?', 'It runs from April 1.', 'default', 5, ['It runs from March 31.', 'It runs from May 1.']),
    qa('The municipality may delegate its powers to a committee, but it may not delegate the power to set taxes. May it delegate the setting of the harbour tax?', 'No. The power to set taxes may not be delegated.', 'delegate', 5, ['Yes. Every power may be delegated.', 'No. Only the power to set fees may not be delegated.']),
    qa('A successor to the owner of a licensed building takes over the license, provided that the council is told within 30 days. The new owner told the council after 45 days. Does he hold the license?', 'No. He did not tell the council within 30 days.', 'license', 5, ['Yes. A successor always takes over the license.', 'No. He told the council after 15 days.']),
    qa('An elected councillor who is absent from three meetings in a row loses his seat, unless the council excuses him. A councillor was absent three times, and the council excused him. Does he lose his seat?', 'No. The council excused him.', 'seat', 5, ['Yes. Three absences always mean the loss of the seat.', 'No. Only the mayor may excuse a councillor.']),
  ],
  rule5: [
    qa('A claim for compensation must be made in writing within one year of the damage, unless the person who suffered the damage was a minor. A person who was a minor made his claim two years later. Is the claim in time?', 'Yes. The time limit does not apply when the person was a minor.', 'claim', 5, ['No. Every claim must be made within one year.', 'No. A minor may not make a claim.']),
    qa('Land held in trust may be sold only with the consent of every trustee. Five of six trustees consent. May the land be sold?', 'No. The consent of every trustee is needed.', 'trust', 5, ['Yes. Five of six is a majority.', 'Yes. Land may be sold without consent.']),
    qa('A resident whose home is condemned as unsafe is entitled to temporary housing, provided that he reports at once. A resident reported six weeks later. Is he entitled to temporary housing?', 'No. He did not report at once.', 'housing', 5, ['Yes. Every resident is entitled to temporary housing.', 'No. Only a landlord may report it.']),
    qa('The council shall appoint a successor within 60 days after a trustee resigns. A trustee resigned on May 1. By when must the successor be appointed?', 'By June 30, which is 60 days after May 1.', 'appoint', 5, ['By May 30, which is 30 days after May 1.', 'By July 30, which is 90 days after May 1.']),
    qa('Concessions for the use of public land are granted for up to five years and may be extended once. A concession of five years has already been extended once. May it be extended again?', 'No. A concession may be extended only once.', 'concession', 5, ['Yes. A concession may be extended again and again.', 'No. A concession may not be extended at all.']),
    qa('A municipal worker who is accused of corruption is suspended on full pay until the investigation ends. A worker is under investigation. Does he receive his pay?', 'Yes. He is suspended on full pay until the investigation ends.', 'suspension', 5, ['No. A suspended worker receives no pay.', 'Yes. But only half of his pay.']),
    qa('An heir who inherits a boat berth must register the transfer within 90 days, otherwise the berth returns to the harbour. An heir registered after 100 days. Does he keep the berth?', 'No. The transfer was not registered within 90 days.', 'berth', 5, ['Yes. An heir always keeps the berth.', 'No. The transfer was registered within 90 days.']),
    qa('The town shall make documentation about a decision available to any resident, except documentation that concerns a person\'s health. A resident asked for a health record of a neighbour. Must the town give it?', 'No. Documentation about a person\'s health is excepted.', 'records', 5, ['Yes. The town must give any resident any record.', 'No. Only the neighbour may see documentation about the decision.']),
  ],
  mail5: [
    qa('Dear Sir, I am a trustee of the harbour fund, and I wish to resign. Do I need the council\'s consent?', 'No. A trustee may resign by written notice, and the council will appoint a successor within 60 days.', 'resign', 5, ['Yes. A trustee may not resign without the council\'s consent.', 'No. A trustee may resign by written notice, and the council will appoint a successor within 6 days.']),
    qa('Dear Sir, our petition has 150 signatures and was delivered on day 12 after the notice. Is it void?', 'Yes. A petition must be registered within 10 days, so it is void.', 'petition', 5, ['No. A petition may be registered within 20 days, so it is valid.', 'Yes. A petition needs 1,500 signatures.']),
    qa('Dear Sir, I think that the council has violated the statute by deciding in secret. What are my remedies?', 'You may submit a written complaint to the clerk, and then appeal to the tribunal if you are not satisfied.', 'remedy', 5, ['You may appeal to the tribunal at once, before you complain to the clerk.', 'You have no remedy, because a council may decide in secret.']),
    qa('Dear Sir, my brother and I inherited our mother\'s house. Which of us must pay the property tax?', 'Both heirs are liable, and the tax office will send one bill to each of you.', 'inherit', 5, ['Only the older heir is liable, and the other heir pays nothing.', 'Neither heir is liable, because an inherited house is free of tax.']),
  ],
  phone5: [
    qa('Hello, this is {Mr. Grant|@}. The consent of the other trustees is needed to sell the land, I think. Is that right?', 'Yes. Land held in trust may be sold only with the consent of every trustee.', 'trust', 5, ['No. Land held in trust may be sold by one trustee alone.', 'Yes. Land held in trust may be sold only with the consent of the mayor.']),
    qa('Good morning. I have been accused of violating the ordinance. Where can I read it?', 'You may read it at the registry, and a copy will be sent to you free of charge.', 'ordinance', 5, ['You may read it at the registry, and a copy will cost you $450.', 'You may read it at the harbour office, and a copy will be sent to you free of charge.']),
  ],
};

// ---------------------------------------------------------------------------- still more reply items

const MORE2: Record<string, QaItem[]> = {
  notice1: [
    qa('The public library is open every day. Is the public library open on Sunday?', 'Yes, it is open every day.', 'hours', 1, ['No, it is closed on Sunday.', 'No, it is open only on Monday.']),
    qa('The president of the council will visit the school on Monday. When will the president visit the school?', 'He will visit the school on Monday.', 'time', 1, ['He will visit the school on Friday.', 'He will visit the school on Sunday.']),
    qa('The population of the village is 800. How many people live in the village?', 'Eight hundred people live in the village.', 'number', 1, ['Eighty people live in the village.', 'Two hundred people live in the village.']),
    qa('Please remove your car from the zone before noon. When must I remove my car?', 'You must remove it before noon.', 'time', 1, ['You must remove it after noon.', 'You must remove it before ten.']),
  ],
  notice2: [
    qa('The community center is open to residents only. I am a visitor. May I use the community center?', 'No, it is open to residents only.', 'access', 2, ['Yes, visitors may use it.', 'No, it is open to visitors only.']),
    qa('An official letter must be signed by the mayor. This letter is signed by the clerk. Is it an official letter?', 'No, it must be signed by the mayor.', 'official', 2, ['Yes, it is signed by the clerk.', 'Yes, any signature is fine.']),
    qa('The town fund helps families with a low income. My income is low. Can the fund help me?', 'Yes, the fund helps families with a low income.', 'fund', 2, ['No, the fund helps only rich families.', 'No, the fund helps only industries.']),
    qa('Each district of the town has its own market. I live in the east district. Which market is mine?', 'The market of the east district is yours.', 'district', 2, ['The market of the west district is yours.', 'The market of the central district is yours.']),
    qa('A campaign to keep the beach clean begins on May 1. When does the campaign begin?', 'It begins on May 1.', 'campaign', 2, ['It begins on May 11.', 'It ends on May 1.']),
    qa('Construction work on Mill Road will begin on Monday. Is the construction work on Mill Road starting on Tuesday?', 'No, it begins on Monday.', 'construction', 2, ['Yes, it begins on Tuesday.', 'No, it ends on Monday.']),
    qa('The authority to sign belongs to the mayor. Can the clerk sign for the mayor?', 'No, only the mayor has the authority to sign.', 'authority', 2, ['Yes, the clerk has the authority to sign.', 'No, only the clerk has the authority to sign.']),
    qa('A security guard works at the town hall at night. Is there a security guard at night?', 'Yes, a security guard works at night.', 'security', 2, ['No, there is no guard at night.', 'No, a guard works only in the morning.']),
    qa('The commission meets on the first Monday of each month. When does the commission meet?', 'It meets on the first Monday of each month.', 'commission', 2, ['It meets on the last Monday of each month.', 'It meets on the first Friday of each month.']),
    qa('A majority of the residents voted for the new park. Did most residents vote for the park?', 'Yes, a majority voted for it.', 'majority', 2, ['No, only a few voted for it.', 'No, nobody voted for it.']),
    qa('A benefit concert will be held at the school to raise money for the fund. Why will the concert be held?', 'It will be held to raise money for the fund.', 'benefit', 2, ['It will be held to close the school.', 'It will be held to pay the tax.']),
    qa('The administration office moved to the second floor. Where is the administration office now?', 'It is on the second floor.', 'place', 2, ['It is on the first floor.', 'It is at the harbour.']),
    qa('An individual may ask for a hearing, but a company must write a letter. I am an individual. Must I write a letter?', 'No, an individual may ask for a hearing.', 'individual', 2, ['Yes, an individual must write a letter.', 'Yes, a company must ask for a hearing.']),
    qa('The industry fair will be held in the central hall on Saturday. Where will the fair be held?', 'It will be held in the central hall.', 'place', 2, ['It will be held in the east hall.', 'It will be held at the station.']),
  ],
  notice3: [
    qa('Access to the roof of the town hall is restricted to the staff. I am a visitor. May I go up to the roof?', 'No. Access to the roof is restricted to the staff.', 'access', 3, ['Yes. Access is open to every visitor.', 'No. Access is restricted to visitors.']),
    qa('The identification of the owner is required for every transaction. I want to buy a berth in the harbour. Must I identify myself?', 'Yes. Every transaction requires the identification of the owner.', 'identify', 3, ['No. A transaction needs no identification.', 'Yes. Only a boat needs identification.']),
    qa('The town has banned cars from the old market square. May I drive my car into the old market square?', 'No. Cars are banned from the old market square.', 'ban', 3, ['Yes. Cars are allowed in the old market square.', 'No. Only trucks are banned.']),
    qa('The dispute between two neighbours will be handled by an expert, whose report is due in March. Who will handle the dispute?', 'An expert will handle it.', 'dispute', 3, ['The mayor will handle it.', 'The neighbours will handle it themselves.']),
    qa('An urban development plan for the harbour will be published next week. Is the plan already published?', 'No. It will be published next week.', 'urban', 3, ['Yes. It was published yesterday.', 'No. It will be published next year.']),
    qa('The executive committee approved the reform of the parking rules, which begins in June. When does the reform begin?', 'It begins in June.', 'reform', 3, ['It began in May.', 'It begins in December.']),
    qa('A small enterprise with fewer than ten workers pays a lower fee. My business has six workers. Do I pay the lower fee?', 'Yes. You have fewer than ten workers.', 'enterprise', 3, ['No. You have more than ten workers.', 'No. Only large enterprises pay the lower fee.']),
    qa('The division of the town into six districts will not change. How many districts will there be?', 'There will be six districts.', 'division', 3, ['There will be three districts.', 'There will be sixteen districts.']),
    qa('An interest rate of 4 percent is charged on late payments. I paid $100 late. What is the interest for a year?', 'The interest is $4 for a year.', 'interest', 3, ['The interest is $40 for a year.', 'The interest is $0.40 for a year.']),
    qa('A deduction of $200 is allowed for each child. I have two children. What deduction may I claim?', 'You may claim $400.', 'deduction', 3, ['You may claim $200.', 'You may claim $2,000.']),
    qa('The town gave the fishing enterprise a lease of the old pier for ten years. How long is the lease?', 'The lease is for ten years.', 'lease', 3, ['The lease is for one year.', 'The lease is for twenty years.']),
    qa('The assessment of your house will be made in May. When will the assessment be made?', 'It will be made in May.', 'assessment', 3, ['It was made in March.', 'It will be made in November.']),
  ],
  notice4: [
    qa('Proof of residence must be shown by every applicant. I have lived here for two years, but I have no paper. May I apply?', 'No. You must show proof of residence.', 'residence', 4, ['Yes. Two years of residence is proof enough.', 'No. You must show proof of your age.']),
    qa('It is the obligation of every owner to keep the pavement in front of his house clean. Whose obligation is the pavement?', 'It is the obligation of the owner of the house.', 'obligation', 4, ['It is the obligation of the town.', 'It is the obligation of the owner of the next house.']),
    qa('A provision of the ordinance says that fees may be reduced for students. I am a student. May my fee be reduced?', 'Yes. A provision of the ordinance allows it.', 'provision', 4, ['No. The ordinance forbids reductions.', 'No. Only teachers may receive a reduction.']),
    qa('The guidelines say that a sign may not be larger than one square meter. My sign is two square meters. Does it follow the guidelines?', 'No. It is larger than one square meter.', 'guideline', 4, ['Yes. It is smaller than one square meter.', 'No. It is smaller than one square meter.']),
    qa('The town regulates the opening hours of bars, which must close at midnight. May a bar stay open until one?', 'No. Bars must close at midnight.', 'regulate', 4, ['Yes. The town does not regulate bars.', 'No. Bars must close at two.']),
    qa('A legitimate claim must be supported by documents. My claim has no documents. Is it legitimate?', 'No. A legitimate claim must be supported by documents.', 'claim', 4, ['Yes. Every claim is legitimate.', 'Yes. Documents are needed only for large claims.']),
    qa('The census will be taken in April, and everyone must answer. When will the census be taken?', 'It will be taken in April.', 'census', 4, ['It was taken in April.', 'It will be taken in October.']),
    qa('The electoral register is open for inspection from May 2 to May 16. May I inspect it on May 20?', 'No. It is open only until May 16.', 'electoral', 4, ['Yes. It is open until May 30.', 'No. It is open only from May 20.']),
    qa('The administrator of the harbour fund may spend up to $500 without approval. May he spend $800 without approval?', 'No. He may spend up to $500 without approval.', 'administrator', 4, ['Yes. He may spend any amount.', 'No. He may spend up to $5,000 without approval.']),
    qa('The council enacted a new ordinance on traffic, which takes effect on January 1. When does the ordinance take effect?', 'It takes effect on January 1.', 'enact', 4, ['It takes effect on January 11.', 'It took effect on December 1.']),
    qa('Civic groups may use the town hall free on Sundays. We are a civic group. May we use the hall for free on Sunday?', 'Yes. Civic groups may use it for free on Sundays.', 'civic', 4, ['No. Civic groups must pay on Sundays.', 'Yes. But only on Saturdays.']),
    qa('Heritage buildings may not be painted without permission. My house is a heritage building. May I paint it red?', 'No. You need permission to paint a heritage building.', 'heritage', 4, ['Yes. Any house may be painted any color.', 'No. Only a new building may be painted.']),
  ],
  notice5: [
    qa('The tenure of a trustee is four years and may be renewed once. A trustee has served for eight years. May he serve again?', 'No. His tenure may be renewed only once.', 'tenure', 5, ['Yes. His tenure may be renewed without limit.', 'No. His tenure is only one year.']),
    qa('The mayor may issue a decree in an emergency, but the council must confirm it within seven days. The council confirmed a decree after ten days. Is the decree still valid?', 'No. The council did not confirm it within seven days.', 'decree', 5, ['Yes. The council confirmed it.', 'No. The council confirmed it within seven days.']),
    qa('A constituent may ask the councillor for his district to raise a matter. I live in the east district. Whom may I ask?', 'You may ask the councillor for the east district.', 'constituent', 5, ['You may ask any councillor.', 'You may ask the councillor for the west district.']),
    qa('The council is considering whether to abolish the fee for market stalls. Has the fee already been abolished?', 'No. The council is only considering it.', 'abolish', 5, ['Yes. The council abolished it last year.', 'No. The council has doubled it.']),
    qa('The harbour monopoly on the sale of fish ended in January, and any vendor may now sell fish. May I sell fish at the harbour?', 'Yes. The monopoly has ended.', 'monopoly', 5, ['No. The harbour has a monopoly on the sale of fish.', 'Yes. But only the harbour may sell fish.']),
    qa('A person with immunity from the ordinance may not be fined. The ordinance gives immunity to emergency workers. A firefighter drove too fast to a fire. May he be fined?', 'No. Emergency workers have immunity from the ordinance.', 'immunity', 5, ['Yes. Everyone may be fined.', 'No. Only firefighters pay fines.']),
    qa('The coordination of the flood response is the duty of the harbour master. Who coordinates the flood response?', 'The harbour master does.', 'coordination', 5, ['The tax office does.', 'The elections desk does.']),
    qa('Litigation against the town must begin within two years of the event. An owner began litigation after three years. Is it in time?', 'No. Litigation must begin within two years.', 'litigation', 5, ['Yes. Litigation may begin at any time.', 'No. Litigation must begin within three years.']),
  ],
};
for (const m of [MORE, MORE2]) for (const [k, v] of Object.entries(m)) BANKS[k] = [...(BANKS[k] ?? []), ...v];
const QA: Record<string, QaItem[]> = Object.fromEntries(Object.entries(BANKS).map(([k, v]) => [k, withBankTags(k, v)]));

// ---------------------------------------------------------------------------- more templates: the town's places, people and problems

T2.push(
  srt('tt2_sort2', 2, 'Please read each paper and put it on the right desk.', [4, 5], ['roads', 'complaints', 'ideas', 'planning', 'waste'], [
    ['The drain near the school is blocked', 'roads'], ['The crossing near the station is dangerous', 'roads'], ['The sidewalk in front of the clinic is broken', 'roads'], ['The path next to the pond is full of mud', 'roads'],
    ['Dust from the building site near the stadium', 'complaints'], ['Loud music from the theater at night', 'complaints'], ['The light bulb on the staircase does not work', 'complaints'],
    ['The playground needs a new bench', 'ideas'], ['The statue in the square needs cleaning', 'ideas'], ['A fountain would be nice in front of the bakery', 'ideas'],
    ['I want to build a gym next to the kindergarten', 'planning'], ['I want to build a tower on the corner', 'planning'], ['Please take away the old bricks near the cemetery', 'waste'],
  ]),
  frm('tt2_pad3', 2, ['Hello, this is {who}.', 'There is a problem with {what} near {where}.', 'It is a problem for {for}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'what', label: 'Problem', values: ['a blocked drain', 'a broken sidewalk', 'a muddy path', 'a dangerous crossing', 'the dust', 'a broken bulb'] },
    { id: 'where', label: 'Place', values: ['the playground', 'the pond', 'the stadium', 'the clinic', 'the kindergarten', 'the cemetery', 'the bakery'] },
    { id: 'for', label: 'A problem for', values: ['children', 'old people', 'cars', 'bicycles'] },
  ], 'The telephone is ringing. Please write down the message.'),
);
T3.push(
  srt('tt3_sort3', 3, 'The morning post has come. Please read who wrote each paper, and send it to the right desk.', [4, 5], ['housing', 'planning', 'tax', 'roads', 'ideas', 'registry', 'elections'], [
    ['A letter from a lawyer about the rent of a flat', 'housing'], ['A tenant asks the landlord to repair the heating', 'housing'], ['An architect asks about the height of a new building', 'planning'], ['An engineer wants to change the use of an old shop', 'planning'],
    ['An accountant sends the tax papers of a shop', 'tax'], ['A banker asks about the interest rate on late tax', 'tax'], ['A plumber asks for a permit to dig in the road', 'roads'], ['An electrician reports a broken street lamp', 'roads'],
    ['A volunteer offers to clean the beach', 'ideas'], ['A gardener suggests new trees for the square', 'ideas'], ['A newcomer asks how to register as a resident', 'registry'], ['An immigrant wants to apply for citizenship', 'registry'],
    ['A veteran asks whether he can vote by post', 'elections'], ['A student asks where the polling station is', 'elections'],
  ]),
  srt('tt3_sort4', 3, 'These papers are about people who need help. Please send each one to the right desk.', [4, 4], ['housing', 'tax', 'registry', 'complaints', 'ideas'], [
    ['A widow asks for an allowance for her rent', 'housing'], ['A homeless man asks about the shelter', 'housing'], ['An unemployed man asks about a bus pass', 'registry'], ['A disabled resident wants a new card', 'registry'],
    ['A pensioner asks whether he must pay income tax', 'tax'], ['A parent asks about the school fees tax deduction', 'tax'], ['A resident says that the boundary of her garden is wrong', 'complaints'], ['A guardian complains about the hostel', 'complaints'],
    ['A nurse suggests a new clinic near the harbour', 'ideas'], ['A witness of the festival wants to say a few words', 'ideas'],
  ]),
  frm('tt3_pad3', 3, ['Good morning. This is {who}.', 'We have received the papers of {person}.', 'Please send them to {desk} by {day}.'], [
    { id: 'who', label: 'Caller', values: ['{Ms. Okafor|@}', '{Ms. Aldridge|@}', '{Mr. Farrow|@}'] },
    { id: 'person', label: 'Papers of', values: ['a lawyer', 'an architect', 'an accountant', 'a plumber', 'a contractor', 'a consultant'] },
    { id: 'desk', label: 'Send to', values: ['the tax desk', 'the roads desk', 'the planning desk', 'the housing desk'] },
    { id: 'day', label: 'By', values: ['Tuesday', 'Wednesday', 'Friday'] },
  ], 'The telephone is ringing. Listen carefully, please, and write the message.'),
);
T4.push(
  srt('tt4_sort3', 4, 'A heavy post bag again. Please send each paper to the right desk.', [4, 5], ['planning', 'harbour', 'tax', 'complaints', 'license', 'roads'], [
    ['A report on the emission of smoke from the fish factory', 'complaints'], ['A complaint about the patrol boat that disturbs the fishing boats', 'complaints'], ['A request to rent a stall for the festival parade', 'license'], ['A request for a permit for a demonstration in the square', 'license'],
    ['A question about the tariff for large boats in the harbour', 'harbour'], ['A request for a quarantine place for a dog that arrived on a ship', 'harbour'], ['A letter about the revenue from the market stalls', 'tax'], ['A request for a mortgage statement for tax purposes', 'tax'],
    ['A request to move the boundary fence of a house', 'planning'], ['An objection by the opposition councillors to the new road plan', 'planning'], ['A report on the surplus of the road budget', 'roads'], ['A request to lower the kerb at the entrance of a garage', 'roads'],
  ]),
  frm('tt4_pad3', 4, ['Hello, this is {who}.', 'I wish to ask about {topic}, because of {reason}.', 'Please call me back {when}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'topic', label: 'About', values: ['a settlement', 'a guarantee', 'an allowance', 'the boundary', 'a deed', 'the tariff'] },
    { id: 'reason', label: 'Because of', values: ['the disability of my son', 'the unemployment of my wife', 'a dispute with a neighbour', 'a mortgage', 'the festival', 'a negligent builder'] },
    { id: 'when', label: 'Call back', values: ['today', 'tomorrow morning', 'after the parade', 'before noon on Monday'] },
  ], 'One more call. Please listen carefully and write the message.'),
);
T5.push(
  srt('tt5_sort3', 5, 'The council has received a bundle of legal papers. Please send each paper to the right desk.', [4, 5], ['hearings', 'planning', 'complaints', 'tax', 'harbour', 'roads'], [
    ['A claim of negligence against the contractor who dug up the road', 'hearings'], ['A request for arbitration in a dispute over a berth', 'hearings'], ['A request for mediation between two owners of a boundary wall', 'hearings'], ['An appeal against a verdict of the harbour tribunal', 'hearings'],
    ['A question about the jurisdiction of the council over the old pier', 'planning'], ['A plan for the sewage and drainage of the new houses on {Quay|@} Road', 'planning'], ['The appendix to the planning application, which lists the conditions', 'planning'],
    ['A complaint that a precedent has been ignored in the decision', 'complaints'], ['A complaint about the protocol of the hearing', 'complaints'], ['A request for collateral for the harbour loan', 'tax'], ['The charter of the harbour fund, which must be filed', 'harbour'], ['A report on the potholes on the road to the new annex', 'roads'],
  ]),
  frm('tt5_pad3', 5, ['Hello, this is {who}.', 'I represent {party} in the matter of {matter}.', 'The hearing is fixed for {when}, and I request {request}.'], [
    { id: 'who', label: 'Caller', values: HALL_CALLERS },
    { id: 'party', label: 'Party', values: ['the owner', 'the ratepayers', 'the harbour fund', 'the contractor', 'the creditor'] },
    { id: 'matter', label: 'Matter', values: ['the boundary wall', 'the berth', 'the sewage works', 'the mortgage', 'the settlement'] },
    { id: 'when', label: 'Hearing', values: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'request', label: 'Request', values: ['mediation', 'arbitration', 'an injunction', 'a new date'] },
  ], 'The telephone is ringing, and the caller speaks quickly. Please listen carefully and write the message.'),
);

// ---------------------------------------------------------------------------- reactions and the boss's lines
// The people at the counter say in English what was right or wrong; a wrong result names the line, the desk or the rule.

const REACTIONS: JobContent['reactions'] = [
  // ---- perfect
  { id: 'tr_ok1', kind: 'perfect', text: 'Thank you. That is right.', face: 'happy' },
  { id: 'tr_ok2', kind: 'perfect', text: 'Good. That is just what I need.', face: 'happy' },
  { id: 'tr_ok3', kind: 'perfect', arch: 'sort', text: 'Good. Now every paper is on the right desk.', face: 'happy' },
  { id: 'tr_ok4', kind: 'perfect', arch: 'check', voice: 'person', text: 'Thank you for checking my papers. Now I can go home.', face: 'delighted' },
  { id: 'tr_ok5', kind: 'perfect', arch: 'respond', voice: 'person', text: 'Yes, that answers my question. Thank you.', face: 'happy' },
  { id: 'tr_ok6', kind: 'perfect', voice: 'boss', text: 'Good work. That is the right answer.', face: 'happy' },
  { id: 'tr_ok7', kind: 'perfect', rank: 2, text: 'Thank you. You have helped me a lot.', face: 'delighted' },
  { id: 'tr_ok8', kind: 'perfect', rank: 2, arch: 'check', text: 'Good eyes. Now the papers agree.', face: 'delighted' },
  { id: 'tr_ok9', kind: 'perfect', rank: 2, arch: 'respond', voice: 'boss', text: 'Good. You read it carefully, and the answer is right.', face: 'happy' },
  { id: 'tr_ok10', kind: 'perfect', rank: 3, text: 'Excellent. That is exactly what the rules say.', face: 'delighted' },
  { id: 'tr_ok11', kind: 'perfect', rank: 3, arch: 'check', text: 'Good work. The papers are in order now, and nobody will have to come back.', face: 'happy' },
  { id: 'tr_ok12', kind: 'perfect', rank: 3, arch: 'sort', text: 'Very good. Each paper will reach the right officer today.', face: 'delighted' },
  { id: 'tr_ok13', kind: 'perfect', rank: 4, text: 'Exactly right. You read the rule with great care.', face: 'delighted' },
  { id: 'tr_ok14', kind: 'perfect', rank: 4, arch: 'respond', voice: 'boss', text: 'A clear and correct reply. Please send it, and thank you.', face: 'happy' },
  { id: 'tr_ok15', kind: 'perfect', rank: 5, text: 'Precisely. That is what the regulation requires, and nothing else.', face: 'delighted' },
  { id: 'tr_ok16', kind: 'perfect', rank: 5, arch: 'check', text: 'Well spotted. The council would have faced an appeal over that mistake.', face: 'delighted' },
  // ---- minor
  { id: 'tr_late1', kind: 'minor', late: true, text: 'That is right, but please be a little faster next time.', face: 'neutral' },
  { id: 'tr_late2', kind: 'minor', late: true, rank: 3, text: 'Correct, though many people are waiting. Please work a little quicker.', face: 'neutral' },
  { id: 'tr_minor1', kind: 'minor', arch: 'sort', text: 'Nearly. One paper is on the wrong desk. Please look again.', face: 'neutral' },
  { id: 'tr_minor2', kind: 'minor', arch: 'respond', text: 'Nearly. One line of the message is wrong. Please look again.', face: 'neutral' },
  // ---- sort
  { id: 'tr_bin1', kind: 'wrong_bin', text: 'No. This paper goes to “{bin}”.', face: 'puzzled' },
  { id: 'tr_bin2', kind: 'wrong_bin', text: 'Oh! That one is for “{bin}”, not for this desk.', face: 'puzzled' },
  { id: 'tr_bin3', kind: 'wrong_bin', rank: 3, text: 'That is the wrong desk. This paper belongs to “{bin}”, so please read what it asks for.', face: 'puzzled' },
  { id: 'tr_bin4', kind: 'wrong_bin', rank: 5, text: 'No. What this paper asks for is the work of “{bin}”. Please read it again line by line.', face: 'puzzled' },
  // ---- check
  { id: 'tr_miss1', kind: 'missed', text: 'Wait! This is not right. The {field} is not the same on both papers.', face: 'angry' },
  { id: 'tr_miss2', kind: 'missed', voice: 'person', text: 'Stop. Look at the {field} again. It is wrong on my form.', face: 'sad' },
  { id: 'tr_miss3', kind: 'missed', rank: 3, text: 'We cannot accept this. The {field} on the form does not agree with the other papers.', face: 'angry' },
  { id: 'tr_miss4', kind: 'missed', rank: 4, text: 'This would have been refused later. The {field} on the application does not match the papers behind it.', face: 'angry' },
  { id: 'tr_miss5', kind: 'missed', rank: 5, text: 'The {field} contradicts the regulation, and an error like this would be a ground for appeal.', face: 'angry' },
  { id: 'tr_alarm1', kind: 'false_alarm', text: 'But there is no problem. The {field} is the same on both papers.', face: 'puzzled' },
  { id: 'tr_alarm2', kind: 'false_alarm', text: 'This paper is fine. Everything agrees with my other papers.', face: 'puzzled' },
  { id: 'tr_alarm3', kind: 'false_alarm', rank: 3, text: 'You stopped a correct paper. The {field} agrees with the papers behind it, so please do not hold it back.', face: 'puzzled' },
  { id: 'tr_alarm4', kind: 'false_alarm', rank: 5, text: 'The {field} is in order. Please do not delay an application that complies with the regulation.', face: 'puzzled' },
  { id: 'tr_field1', kind: 'wrong_field', text: 'Not that line. The problem is the {field}.', face: 'puzzled' },
  { id: 'tr_field2', kind: 'wrong_field', rank: 2, text: 'That line is correct. Please look at the {field} again.', face: 'puzzled' },
  { id: 'tr_field3', kind: 'wrong_field', rank: 4, text: 'That line is in order. The mistake is in the {field}.', face: 'puzzled' },
  { id: 'tr_fix1', kind: 'wrong_fix', text: 'You found the right line, but that is not the right new value for the {field}.', face: 'neutral' },
  { id: 'tr_fix2', kind: 'wrong_fix', rank: 4, text: 'Yes, the {field} is wrong, but the figure you chose does not follow from the other papers.', face: 'neutral' },
  // ---- respond
  { id: 'tr_reply0', kind: 'wrong_reply', text: 'Sorry? That is not right. Please look at it again.', face: 'puzzled' },
  { id: 'tr_reply1', kind: 'wrong_reply', voice: 'person', text: 'Sorry? That is not an answer to my question.', face: 'puzzled' },
  { id: 'tr_reply2', kind: 'wrong_reply', voice: 'person', needs: '\\b(notice|rule|fees?|hours?|election)\\b', text: 'But the notice says something different. Please read it again.', face: 'puzzled' },
  { id: 'tr_reply3', kind: 'wrong_reply', voice: 'boss', text: 'That is not the right answer. Please read it again.', face: 'puzzled' },
  { id: 'tr_reply4', kind: 'wrong_reply', rank: 3, voice: 'boss', text: 'That reply does not agree with the facts in the message. Please read it again.', face: 'puzzled' },
  { id: 'tr_reply5', kind: 'wrong_reply', rank: 4, voice: 'person', text: 'I am afraid that is not what the rule says. Please look at the conditions again.', face: 'sad' },
  { id: 'tr_reply6', kind: 'wrong_reply', rank: 5, text: 'That reply ignores a condition of the regulation. Please read it again, and watch for the exceptions.', face: 'sad' },
  { id: 'tr_slot1', kind: 'wrong_slot', text: 'That time is not free, or it is not the time I asked for. Please try again.', face: 'sad' },
  { id: 'tr_slot2', kind: 'wrong_slot', rank: 3, text: 'That booking does not meet every condition of the request. Please check the day, the time and the room.', face: 'sad' },
  { id: 'tr_form1', kind: 'wrong_form', text: 'Some of this message is wrong. Please listen again.', face: 'sad' },
  { id: 'tr_form2', kind: 'wrong_form', rank: 3, text: 'The message is not quite right. Please check every name and number.', face: 'sad' },
  // ---- any failure
  { id: 'tr_fail1', kind: 'any_fail', text: 'Oh no. That is not right. Please look again.', face: 'sad' },
  { id: 'tr_fail2', kind: 'any_fail', rank: 3, text: 'That is not correct. Please be more careful.', face: 'sad' },
];

const LINES: JobContent['lines'] = [
  { id: 'tl_s1', kind: 'start', text: 'Good morning. The doors are open, and the first people are waiting.' },
  { id: 'tl_s2', kind: 'start', text: 'Hello. The papers are on your desk.' },
  { id: 'tl_s3', kind: 'start', rank: 2, text: 'Good morning. Please check every paper twice today.' },
  { id: 'tl_s4', kind: 'start', rank: 3, text: 'Good morning. The queue is long today, but accuracy comes first.' },
  { id: 'tl_s5', kind: 'start', rank: 4, text: 'Good morning. We have a full list, and several rules have changed since last month.' },
  { id: 'tl_s6', kind: 'start', rank: 5, text: 'Good morning. The planning hearing is this week, so every paper must be in perfect order.' },
  { id: 'tl_e1', kind: 'end', text: 'Thank you for your work today.' },
  { id: 'tl_e2', kind: 'end', text: 'Good work. See you tomorrow.' },
  { id: 'tl_e3', kind: 'end', rank: 3, text: 'Thank you. The counter is quiet at last.' },
  { id: 'tl_e4', kind: 'end', rank: 5, text: 'The council will be pleased with today. Thank you for your careful work.' },
  { id: 'tl_r1', kind: 'rankup', text: 'You are doing very well. Here is a little more work for you.' },
  { id: 'tl_r5', kind: 'rankup', rank: 5, text: 'You may now read the regulations with me, and the hearings are yours to prepare.' },
  { id: 'tl_h1', kind: 'handover', msg: 'phone', text: 'The telephone is for you. Please take the message.' },
  { id: 'tl_h2', kind: 'handover', msg: 'email', text: 'An email came for us. Please read it and answer it.' },
  { id: 'tl_h3', kind: 'handover', msg: 'memo', text: 'Please read this notice and choose the right answer.' },
  { id: 'tl_h4', kind: 'handover', msg: 'letter', text: 'This letter came by the morning post. Please read it and answer it.' },
  { id: 'tl_h5', kind: 'handover', msg: 'check', text: 'Please check this application against the papers.' },
  { id: 'tl_h6', kind: 'handover', msg: 'sort', text: 'The morning post is here. Please put each paper on the right desk.' },
  { id: 'tl_h7', kind: 'handover', rank: 4, msg: 'email', text: 'Read this carefully, please, and be sure that the reply agrees with the rule.' },
];

// ---------------------------------------------------------------------------- the job

const LEXICON = lex(LEX_SRC);
const FORMS: Record<string, string[]> = EXTRA_FORMS;

const EN: JobContent = {
  sign: '{Harbour|@} Town Hall',
  lexicon: LEXICON.entries,
  pages: LEXICON.pages,
  forms: FORMS,
  people: [
    { id: 'p_hollis', name: 'Mr. Hollis', avatar: '👨‍💼' },
    { id: 'p_aldridge', name: 'Ms. Aldridge', avatar: '👩' },
    { id: 'p_farrow', name: 'Mr. Farrow', avatar: '👨' },
    { id: 'p_okafor', name: 'Ms. Okafor', avatar: '👩‍💼' },
    { id: 'c_merchant', name: '', avatar: '' },
    { id: 'c_sailor', name: '', avatar: '' },
    { id: 'c_docker', name: '', avatar: '' },
    { id: 'c_cook', name: '', avatar: '' },
    { id: 'c_baker', name: '', avatar: '' },
    { id: 'c_scholar', name: '', avatar: '' },
    { id: 'c_student', name: '', avatar: '' },
    { id: 'c_oldman', name: '', avatar: '' },
    { id: 'c_grandma', name: '', avatar: '' },
    { id: 'c_mom', name: '', avatar: '' },
    { id: 'c_boy', name: '', avatar: '' },
    { id: 'c_girl', name: '', avatar: '' },
  ],
  boss: 'p_hollis',
  things: [],
  sort: {
    item: 'file',
    bins: [
      { id: 'license', label: 'Licenses', ref: 'the license desk', art: 'registered' },
      { id: 'tax', label: 'Taxes', ref: 'the tax desk', art: 'claims' },
      { id: 'housing', label: 'Housing', ref: 'the housing desk', art: 'door' },
      { id: 'registry', label: 'Registry', ref: 'the registry', art: 'store' },
      { id: 'waste', label: 'Waste', ref: 'the waste desk', art: 'bin' },
      { id: 'roads', label: 'Roads and Works', ref: 'the roads desk', art: 'street' },
      { id: 'planning', label: 'Planning', ref: 'the planning desk', art: 'light' },
      { id: 'elections', label: 'Elections', ref: 'the elections desk', art: 'board' },
      { id: 'hearings', label: 'Hearings', ref: 'the hearings desk', art: 'desk' },
      { id: 'complaints', label: 'Complaints', ref: 'the complaints desk', art: 'complaint' },
      { id: 'ideas', label: 'Proposals', ref: 'the proposals desk', art: 'idea' },
      { id: 'harbour', label: 'Harbour Office', ref: 'the harbour office', art: 'boat' },
    ],
  },
  tasks: [...R1, ...R2, ...R3, ...R4, ...R5],
  templates: withTemplateTags([...T1, ...T2, ...T3, ...T4, ...T5]),
  qa: QA,
  reactions: REACTIONS,
  lines: LINES,
};

export const TOWNHALL_JOB: JobDef = {
  id: 'townhall',
  nameJa: '役場の窓口',
  blurbJa: '港町の役場の窓口で働く。申請書を担当の窓口へ仕分け、申請書と身分証・許可証・規則を照らし合わせて食い違いを見つけ、住民の問い合わせに掲示や条例から返事を選び、聴聞会や検査の日時を空きに入れ、電話の伝言を書き、条件と例外のある規則から資格を判断する。政府・法律・税金・住まい・許可・選挙・公共サービス・環境の言葉と、事務的な英語（TOEIC 向け）。',
  icon: '🏛️',
  domains: ['society', 'law', 'housing', 'finance', 'money', 'hr', 'nature', 'communication', 'office'],
  archetypes: ['sort', 'check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '3', toeic: 500 }, tasks: 4, noteJa: '申請書を窓口（許可・税・住まい・登録・ごみ）へ仕分ける。申請書と身分証・領収書の食い違い（名前・住所・日付・金額）を探す。掲示から開庁時間や料金を読んで答える。会う時間を空きに入れる。電話の伝言を書く。英検3級・TOEIC 〜500。' },
    { rank: 2, need: { good: 14, words: 50 }, level: { eiken: 'pre2', toeic: 600 }, unlocks: ['long'], tasks: 5, reward: { coins: 12 }, noteJa: '申請に必要な書類・期限・料金・更新。通知や道路工事のお知らせ、メールを読んで返事を選ぶ。条件がふたつの日程。誕生日・住所・有効期限の確認。英検準2級・TOEIC 〜600。' },
    { rank: 3, need: { good: 28, words: 130 }, level: { eiken: '2', toeic: 730 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 7, reward: { coins: 20 }, noteJa: '条例・手数料・税の計算を読む。食い違いを見つけたら正しい値も選ぶ。電話を耳だけで聞く。資格（年齢・居住・収入）を条件と例外から判断する。聴聞や検査の予約。時間制限（選んだときだけ）。英検2級・TOEIC 〜730。' },
    { rank: 4, need: { good: 59, words: 250 }, level: { eiken: 'pre1', toeic: 860 }, tasks: 7, reward: { coins: 30 }, noteJa: '異議申し立て、補助金、入札、議事録、評議会の決定。条件と例外のある規則を読んで資格を判断する。長いメールと手紙への返事。耳だけの留守番電話。英検準1級・TOEIC 〜860。' },
    { rank: 5, need: { good: 86, words: 370 }, level: { eiken: '1', toeic: 990 }, tasks: 7, reward: { coins: 50 }, noteJa: '灯台：役場の右腕。条例の条項、但し書きと例外、不服申し立て、都市計画の聴聞会、倉庫の用途変更の審査。仮定法・倒置・譲歩の文を読み解く。耳だけの伝言。英検1級・TOEIC 〜990。' },
  ],
  wage: { perfect: 4, minor: 2, fail: 0, bad: 0 },
  opensAfter: 2,
  hours: [0, 2],
  building: 'townhall',
  content: { en: EN },
  flavour: 'work',
};
