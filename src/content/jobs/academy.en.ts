import type { VerificationPage } from '../../core/types';
import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, RespondSlotCell, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * The academy library (学院の図書室): the school-flavoured, 英検-style academic reading job. Ranks map to 英検 3 / 準2 / 2 / 準1 / 1
 * (TOEIC 〜500 / 〜600 / 〜730 / 〜860 / 〜990). Domains: education, science, history, literature, the arts, technology and research.
 *
 * - sort: books, papers and theses to the right shelf, read from their titles and abstracts;
 * - check: a catalog card or a citation ↔ the title page; a summary ↔ the passage it summarizes (mark the sentence that
 *   misstates it; rank 3+: also choose the sentence that should stand there);
 * - respond: a reader's request answered from the library's rules, an abstract matched to the summary that is true, a phone
 *   message written on the pad, and study rooms, lectures and symposia booked into the one free slot that fits.
 *
 * The library has a running story: Ms. Thorne, the head librarian, and her rules; Mr. Ashby's catalog cards; the student
 * Ken and his first essay; Professor Hale's study of the old harbour records; the lectures on Tuesday evenings; the great
 * flood that wet the archive; and, at the top rank, the conference on the history of the harbour town and the thesis that
 * may not be read for two years.
 *
 * Authoring notes: each authored task brings at most four words that are new to the job (first met where the layout, a
 * number or the consequence of a wrong answer shows the meaning); templates only draw on words the spine of that rank (or
 * an earlier one) has introduced. The job's lexicon, the phrase / grammar tags and the extra forms below are generated
 * from the texts by a tool and kept in the marked blocks; do not edit them by hand.
 */

// <<GEN:SEQ>>
const SEQMAP: Record<string, number> = {"ac1_room1":1,"ac1_room2":2,"ac1_room3":3,"ac1_hours":4,"ac1_reading":5,"ac1_silent":6,"ac1_ask1":7,"ac1_loan":8,"ac1_fine":9,"ac1_copy":10,"ac1_card1":11,"ac1_author":12,"ac1_title":13,"ac1_ok1":14,"ac1_ok2":15,"ac1_card":16,"ac1_pad2":17,"ac1_shelf1":18,"ac1_shelf3":19,"ac1_shelf2":20,"ac1_shelf4":21,"ac1_pad1":22,"ac2_room1":1,"ac2_pad1":2,"ac2_year":3,"ac2_lect1":4,"ac2_room2":5,"ac2_fine":6,"ac2_due1":7,"ac2_shelf2":8,"ac2_pages":9,"ac2_ok1":10,"ac2_shelf1":11,"ac2_card1":12,"ac2_reserve":13,"ac2_renew":14,"ac2_shelf3":15,"ac2_rule1":16,"ac2_phone1":17,"ac2_mail1":18,"ac2_abs2":19,"ac2_abs1":20,"ac2_rule2":21,"ac3_room1":1,"ac3_loan2":2,"ac3_card2":3,"ac3_mail1":4,"ac3_shelf3":5,"ac3_room3":6,"ac3_room5":7,"ac3_ok2":8,"ac3_shelf4":9,"ac3_room4":10,"ac3_card3":11,"ac3_ok1":12,"ac3_shelf1":13,"ac3_copy1":14,"ac3_cite1":15,"ac3_cite2":16,"ac3_cite3":17,"ac3_lect1":18,"ac3_lect2":19,"ac3_lect3":20,"ac3_abs1":21,"ac3_ill1":22,"ac3_ill3":23,"ac3_card1":24,"ac3_thesis1":25,"ac3_ask1":26,"ac3_final":27,"ac3_mail3":28,"ac3_mail2":29,"ac3_phone1":30,"ac3_journal1":31,"ac3_abs2":32,"ac3_room2":33,"ac3_rule2":34,"ac3_abs3":35,"ac3_shelf5":36,"ac3_rule1":37,"ac3_abs4":38,"ac3_ill2":39,"ac3_pad1":40,"ac3_fine2":41,"ac3_shelf2":42,"ac3_sum3":43,"ac3_sum4":44,"ac3_sum1":45,"ac3_sum2":46,"ac4_room3":1,"ac4_room1":2,"ac4_mail3":3,"ac4_pad3":4,"ac4_card3":5,"ac4_phone3":6,"ac4_pad1":7,"ac4_card1":8,"ac4_shelf1":9,"ac4_ok1":10,"ac4_cite1":11,"ac4_mail1":12,"ac4_closing1":13,"ac4_closing3":14,"ac4_card2":15,"ac4_shelf2":16,"ac4_shelf4":17,"ac4_pad2":18,"ac4_sum2":19,"ac4_shelf3":20,"ac4_lect1":21,"ac4_closing2":22,"ac4_ok2":23,"ac4_loan3":24,"ac4_abs3":25,"ac4_sum3":26,"ac4_abs2":27,"ac4_abs1":28,"ac4_sum1":29,"ac4_special0":30,"ac4_room2":31,"ac4_special1":32,"ac4_special2":33,"ac4_special3":34,"ac4_digital1":35,"ac4_digital3":36,"ac4_digital2":37,"ac4_plag1":38,"ac4_buy1":39,"ac4_buy3":40,"ac4_fellow2":41,"ac4_fellow3":42,"ac4_fellow1":43,"ac4_final":44,"ac4_sum4":45,"ac5_ok2":1,"ac5_closing3":2,"ac5_card1":3,"ac5_abs2":4,"ac5_lect1":5,"ac5_ok3":6,"ac5_sum4":7,"ac5_sum1":8,"ac5_sum2":9,"ac5_abs4":10,"ac5_extend1":11,"ac5_gift1":12,"ac5_gift3":13,"ac5_review2":14,"ac5_review1":15,"ac5_review3":16,"ac5_gift2":17,"ac5_flood1":18,"ac5_phone3":19,"ac5_flood2":20,"ac5_flood3":21,"ac5_room2":22,"ac5_room3":23,"ac5_mail3":24,"ac5_final2":25,"ac5_room1":26,"ac5_cite2":27,"ac5_shelf1":28,"ac5_sum3":29,"ac5_final1":30,"ac5_cite3":31,"ac5_pad1":32,"ac5_cite1":33,"ac5_symp1":34,"ac5_symp2":35,"ac5_ok1":36,"ac5_network3":37,"ac5_network1":38,"ac5_pad2":39,"ac5_network2":40,"ac5_copy3":41,"ac5_copy1":42,"ac5_shelf3":43,"ac5_shelf2":44,"ac5_abs1":45,"ac5_abs3":46};
// <<END:SEQ>>

// <<GEN:TAGS>>
const TAGS: Tags = {"ac1_shelf1":{"grammar":["gr-5-011"]},"ac1_card1":{"grammar":["gr-3-022"]},"ac1_hours":{"grammar":["gr-3-019","gr-3-031"]},"ac1_room1":{"grammar":["gr-3-039"]},"ac1_loan":{"grammar":["gr-3-021","gr-3-039"]},"ac1_shelf2":{"grammar":["gr-3-027"]},"ac1_pad1":{"grammar":["gr-4-008"],"phrases":["ph-4-0141","ph-3-0137"]},"ac1_fine":{"grammar":["gr-3-021","gr-3-029"],"phrases":["ph-4-0075"]},"ac1_reading":{"grammar":["gr-3-015"],"phrases":["ph-4-0150"]},"ac1_room2":{"grammar":["gr-3-039"],"phrases":["ph-4-0149"]},"ac1_card":{"grammar":["gr-3-027","gr-3-039"]},"ac1_shelf3":{"grammar":["gr-3-027"]},"ac1_title":{"phrases":["ph-pre2-0174"]},"ac1_pad2":{"grammar":["gr-3-039","gr-pre2-056"],"phrases":["ph-4-0141","ph-4-0072"]},"ac1_silent":{"grammar":["gr-3-039"]},"ac1_room3":{"grammar":["gr-4-008"]},"ac1_ask1":{"grammar":["gr-5-011"]},"ac1_ok2":{"grammar":["gr-5-011"]},"ac1_copy":{"grammar":["gr-3-029"]},"ac1_shelf4":{"grammar":["gr-3-027"]},"ac2_shelf1":{"grammar":["gr-3-027"]},"ac2_card1":{"grammar":["gr-5-011"]},"ac2_abs1":{"grammar":["gr-4-019"]},"ac2_due1":{"grammar":["gr-3-021","gr-3-039"]},"ac2_room1":{"grammar":["gr-3-039"],"phrases":["ph-2-0245"]},"ac2_renew":{"grammar":["gr-pre2-056","gr-3-001"]},"ac2_shelf2":{"grammar":["gr-3-027"]},"ac2_pages":{"grammar":["gr-4-020"]},"ac2_reserve":{"grammar":["gr-pre2-056","gr-3-010"],"phrases":["ph-2-0272"]},"ac2_pad1":{"grammar":["gr-3-019","gr-3-031"]},"ac2_abs2":{"grammar":["gr-3-019"]},"ac2_year":{"grammar":["gr-5-011"]},"ac2_rule1":{"grammar":["gr-3-039"]},"ac2_lect1":{"grammar":["gr-3-039"]},"ac2_shelf3":{"grammar":["gr-3-027"]},"ac2_phone1":{"grammar":["gr-pre2-011","gr-2-030"]},"ac2_room2":{"grammar":["gr-3-039"]},"ac2_rule2":{"grammar":["gr-3-021","gr-3-039"],"phrases":["ph-pre2-0367"]},"ac2_fine":{"grammar":["gr-5-011"]},"ac2_mail1":{"grammar":["gr-pre2-055","gr-3-039"]},"ac3_sum1":{"grammar":["gr-2-056"],"phrases":["ph-2-0272"]},"ac3_shelf1":{"grammar":["gr-3-027","gr-5-011"]},"ac3_ill1":{"grammar":["gr-pre2-056"]},"ac3_card1":{"grammar":["gr-3-039","gr-5-015"]},"ac3_copy1":{"grammar":["gr-2-056","gr-pre2-015"]},"ac3_room1":{"grammar":["gr-3-039","gr-4-007"]},"ac3_journal1":{"grammar":["gr-2-030","gr-pre2-011"]},"ac3_cite1":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"ac3_pad1":{"grammar":["gr-pre2-012"]},"ac3_abs2":{"grammar":["gr-3-007"]},"ac3_sum2":{"grammar":["gr-3-019","gr-5-011"],"phrases":["ph-2-0272"]},"ac3_room2":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre2-0199"]},"ac3_shelf2":{"grammar":["gr-3-027","gr-5-011"]},"ac3_loan2":{"grammar":["gr-pre2-015"],"phrases":["ph-2-0272"]},"ac3_card2":{"grammar":["gr-3-039","gr-4-003"]},"ac3_thesis1":{"grammar":["gr-2-030","gr-pre2-011"]},"ac3_lect1":{"grammar":["gr-3-039","gr-4-007"]},"ac3_abs3":{"grammar":["gr-3-019"]},"ac3_sum3":{"phrases":["ph-2-0272"]},"ac3_mail1":{"grammar":["gr-3-001","gr-3-039"],"phrases":["ph-2-0272"]},"ac3_shelf3":{"grammar":["gr-3-027","gr-5-011"]},"ac3_phone1":{"grammar":["gr-3-039","gr-4-002"]},"ac3_room3":{"grammar":["gr-3-039","gr-5-015"]},"ac3_rule1":{"grammar":["gr-3-018","gr-3-039"],"phrases":["ph-pre1-0448"]},"ac3_abs4":{"grammar":["gr-3-021","gr-3-029"]},"ac3_ill2":{"grammar":["gr-pre2-041"]},"ac3_sum4":{"grammar":["gr-3-021"],"phrases":["ph-2-0272"]},"ac3_rule2":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre2-0199"]},"ac3_ask1":{"grammar":["gr-2-030","gr-pre2-011"]},"ac3_lect2":{"grammar":["gr-3-007","gr-4-019"]},"ac3_shelf4":{"grammar":["gr-3-027","gr-5-011"]},"ac3_ok2":{"grammar":["gr-5-011"]},"ac3_mail2":{"grammar":["gr-pre2-055"]},"ac3_room4":{"grammar":["gr-3-039","gr-4-007"]},"ac3_fine2":{"grammar":["gr-pre2-015"],"phrases":["ph-2-0474"]},"ac3_final":{"grammar":["gr-3-001","gr-3-022"]},"ac3_card3":{"grammar":["gr-5-011"]},"ac3_ill3":{"grammar":["gr-pre2-056"]},"ac3_lect3":{"grammar":["gr-3-007","gr-4-019"]},"ac3_shelf5":{"grammar":["gr-3-027","gr-5-011"]},"ac3_mail3":{"grammar":["gr-3-001","gr-3-039"]},"ac3_room5":{"grammar":["gr-3-039","gr-4-007"]},"ac4_abs1":{"grammar":["gr-pre2-034","gr-3-007"]},"ac4_sum1":{"grammar":["gr-2-056"],"phrases":["ph-2-0272","ph-2-0473"]},"ac4_shelf1":{"grammar":["gr-3-027","gr-5-011"]},"ac4_special0":{"grammar":["gr-3-039","gr-4-006"]},"ac4_special1":{"grammar":["gr-2-030","gr-2-045"]},"ac4_cite1":{"grammar":["gr-5-011","gr-5-016"]},"ac4_digital1":{"grammar":["gr-2-030"]},"ac4_room1":{"grammar":["gr-3-039","gr-5-015"]},"ac4_plag1":{"grammar":["gr-3-039","gr-4-002"]},"ac4_card1":{"grammar":["gr-pre2-041","gr-3-039"]},"ac4_pad1":{"grammar":["gr-2-030"]},"ac4_closing1":{"grammar":["gr-2-030"],"phrases":["ph-2-0194"]},"ac4_sum2":{"grammar":["gr-pre2-015","gr-4-020"]},"ac4_fellow1":{"grammar":["gr-pre2-041","gr-3-019"]},"ac4_shelf2":{"grammar":["gr-pre1-022"]},"ac4_buy1":{"grammar":["gr-3-018","gr-3-039"],"phrases":["ph-pre1-0448"]},"ac4_room2":{"grammar":["gr-3-001","gr-3-039"]},"ac4_ok1":{"grammar":["gr-5-016"]},"ac4_abs2":{"grammar":["gr-pre2-056","gr-3-007"]},"ac4_mail1":{"grammar":["gr-2-045"]},"ac4_card2":{"grammar":["gr-2-058"]},"ac4_digital2":{"grammar":["gr-2-030"]},"ac4_pad2":{"grammar":["gr-3-039","gr-4-008"]},"ac4_sum3":{"grammar":["gr-pre1-022"]},"ac4_special2":{"grammar":["gr-2-030"]},"ac4_shelf3":{"grammar":["gr-3-027","gr-3-039"]},"ac4_lect1":{"grammar":["gr-3-039","gr-4-008"]},"ac4_closing2":{"grammar":["gr-2-030"]},"ac4_ok2":{"grammar":["gr-pre2-041","gr-3-021"]},"ac4_fellow2":{"grammar":["gr-2-030"],"phrases":["ph-2-0299"]},"ac4_final":{"grammar":["gr-2-030"]},"ac4_special3":{"grammar":["gr-2-030"]},"ac4_digital3":{"grammar":["gr-2-030"]},"ac4_buy3":{"grammar":["gr-pre2-011","gr-3-018"]},"ac4_fellow3":{"grammar":["gr-2-030"]},"ac4_shelf4":{"grammar":["gr-3-027","gr-5-011"]},"ac4_loan3":{"grammar":["gr-pre2-041","gr-3-021"]},"ac4_mail3":{"grammar":["gr-3-001","gr-3-039"]},"ac4_room3":{"grammar":["gr-3-039","gr-5-015"]},"ac4_abs3":{"grammar":["gr-pre2-006","gr-3-027"]},"ac4_sum4":{"grammar":["gr-pre2-011","gr-3-029"]},"ac4_closing3":{"grammar":["gr-2-030"]},"ac4_pad3":{"grammar":["gr-pre2-055","gr-3-039"]},"ac4_phone3":{"grammar":["gr-2-030"]},"ac5_abs1":{"grammar":["gr-3-019","gr-3-029"]},"ac5_shelf1":{"grammar":["gr-3-001","gr-3-003"]},"ac5_copy1":{"grammar":["gr-pre2-013","gr-3-019"]},"ac5_cite1":{"grammar":["gr-2-030","gr-3-001"]},"ac5_flood1":{"grammar":["gr-3-018","gr-3-039"]},"ac5_room1":{"grammar":["gr-3-001","gr-3-039"]},"ac5_network1":{"grammar":["gr-pre2-015","gr-3-021"]},"ac5_card1":{"grammar":["gr-pre1-032"]},"ac5_review1":{"grammar":["gr-pre2-041","gr-3-018"]},"ac5_pad1":{"grammar":["gr-pre2-065","gr-3-001"]},"ac5_abs2":{"grammar":["gr-pre1-032"]},"ac5_sum2":{"grammar":["gr-3-027","gr-3-033"]},"ac5_extend1":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0448"]},"ac5_shelf2":{"grammar":["gr-3-027","gr-5-011"]},"ac5_gift1":{"grammar":["gr-3-001","gr-3-007"]},"ac5_lect1":{"grammar":["gr-3-019","gr-3-039"]},"ac5_cite2":{"grammar":["gr-2-058"]},"ac5_flood2":{"grammar":["gr-3-001","gr-3-039"]},"ac5_sum3":{"grammar":["gr-pre1-032"]},"ac5_symp1":{"grammar":["gr-2-030","gr-pre2-015"]},"ac5_symp2":{"grammar":["gr-2-030","gr-3-005"]},"ac5_pad2":{"grammar":["gr-pre2-011","gr-3-039"]},"ac5_review2":{"grammar":["gr-3-001","gr-3-039"]},"ac5_ok1":{"grammar":["gr-2-030","gr-3-005"]},"ac5_network2":{"grammar":["gr-3-021","gr-3-027"]},"ac5_room2":{"grammar":["gr-4-008","gr-5-015"]},"ac5_abs3":{"grammar":["gr-3-002","gr-4-019"]},"ac5_flood3":{"grammar":["gr-2-020","gr-pre2-036"]},"ac5_ok2":{"grammar":["gr-3-039","gr-5-015"]},"ac5_final1":{"grammar":["gr-2-030","gr-pre2-011"]},"ac5_gift2":{"grammar":["gr-3-002","gr-3-039"]},"ac5_ok3":{"grammar":["gr-pre2-041","gr-3-021"]},"ac5_abs4":{"grammar":["gr-3-029","gr-4-019"]},"ac5_final2":{"grammar":["gr-1-032"]},"ac5_cite3":{"grammar":["gr-3-027","gr-3-031"]},"ac5_network3":{"grammar":["gr-3-021","gr-3-027"]},"ac5_copy3":{"grammar":["gr-pre2-013","gr-3-019"]},"ac5_review3":{"grammar":["gr-3-018","gr-3-030"]},"ac5_sum4":{"grammar":["gr-3-027","gr-4-020"]},"ac5_gift3":{"grammar":["gr-3-001","gr-3-007"]},"ac5_room3":{"grammar":["gr-3-039","gr-4-007"]},"ac5_shelf3":{"grammar":["gr-3-027","gr-3-039"]},"ac5_mail3":{"grammar":["gr-1-032"]},"ac5_phone3":{"grammar":["gr-3-018","gr-3-027"]},"ac5_closing3":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0448"]},"at1_sort1":{"grammar":["gr-3-022"]},"at1_check_card":{"grammar":["gr-3-022"],"phrases":["ph-pre2-0174"]},"at1_check_fine":{"grammar":["gr-5-011"]},"at1_slot":{"grammar":["gr-3-039","gr-4-008"],"phrases":["ph-4-0149"]},"at1_speech":{"grammar":["gr-3-029","gr-3-039"]},"at1_phone":{"grammar":["gr-3-019","gr-3-022"]},"at1_notice":{"grammar":["gr-3-021","gr-3-029"]},"at1_pad":{"grammar":["gr-3-019","gr-4-008"],"phrases":["ph-4-0141","ph-3-0137"]},"at1_sort2":{"grammar":["gr-5-011"],"phrases":["ph-4-0090"]},"at2_sort1":{"grammar":["gr-3-027"]},"at2_check_pub":{"grammar":["gr-5-011"]},"at2_check_pages":{"phrases":["ph-2-0159"]},"at2_slot":{"grammar":["gr-3-039"]},"at2_speech":{"grammar":["gr-3-001","gr-3-010"]},"at2_phone":{"grammar":["gr-3-007","gr-3-019"]},"at2_notice":{"grammar":["gr-pre2-011","gr-2-030"]},"at2_abs":{"grammar":["gr-pre2-056","gr-3-019"]},"at2_mail":{"grammar":["gr-3-022","gr-3-039"]},"at2_pad":{"grammar":["gr-3-019","gr-3-031"],"phrases":["ph-pre2-0005"]},"at2_sort2":{"grammar":["gr-3-027"]},"at3_sort1":{"grammar":["gr-3-007","gr-3-027"]},"at3_sort2":{"grammar":["gr-3-005","gr-3-006"]},"at3_check_cite":{"grammar":["gr-2-058"],"phrases":["ph-pre2-0174"]},"at3_check_edition":{"grammar":["gr-3-039","gr-5-015"]},"at3_check_copy":{"grammar":["gr-2-030","gr-2-056"]},"at3_check_sum":{"grammar":["gr-pre2-015","gr-pre2-037"]},"at3_check_sum2":{"grammar":["gr-3-001","gr-3-005"],"phrases":["ph-2-0272"]},"at3_slot1":{"grammar":["gr-3-039","gr-4-007"]},"at3_slot2":{"grammar":["gr-3-030","gr-3-039"]},"at3_pad1":{"grammar":["gr-3-001","gr-5-016"]},"at3_pad2":{"grammar":["gr-pre2-056"]},"at3_speech":{"grammar":["gr-pre1-032","gr-pre2-012"]},"at3_phone":{"grammar":["gr-pre2-056"]},"at3_notice":{"grammar":["gr-2-030","gr-2-033"]},"at3_mail":{"grammar":["gr-pre2-015","gr-pre2-041"]},"at3_abs":{"grammar":["gr-2-023","gr-pre2-015"]},"at3_sort3":{"grammar":["gr-3-027","gr-5-011"]},"at4_sort1":{"grammar":["gr-pre1-022"]},"at4_sort2":{"grammar":["gr-pre2-039","gr-pre2-056"]},"at4_check_cite":{"grammar":["gr-5-011"]},"at4_check_card":{"grammar":["gr-pre2-041","gr-3-039"]},"at4_check_loan":{"grammar":["gr-pre2-041","gr-3-021"]},"at4_check_sum":{"grammar":["gr-pre2-065","gr-3-001"],"phrases":["ph-2-0473"]},"at4_check_sum2":{"grammar":["gr-pre2-015","gr-5-011"]},"at4_slot1":{"grammar":["gr-3-039","gr-5-011"]},"at4_slot2":{"grammar":["gr-3-001","gr-3-030"]},"at4_pad1":{"grammar":["gr-2-030"]},"at4_pad2":{"grammar":["gr-3-039","gr-4-020"]},"at4_speech":{"grammar":["gr-pre2-012","gr-pre2-014"]},"at4_phone":{"grammar":["gr-pre1-031","gr-2-030"]},"at4_notice":{"grammar":["gr-2-030"]},"at4_mail":{"grammar":["gr-2-030","gr-2-045"]},"at4_abs":{"grammar":["gr-pre2-006","gr-pre2-034"]},"at4_sort3":{"grammar":["gr-3-022","gr-3-027"]},"at5_sort1":{"grammar":["gr-pre2-039","gr-3-001"]},"at5_sort2":{"grammar":["gr-pre2-055","gr-3-027"]},"at5_check_cite":{"grammar":["gr-3-039","gr-5-011"]},"at5_check_card":{"grammar":["gr-pre1-032"]},"at5_check_pub":{"grammar":["gr-2-058","gr-5-011"]},"at5_check_sum":{"grammar":["gr-3-005","gr-3-006"]},"at5_check_sum2":{"grammar":["gr-pre2-015","gr-5-011"]},"at5_slot1":{"grammar":["gr-3-019","gr-3-039"]},"at5_slot2":{"grammar":["gr-2-030","gr-pre2-011"]},"at5_pad1":{"grammar":["gr-pre2-065","gr-3-001"]},"at5_pad2":{"grammar":["gr-pre2-011","gr-3-039"]},"at5_speech":{"grammar":["gr-2-030","gr-2-045"]},"at5_phone":{"grammar":["gr-pre2-034","gr-3-005"]},"at5_notice":{"grammar":["gr-2-030","gr-pre2-011"]},"at5_mail":{"grammar":["gr-1-032"]},"at5_abs":{"grammar":["gr-pre1-031","gr-pre1-032"]},"at5_sort3":{"grammar":["gr-pre2-039","gr-3-027"]},"qa:speech1:0":{"grammar":["gr-3-039"]},"qa:speech1:1":{"grammar":["gr-5-011"]},"qa:speech1:2":{"grammar":["gr-3-039"]},"qa:speech1:3":{"grammar":["gr-3-039"]},"qa:speech1:4":{"grammar":["gr-3-039","gr-4-026"]},"qa:speech1:5":{"grammar":["gr-3-029","gr-3-039"]},"qa:speech1:6":{"grammar":["gr-5-011"],"phrases":["ph-4-0130"]},"qa:speech1:7":{"grammar":["gr-3-039"]},"qa:speech1:8":{"grammar":["gr-3-021","gr-3-039"]},"qa:phone1:1":{"grammar":["gr-4-008"],"phrases":["ph-4-0140"]},"qa:phone1:2":{"grammar":["gr-3-039"],"phrases":["ph-4-0051"]},"qa:phone1:3":{"grammar":["gr-3-015"],"phrases":["ph-4-0150"]},"qa:phone1:4":{"grammar":["gr-3-022"]},"qa:phone1:5":{"grammar":["gr-3-019","gr-3-039"],"phrases":["ph-4-0072"]},"qa:phone1:6":{"grammar":["gr-3-015","gr-pre2-012"],"phrases":["ph-4-0150"]},"qa:notice1:0":{"grammar":["gr-3-019","gr-3-031"]},"qa:notice1:1":{"grammar":["gr-3-021","gr-3-039"],"phrases":["ph-4-0075"]},"qa:notice1:2":{"grammar":["gr-3-029"]},"qa:notice1:3":{"grammar":["gr-3-039"]},"qa:notice1:4":{"grammar":["gr-5-013"],"phrases":["ph-4-0150"]},"qa:notice1:5":{"grammar":["gr-4-026"]},"qa:notice1:6":{"grammar":["gr-3-039"]},"qa:notice1:7":{"grammar":["gr-3-029"]},"qa:speech2:0":{"grammar":["gr-3-039"]},"qa:speech2:1":{"grammar":["gr-3-039"]},"qa:speech2:2":{"grammar":["gr-3-010","gr-3-039"]},"qa:speech2:3":{"grammar":["gr-3-039"]},"qa:speech2:4":{"grammar":["gr-3-001","gr-3-039"]},"qa:speech2:5":{"grammar":["gr-3-039"]},"qa:speech2:6":{"grammar":["gr-3-001","gr-3-029"]},"qa:speech2:7":{"grammar":["gr-4-026"],"phrases":["ph-3-0005"]},"qa:phone2:0":{"grammar":["gr-3-007","gr-3-019"],"phrases":["ph-pre2-0397"]},"qa:phone2:1":{"grammar":["gr-3-039"]},"qa:phone2:2":{"grammar":["gr-3-039"],"phrases":["ph-pre2-0312"]},"qa:phone2:3":{"grammar":["gr-3-039"]},"qa:phone2:4":{"grammar":["gr-3-039"]},"qa:phone2:5":{"grammar":["gr-4-026","gr-5-011"]},"qa:notice2:0":{"grammar":["gr-3-001","gr-3-018"]},"qa:notice2:1":{"grammar":["gr-3-021","gr-3-039"]},"qa:notice2:2":{"grammar":["gr-3-019","gr-3-021"]},"qa:notice2:3":{"grammar":["gr-3-039"]},"qa:notice2:4":{"grammar":["gr-3-029"]},"qa:notice2:5":{"grammar":["gr-4-026"]},"qa:notice2:6":{"grammar":["gr-pre2-011","gr-2-030"]},"qa:notice2:7":{"grammar":["gr-4-019","gr-5-013"]},"qa:mail2:0":{"grammar":["gr-3-039"]},"qa:mail2:1":{"grammar":["gr-3-039"]},"qa:mail2:2":{"grammar":["gr-3-022","gr-3-039"]},"qa:mail2:3":{"grammar":["gr-3-039"]},"qa:mail2:4":{"grammar":["gr-3-039"]},"qa:mail2:5":{"grammar":["gr-3-039"]},"qa:abs2:0":{"grammar":["gr-4-019"]},"qa:abs2:1":{"grammar":["gr-3-005","gr-3-019"]},"qa:abs2:4":{"grammar":["gr-pre2-056"]},"qa:abs2:5":{"grammar":["gr-3-027"]},"qa:speech3:0":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre2-0111"]},"qa:speech3:1":{"grammar":["gr-pre2-055","gr-pre2-056"],"phrases":["ph-2-0495"]},"qa:speech3:2":{"grammar":["gr-3-010","gr-3-039"]},"qa:speech3:3":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:speech3:4":{"grammar":["gr-3-007","gr-3-039"]},"qa:speech3:5":{"grammar":["gr-3-001","gr-3-039"],"phrases":["ph-pre2-0056"]},"qa:speech3:6":{"grammar":["gr-pre1-032"],"phrases":["ph-2-0159"]},"qa:speech3:7":{"grammar":["gr-3-007","gr-3-039"]},"qa:phone3:0":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:1":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:2":{"grammar":["gr-pre2-056"]},"qa:phone3:3":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:4":{"grammar":["gr-3-019","gr-3-039"]},"qa:phone3:5":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:6":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone3:7":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:0":{"grammar":["gr-2-056"]},"qa:notice3:1":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:2":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice3:3":{"grammar":["gr-2-033","gr-pre2-056"]},"qa:notice3:4":{"grammar":["gr-3-007","gr-3-039"]},"qa:notice3:5":{"grammar":["gr-pre2-015"]},"qa:notice3:6":{"grammar":["gr-3-039","gr-4-006"]},"qa:notice3:7":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:mail3:0":{"grammar":["gr-3-039","gr-4-002"],"phrases":["ph-2-0272"]},"qa:mail3:1":{"grammar":["gr-pre2-041"]},"qa:mail3:2":{"grammar":["gr-3-039","gr-4-006"]},"qa:mail3:3":{"grammar":["gr-pre2-015"],"phrases":["ph-2-0272"]},"qa:mail3:4":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:mail3:5":{"grammar":["gr-3-039","gr-4-006"]},"qa:mail3:6":{"grammar":["gr-3-039","gr-4-007"]},"qa:mail3:7":{"grammar":["gr-3-007","gr-3-014"]},"qa:abs3:0":{"grammar":["gr-pre2-039"]},"qa:abs3:1":{"grammar":["gr-pre2-056"]},"qa:abs3:2":{"grammar":["gr-3-007","gr-3-019"],"phrases":["ph-pre2-0289"]},"qa:abs3:3":{"grammar":["gr-3-022","gr-3-029"]},"qa:abs3:4":{"grammar":["gr-3-005","gr-3-006"]},"qa:abs3:5":{"grammar":["gr-3-005","gr-3-021"]},"qa:abs3:6":{"grammar":["gr-2-023","gr-pre2-033"],"phrases":["ph-pre2-0289"]},"qa:abs3:7":{"grammar":["gr-pre2-015","gr-pre2-037"]},"qa:speech4:0":{"grammar":["gr-2-030"]},"qa:speech4:1":{"grammar":["gr-2-030"]},"qa:speech4:2":{"grammar":["gr-3-001","gr-3-039"]},"qa:speech4:3":{"grammar":["gr-2-030"]},"qa:speech4:4":{"grammar":["gr-pre2-014","gr-pre2-015"]},"qa:speech4:5":{"grammar":["gr-2-030"]},"qa:speech4:6":{"grammar":["gr-3-010","gr-3-018"],"phrases":["ph-pre1-0448"]},"qa:speech4:7":{"grammar":["gr-pre2-012","gr-3-001"]},"qa:phone4:0":{"grammar":["gr-pre2-055","gr-3-039"],"phrases":["ph-2-0272"]},"qa:phone4:1":{"grammar":["gr-pre2-055","gr-3-001"]},"qa:phone4:2":{"grammar":["gr-pre2-015","gr-3-019"]},"qa:phone4:3":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone4:4":{"grammar":["gr-3-039","gr-4-006"]},"qa:phone4:5":{"grammar":["gr-pre2-041","gr-3-039"]},"qa:phone4:6":{"grammar":["gr-pre1-031"]},"qa:phone4:7":{"grammar":["gr-2-030"]},"qa:notice4:0":{"grammar":["gr-2-030"]},"qa:notice4:1":{"grammar":["gr-3-001","gr-3-003"]},"qa:notice4:2":{"grammar":["gr-2-030"]},"qa:notice4:3":{"grammar":["gr-2-030"]},"qa:notice4:4":{"grammar":["gr-pre2-011","gr-3-018"]},"qa:notice4:5":{"grammar":["gr-3-039","gr-4-006"]},"qa:notice4:6":{"grammar":["gr-3-039","gr-4-006"]},"qa:notice4:7":{"grammar":["gr-2-030"]},"qa:mail4:0":{"grammar":["gr-2-045"]},"qa:mail4:1":{"grammar":["gr-3-018","gr-3-022"]},"qa:mail4:2":{"grammar":["gr-2-030","gr-2-045"]},"qa:mail4:3":{"grammar":["gr-3-018","gr-3-019"],"phrases":["ph-2-0299"]},"qa:mail4:4":{"grammar":["gr-2-030"]},"qa:mail4:5":{"grammar":["gr-3-005","gr-3-039"]},"qa:mail4:6":{"grammar":["gr-2-030"]},"qa:mail4:7":{"grammar":["gr-pre2-055","gr-3-027"]},"qa:abs4:0":{"grammar":["gr-pre2-034","gr-3-005"]},"qa:abs4:1":{"grammar":["gr-4-020"]},"qa:abs4:2":{"grammar":["gr-3-007","gr-3-019"]},"qa:abs4:3":{"grammar":["gr-pre1-022"]},"qa:abs4:4":{"grammar":["gr-3-019","gr-4-014"]},"qa:abs4:5":{"grammar":["gr-3-027","gr-4-026"]},"qa:abs4:6":{"grammar":["gr-3-022","gr-3-029"]},"qa:abs4:7":{"grammar":["gr-4-019"]},"qa:speech5:0":{"grammar":["gr-2-030","gr-2-045"]},"qa:speech5:1":{"grammar":["gr-pre2-055","gr-3-001"]},"qa:speech5:2":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:speech5:3":{"grammar":["gr-3-010","gr-3-027"]},"qa:speech5:4":{"grammar":["gr-pre2-055","gr-pre2-065"]},"qa:speech5:5":{"grammar":["gr-3-001","gr-3-005"]},"qa:speech5:6":{"grammar":["gr-pre2-015","gr-3-001"]},"qa:speech5:7":{"grammar":["gr-pre2-065","gr-3-001"],"phrases":["ph-1-0102"]},"qa:phone5:0":{"grammar":["gr-3-007","gr-3-019"]},"qa:phone5:1":{"grammar":["gr-3-018","gr-3-039"],"phrases":["ph-pre1-0448"]},"qa:phone5:2":{"grammar":["gr-3-021","gr-3-039"]},"qa:phone5:3":{"grammar":["gr-2-030","gr-pre2-011"],"phrases":["ph-pre1-0448"]},"qa:phone5:4":{"grammar":["gr-pre2-015","gr-3-029"]},"qa:phone5:5":{"grammar":["gr-3-031","gr-3-039"]},"qa:phone5:6":{"grammar":["gr-3-039","gr-4-002"]},"qa:phone5:7":{"grammar":["gr-3-039","gr-4-002"]},"qa:notice5:0":{"grammar":["gr-pre2-053","gr-3-019"]},"qa:notice5:1":{"grammar":["gr-5-013"]},"qa:notice5:2":{"grammar":["gr-3-018","gr-3-030"]},"qa:notice5:3":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:notice5:4":{"grammar":["gr-3-006","gr-3-039"]},"qa:notice5:5":{"grammar":["gr-3-022","gr-3-039"]},"qa:notice5:6":{"grammar":["gr-3-031","gr-5-013"]},"qa:notice5:7":{"grammar":["gr-pre2-013","gr-3-019"]},"qa:mail5:0":{"grammar":["gr-3-007","gr-3-019"]},"qa:mail5:1":{"grammar":["gr-pre2-015","gr-3-021"]},"qa:mail5:2":{"grammar":["gr-pre2-034","gr-3-005"],"phrases":["ph-pre1-0448"]},"qa:mail5:3":{"grammar":["gr-pre2-037","gr-3-001"]},"qa:mail5:4":{"grammar":["gr-3-001","gr-3-003"]},"qa:mail5:5":{"grammar":["gr-pre2-046","gr-3-027"]},"qa:mail5:6":{"grammar":["gr-1-032"]},"qa:mail5:7":{"grammar":["gr-2-030","gr-pre2-011"]},"qa:abs5:0":{"grammar":["gr-3-005","gr-3-019"]},"qa:abs5:1":{"grammar":["gr-pre1-031"]},"qa:abs5:2":{"grammar":["gr-3-007","gr-3-027"]},"qa:abs5:3":{"grammar":["gr-3-002","gr-3-005"]},"qa:abs5:4":{"grammar":["gr-pre2-015","gr-3-022"]},"qa:abs5:5":{"grammar":["gr-pre1-032"]},"qa:abs5:6":{"grammar":["gr-pre2-033","gr-pre2-039"]},"qa:abs5:7":{"grammar":["gr-pre1-034"]}};
// <<END:TAGS>>

// <<GEN:FORMS>>
const EXTRA_FORMS: Record<string, string[]> = {"loan":["loans"],"machine":["machines"],"computer":["computers"],"renew":["renewals"],"paint":["paintings"],"th_harvest":["harvests"],"hot":["hotter"],"library":["libraries"],"copy":["copied","copying"],"study":["studied"],"th_booking":["bookings"],"safe":["saves"],"last":["lasted"],"village":["villages"],"th_collection":["collections"],"th_reference":["references"],"suggestion":["suggestions"],"application":["applications"],"th_rich":["richer"],"present":["presented"],"follow":["followed"],"school":["schools"],"gift":["gifts"],"one":["ones"],"glad":["gladly"],"accept":["accepting","accepts"],"factory":["factories"],"church":["churches"],"warm":["warming"],"correct":["corrects"],"change":["changing"],"port":["ports"],"forget":["forgotten"],"th_statue":["statues"],"estimate":["estimating"],"reject":["rejects"],"save":["saved"],"color":["colors"],"river":["rivers"],"town":["towns"],"market":["markets"],"harbour":["harbours"],"move":["moves"],"result":["results"],"support":["supports"],"warn":["warns"],"interview":["interviewed"],"test":["tests"],"survey":["surveyed"],"word":["wording"]};
// <<END:FORMS>>

// <<GEN:LEX>>
const LEX_SRC = `
# jac2_001 | 学院図書室の芸術 ①（3級）
author|noun||著者||ac_author
cent|noun|cents|セント||ac_cent
king|noun|kings|王||ac_king
poem|noun|poems|詩||ac_poem
popular|adj||人気のある||ac_popular
# jac2_002 | 学院図書室の芸術 ②（3級）
production|noun||生産||ac_production
queen|noun|queens|女王||ac_queen
song|noun|songs|歌||ac_song
style|noun||スタイル||ac_style
# jac2_003 | 学院図書室の学校（3級）
academy|noun||学院||ac_academy
drawing|noun|drawings|デッサン・図面||ac_drawing
literature|noun||文学||ac_literature
# jac2_004 | 学院図書室の科学（3級）
discovery|noun||発見||ac_discovery
math|noun|maths|数学||ac_math
metal|noun|metals|金属||ac_metal
# jac3_005 | 学院図書室の芸術 ①（準2級）
animal|noun|animals|動物||ac_animal
clown|noun||道化師||ac_clown
comedy|noun||喜劇||ac_comedy
dance|noun|dances|ダンス||ac_dance
# jac3_006 | 学院図書室の芸術 ②（準2級）
description|noun||説明||ac_description
empire|noun||帝国||ac_empire
folk|noun||人々||ac_folk
gallery|noun||画廊||ac_gallery
# jac3_007 | 学院図書室の芸術 ③（準2級）
knight|noun|knights|騎士||ac_knight
manual|adj||手動の||ac_manual
melody|noun||美しい音の流れ||ac_melody
mystery|noun||なぞ||ac_mystery
# jac3_008 | 学院図書室の芸術 ④（準2級）
poet|noun|poet's,poets|詩人||ac_poet
pottery|noun||陶器||ac_pottery
rhythm|noun||リズム||ac_rhythm
rock|noun|rocks|岩||ac_rock
# jac3_009 | 学院図書室の芸術 ⑤（準2級）
sailor|noun|sailors|船乗り||ac_sailor
soil|verb||汚す||ac_soil
tale|noun|tales|物語||ac_tale
useful|adj||役に立つ||ac_useful
# jac3_010 | 学院図書室の自然 ①（準2級）
air|noun||空気||ac_air
clay|noun||粘土||ac_clay
herb|noun|herbs|草||ac_herb
# jac3_011 | 学院図書室の自然 ②（準2級）
mineral|noun|minerals|鉱物||ac_mineral
volcano|noun|volcanoes|火山||ac_volcano
wild|adj||野生の||ac_wild
# jac3_012 | 学院図書室の学校 ①（準2級）
archive|noun|archives|公文書館||ac_archive
biography|noun||伝記||ac_biography
chapter|noun|chapters|章||ac_chapter
clever|adj||賢い||ac_clever
# jac3_013 | 学院図書室の学校 ②（準2級）
dictionary|noun|dictionaries|辞書||ac_dictionary
encyclopedia|noun||百科事典||ac_encyclopedia
essay|noun|essays|小論文||ac_essay
handbook|noun||手引き||ac_handbook
# jac3_014 | 学院図書室の学校 ③（準2級）
lecturer|noun||講演者||ac_lecturer
legend|noun||伝説||ac_legend
scholar|noun|scholars|学者||ac_scholar
syllabus|noun||要項||ac_syllabus
# jac3_015 | 学院図書室の科学 ①（準2級）
abstract|adj|abstracts|抽象的な||ac_abstract
cell|noun||細胞||ac_cell
circle|noun||円||ac_circle
diagram|noun|diagrams|図||ac_diagram
# jac3_016 | 学院図書室の科学 ②（準2級）
earth|noun||地球||ac_earth
oxygen|noun||酸素||ac_oxygen
device|noun||装置||ac_device
electronic|adj||電子の||ac_electronic
# jac4_017 | 学院図書室の芸術 ①（2級）
animation|noun||アニメーション||ac_animation
audience|noun||観客||ac_audience
cartoon|noun||漫画||ac_cartoon
classical|adj||古典の||ac_classical
composer|noun||作曲家||ac_composer
# jac4_018 | 学院図書室の芸術 ②（2級）
dark|adj||暗い||ac_dark
dislike|noun|disliked|嫌悪||ac_dislike
farming|noun||農業||ac_farming
harmony|noun||調和||ac_harmony
# jac4_019 | 学院図書室の芸術 ③（2級）
hero|noun||英雄||ac_hero
journey|noun||旅行||ac_journey
modern|adj||現代の||ac_modern
narrative|adj||物語の||ac_narrative
# jac4_020 | 学院図書室の芸術 ④（2級）
passage|noun||通路||ac_passage
photocopy|noun||コピー||ac_photocopy
plot|noun||筋||ac_plot
poetry|noun||詩||ac_poetry
# jac4_021 | 学院図書室の芸術 ⑤（2級）
porter|noun||ポーター||ac_porter
prose|noun||散文||ac_prose
role|noun||役割||ac_role
sculpture|noun|sculptures|彫刻||ac_sculpture
# jac4_022 | 学院図書室の芸術 ⑥（2級）
symphony|noun||交響曲||ac_symphony
tragedy|noun||悲劇||ac_tragedy
tune|noun||曲||ac_tune
verse|noun||詩||ac_verse
# jac4_023 | 学院図書室の芸術 ⑦（2級）
voyage|noun|voyages|航海||ac_voyage
weaken|verb|weakened|弱める||ac_weaken
wealth|noun||富||ac_wealth
yourself|pron||あなた自身||ac_yourself
# jac4_024 | 学院図書室のメディア（2級）
brochure|noun||パンフレット||ac_brochure
manuscript|noun||原稿||ac_manuscript
periodical|noun||定期刊行物||ac_periodical
# jac4_025 | 学院図書室の自然（2級）
climate|noun||気候||ac_climate
coal|noun||石炭||ac_coal
northern|adj||北の||ac_northern
ocean|noun||大洋||ac_ocean
# jac4_026 | 学院図書室の学校 ①（2級）
dean|noun||学部長||ac_dean
dynasty|noun||王朝||ac_dynasty
historian|noun||歴史家||ac_historian
introduction|noun||紹介||ac_introduction
journal|noun|journals|日誌||ac_journal
# jac4_027 | 学院図書室の学校 ②（2級）
librarian|noun||司書||ac_librarian
literary|adj||文学の||ac_literary
summarize|verb|summarized|要約する||ac_summarize
textbook|noun||教科書||ac_textbook
thesis|noun|theses|陳述||ac_thesis
# jac4_028 | 学院図書室の科学 ①（2級）
carbon|noun||炭素||ac_carbon
cycle|noun||周期||ac_cycle
exploration|noun||探検||ac_exploration
formation|noun||形成||ac_formation
# jac4_029 | 学院図書室の科学 ②（2級）
geometry|noun||幾何学||ac_geometry
logic|noun||論理||ac_logic
measurement|noun|measurements|測定||ac_measurement
molecule|noun||分子||ac_molecule
# jac4_030 | 学院図書室の科学 ③（2級）
orbit|noun||軌道||ac_orbit
proportion|noun||割合||ac_proportion
ratio|noun||比||ac_ratio
revolution|noun||革命||ac_revolution
# jac4_031 | 学院図書室の科学 ④（2級）
statistics|noun||統計||ac_statistics
structure|noun||構造||ac_structure
volume|noun|volumes|量||ac_volume
# jac4_032 | 学院図書室の社会（2級）
ancient|adj||古代の||ac_ancient
province|noun||州||ac_province
tribe|noun|tribes|部族||ac_tribe
# jac4_033 | 学院図書室の技術 ①（2級）
cable|noun|cables|ケーブル||ac_cable
circuit|noun||回路||ac_circuit
database|noun||データベース||ac_database
# jac4_034 | 学院図書室の技術 ②（2級）
edit|verb|edited|編集する||ac_edit
network|noun||ネットワーク||ac_network
solution|noun|solutions|解決策||ac_solution
# jac5_035 | 学院図書室の様子を表すことば ①（準1級）
anywhere|adv||どこでも||ac_anywhere
contrary|adj||反対の||ac_contrary
medieval|adj||中世の||ac_medieval
# jac5_036 | 学院図書室の様子を表すことば ②（準1級）
mostly|adv||たいてい||ac_mostly
nineteenth|adj||19分の1の||ac_nineteenth
tall|adj|taller|背が高い||ac_tall
# jac5_037 | 学院図書室の芸術 ①（準1級）
aesthetic|adj||美的な||ac_aesthetic
architecture|noun||建築術||ac_architecture
chorus|noun||合唱||ac_chorus
ensemble|noun||アンサンブル||ac_ensemble
genre|noun||ジャンル||ac_genre
# jac5_038 | 学院図書室の芸術 ②（準1級）
imagery|noun||イメージ||ac_imagery
masterpiece|noun||傑作||ac_masterpiece
palette|noun||パレット||ac_palette
romantic|adj||ロマンチックな||ac_romantic
# jac5_039 | 学院図書室の芸術 ③（準1級）
saga|noun||大河物語||ac_saga
sonnet|noun||ソネット||ac_sonnet
soundtrack|noun||サウンドトラック||ac_soundtrack
trilogy|noun||三部作||ac_trilogy
# jac5_040 | 学院図書室のメディア ①（準1級）
anthology|noun||アンソロジー||ac_anthology
censorship|noun||検閲||ac_censorship
commentary|noun||論評||ac_commentary
critical|adj||批判的な||ac_critical
# jac5_041 | 学院図書室のメディア ②（準1級）
current|adj|currents|現在の||ac_current
memoir|noun||回顧録||ac_memoir
propaganda|noun||宣伝||ac_propaganda
# jac5_042 | 学院図書室の学校 ①（準1級）
examine|verb|examined,examines|調べる||ac_examine
lesson|noun|lessons|授業||ac_lesson
pencil|noun|pencils|鉛筆||ac_pencil
# jac5_043 | 学院図書室の学校 ②（準1級）
plagiarism|noun||盗用||ac_plagiarism
seminar|noun||セミナー||ac_seminar
topic|noun||話題||ac_topic
# jac5_044 | 学院図書室の科学 ①（準1級）
acquisition|noun|acquisitions|取得||ac_acquisition
cathedral|noun||大聖堂||ac_cathedral
conclude|verb|concludes|終える||ac_conclude
curve|noun|curved,curves|曲線||ac_curve
# jac5_045 | 学院図書室の科学 ②（準1級）
ecology|noun||生態学||ac_ecology
enzyme|noun||酵素||ac_enzyme
equation|noun||方程式||ac_equation
evolution|noun||進化||ac_evolution
# jac5_046 | 学院図書室の科学 ③（準1級）
fleet|noun||艦隊||ac_fleet
gravity|noun||重力||ac_gravity
hop|noun|hoped|ぴょんと跳ぶこと||ac_hop
laser|noun||レーザー||ac_laser
# jac5_047 | 学院図書室の科学 ④（準1級）
matrix|noun||行列||ac_matrix
model|noun||模型||ac_model
mutation|noun||突然変異||ac_mutation
optical|adj||光学の||ac_optical
# jac5_048 | 学院図書室の科学 ⑤（準1級）
railway|noun||鉄道||ac_railway
spectrum|noun||スペクトル||ac_spectrum
theorem|noun||定理||ac_theorem
type|noun||種類||ac_type
# jac5_049 | 学院図書室の科学 ⑥（準1級）
vector|noun||ベクトル||ac_vector
voltage|noun||電圧||ac_voltage
weekly|adj||毎週の||ac_weekly
# jac5_050 | 学院図書室の社会（準1級）
civilization|noun||文明||ac_civilization
fellowship|noun|fellowships|仲間意識||ac_fellowship
kingdom|noun||王国||ac_kingdom
migration|noun||移住||ac_migration
monk|noun||僧||ac_monk
# jac5_051 | 学院図書室の技術 ①（準1級）
antenna|noun||アンテナ||ac_antenna
digital|adj||デジタルの||ac_digital
download|verb|downloaded|ダウンロードする||ac_download
# jac5_052 | 学院図書室の技術 ②（準1級）
radar|noun||レーダー||ac_radar
sensor|noun||感知器||ac_sensor
simulation|noun||シミュレーション||ac_simulation
# jac5_053 | 学院図書室の動詞（準1級）
cite|verb|cited,citing|引用する||ac_cite
crane|verb|cranes|首を伸ばす||ac_crane
distort|verb|distorts|ゆがめる||ac_distort
# jac6_054 | 学院図書室の様子を表すことば（1級）
common|adj||共通の||ac_common
freely|adv||自由に||ac_freely
giant|adj||巨大な||ac_giant
# jac6_055 | 学院図書室の芸術 ①（1級）
ballad|noun||バラード||ac_ballad
baroque|adj||バロック様式の||ac_baroque
blueprint|noun||設計図||ac_blueprint
cello|noun||チェロ||ac_cello
# jac6_056 | 学院図書室の芸術 ②（1級）
chord|noun||和音||ac_chord
choreography|noun||振り付け||ac_choreography
concerto|noun||協奏曲||ac_concerto
curator|noun||学芸員||ac_curator
# jac6_057 | 学院図書室の芸術 ③（1級）
hymn|noun||賛美歌||ac_hymn
jazz|noun||ジャズ||ac_jazz
mythology|noun||神話||ac_mythology
organ|noun||器官||ac_organ
# jac6_058 | 学院図書室の芸術 ④（1級）
pastoral|adj||牧歌的な||ac_pastoral
playwright|noun||劇作家||ac_playwright
protagonist|noun||主人公||ac_protagonist
pseudonym|noun||ペンネーム||ac_pseudonym
# jac6_059 | 学院図書室の芸術 ⑤（1級）
rehearse|verb||けいこする||ac_rehearse
screenplay|noun||脚本||ac_screenplay
sculptor|noun||彫刻家||ac_sculptor
tempo|noun||テンポ||ac_tempo
# jac6_060 | 学院図書室の通信（1級）
dialect|noun||方言||ac_dialect
hint|noun||暗示||ac_hint
signal|noun||信号||ac_signal
# jac6_061 | 学院図書室のメディア（1級）
channel|noun||チャンネル||ac_channel
copyright|noun||著作権||ac_copyright
mislead|verb|misled|誤解させる||ac_mislead
pamphlet|noun|pamphlets|パンフレット||ac_pamphlet
publication|noun||出版||ac_publication
# jac6_062 | 学院図書室の自然（1級）
layer|noun||層||ac_layer
overfishing|noun||乱獲||ac_overfishing
ozone|noun||オゾン||ac_ozone
sand|noun||砂||ac_sand
silt|verb|silts|土砂でふさがる||ac_silt
# jac6_063 | 学院図書室の学校 ①（1級）
comparison|noun||比較||ac_comparison
imitate|verb|imitated|まねる||ac_imitate
monograph|noun||専門書||ac_monograph
# jac6_064 | 学院図書室の学校 ②（1級）
pupil|noun|pupils|生徒||ac_pupil
relevant|adj||関連のある||ac_relevant
theme|noun||主題||ac_theme
# jac6_065 | 学院図書室の科学 ①（1級）
algebra|noun||代数||ac_algebra
archaeology|noun||考古学||ac_archaeology
ballet|noun||バレエ||ac_ballet
calculus|noun||微積分学||ac_calculus
# jac6_066 | 学院図書室の科学 ②（1級）
combine|verb||結合する||ac_combine
computation|noun||計算||ac_computation
conclusive|adj||決定的な||ac_conclusive
conservator|noun|conservators|（文化財の）修復士||ac_conservator
# jac6_067 | 学院図書室の科学 ③（1級）
damp|adj||湿った||ac_damp
death|noun||死||ac_death
decimal|noun||小数||ac_decimal
domain|noun||領域||ac_domain
# jac6_068 | 学院図書室の科学 ④（1級）
empirical|adj||経験的な||ac_empirical
fraction|noun||分数||ac_fraction
geological|adj||地質学の||ac_geological
grain|noun||穀物||ac_grain
# jac6_069 | 学院図書室の科学 ⑤（1級）
influence|noun||影響||ac_influence
kindness|noun||親切||ac_kindness
load|noun||荷物||ac_load
motion|noun||動き||ac_motion
# jac6_070 | 学院図書室の科学 ⑥（1級）
neuron|noun||ニューロン||ac_neuron
plankton|noun||プランクトン||ac_plankton
plus|prep||～に加えて||ac_plus
polymer|noun||ポリマー||ac_polymer
# jac6_071 | 学院図書室の科学 ⑦（1級）
qualification|noun||資格を与えること||ac_qualification
registration|noun||登録||ac_registration
reproduce|verb||繁殖する||ac_reproduce
shift|verb|shifted|移す||ac_shift
# jac6_072 | 学院図書室の科学 ⑧（1級）
sociology|noun||社会学||ac_sociology
synthesis|noun||合成||ac_synthesis
universe|noun||宇宙||ac_universe
wavelength|noun||波長||ac_wavelength
# jac6_073 | 学院図書室の社会（1級）
contributor|noun|contributors|寄稿者・貢献者||ac_contributor
monument|noun||記念碑||ac_monument
donor|noun||寄付者||ac_donor
supervisor|noun||上司||ac_supervisor
tradition|noun||しきたり||ac_tradition
# jac6_074 | 学院図書室の技術（1級）
amplifier|noun||アンプ||ac_amplifier
automation|noun||自動化||ac_automation
firewall|noun||ファイアウォール||ac_firewall
transistor|noun||トランジスタ||ac_transistor
# jac6_075 | 学院図書室の動詞 ①（1級）
assume|verb||思い込む||ac_assume
conjecture|verb||推測する||ac_conjecture
consult|verb||相談する||ac_consult
withstand|verb||耐える||ac_withstand
# jac6_076 | 学院図書室の動詞 ②（1級）
worsen|verb||悪化させる||ac_worsen
fishery|noun|fisheries|漁業||ac_fishery
shipwreck|noun||難破||ac_shipwreck
# jac2_077 | 学院図書室のことば（3級）
wave|noun|waves|波||ac_wave
wood|noun||木材||ac_wood
technology|noun||技術||ac_technology
# jac5_078 | 学院図書室のことば（準1級）
citation|noun||引用||ac_citation
telegraph|noun||電報||ac_telegraph
continent|noun||大陸||ac_continent
inland|adj||内陸の||ac_inland
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
const TIMES2: Axis[] = [
  { id: 't9', label: '9:30', tags: ['morning'] },
  { id: 't11', label: '11:00', tags: ['morning'] },
  { id: 't1', label: '1:30', tags: ['afternoon'] },
  { id: 't3', label: '3:00', tags: ['afternoon'] },
];
/** Rooms and the days and times at which they can be booked (rank 3–5). */
const ROOMS: Axis[] = [
  { id: 's1', label: 'Study room 1', tags: ['small', 'quiet'] },
  { id: 's2', label: 'Study room 2', tags: ['small', 'computers'] },
  { id: 'hall', label: 'Lecture hall', tags: ['large'] },
];
const ROOMCOLS: Axis[] = [
  { id: 'mon10', label: 'Monday 10:00', tags: ['mon', 'morning'] },
  { id: 'mon2', label: 'Monday 2:00', tags: ['mon', 'afternoon'] },
  { id: 'tue10', label: 'Tuesday 10:00', tags: ['tue', 'morning'] },
  { id: 'tue2', label: 'Tuesday 2:00', tags: ['tue', 'afternoon'] },
  { id: 'wed10', label: 'Wednesday 10:00', tags: ['wed', 'morning'] },
  { id: 'wed2', label: 'Wednesday 2:00', tags: ['wed', 'afternoon'] },
];
const READERS = ['{Professor Hale|@}', '{Ken|@}', '{Ms. Reyes|@}', '{Mr. Ashby|@}', 'Closed', 'Reserved'];

// ---------------------------------------------------------------------------- rank 1 (英検3級 · TOEIC 〜500)
// The first weeks at the desk: books to the right shelf, a card that differs from the title page, hours, loans and fines from
// a notice, a study room for a day and a time, a message by the telephone.

const R1: AuthoredTask[] = [
  sort('ac1_shelf1', 1, 'Good morning. Please put these books on the right shelves.', ['science', 'history', 'literature'], [['A book about the stars', 'science'], ['A book of old stories', 'literature'], ['A book about the old town', 'history']]),
  check('ac1_card1', 1, 'c_student', 'I want this book. Is the year on the card right?', [P('card', 'Card', ['Title|The Stars of Spring', 'Author|{Helen Marsh|@}', 'Year|1998']), P('label', 'Title page', ['Title|The Stars of Spring', 'Author|{Helen Marsh|@}', 'Year|1989'])], 'Year'),
  msg('ac1_hours', 1, 'c_cook', 'memo', { say: 'Is the library open on Saturday afternoon?' }, ['Library hours', 'Monday to Friday: 8:30 to 6:00', 'Saturday: 9:00 to 1:00', 'Sunday: closed'], 'No, it closes at one on Saturday.', ['Yes, it is open until six.', 'No, it is closed on Saturday.']),
  slot('ac1_room1', 1, 'c_student', 'speech', ['I want a study room.', 'I can come on Tuesday.'], DAYS.slice(0, 3), TIMES.slice(0, 3), ['tue'], [], 'tue-t11', READERS, {}),
  check('ac1_ok1', 1, 'c_oldman', 'I found this book on the shelf. Is the card right?', [P('card', 'Card', ['Title|Birds of the Bay', 'Author|{Peter Dunn|@}', 'Year|2001']), P('label', 'Title page', ['Title|Birds of the Bay', 'Author|{Peter Dunn|@}', 'Year|2001'])], null),
  msg('ac1_loan', 1, 'c_girl', 'memo', { say: 'How long can I keep a book?' }, ['Loans', 'You can keep a book for three weeks.', 'A late book costs 20 cents a day.'], 'You can keep it for three weeks.', ['You can keep it for two weeks.', 'You can keep it for three days.']),
  sort('ac1_shelf2', 1, 'More books, please. Look at the title of each one.', ['arts', 'maths', 'tech', 'science'], [['A book of songs', 'arts'], ['A book about numbers', 'maths'], ['A book about machines', 'tech'], ['A book about the sea and the fish', 'science']]),
  pad('ac1_pad1', 1, 'p_thorne', ['Hello, this is {Professor Hale|@}.', 'I want to reserve a book about birds.', 'Please call me back tomorrow.'], [
    ['who', 'Caller', '{Professor Hale|@}', ['{Ken|@}', '{Mr. Grant|@}']],
    ['want', 'About', 'a book about birds', ['a book about fish', 'a book about stars']],
    ['call', 'Call back', 'tomorrow', ['today', 'on Friday']],
  ], { say: 'The telephone is ringing. Please write down the message.' }),
  msg('ac1_fine', 1, 'c_boy', 'memo', { say: 'My book is two days late. How much must I pay?' }, ['Loans', 'You can keep a book for three weeks.', 'A late book costs 20 cents a day.'], 'You must pay 40 cents.', ['You must pay 20 cents.', 'You must pay 4 dollars.']),
  check('ac1_author', 1, 'c_student', 'Please check the author on this card.', [P('card', 'Card', ['Title|Maths for Children', 'Author|{Clara Boyd|@}']), P('label', 'Title page', ['Title|Maths for Children', 'Author|{Clara Boyle|@}'])], 'Author'),
  msg('ac1_reading', 1, 'c_grandma', 'memo', { say: 'Where is the reading room?' }, ['Floors', 'The reading room is on the first floor.', 'The study rooms are on the second floor.'], 'It is on the first floor.', ['It is on the second floor.', 'It is next to the study rooms.']),
  slot('ac1_room2', 1, 'c_girl', 'speech', ['I want a study room for my friends and me.', 'We can come in the afternoon, but not on Monday.'], DAYS.slice(0, 4), TIMES, ['afternoon'], ['mon'], 'wed-t2', READERS, {}),
  msg('ac1_card', 1, 'c_mom', 'memo', { say: 'Can I take a book home without a library card?' }, ['Borrowing', 'You need a library card to borrow a book.', 'The card is free for every resident.'], 'No, you need a library card.', ['Yes, you can take it home today.', 'No, the card costs ten dollars.']),
  sort('ac1_shelf3', 1, 'Please read each one.', ['history', 'literature', 'arts', 'science'], [['{Helen Marsh|@}: Stars of the Night', 'science'], ['{Peter Dunn|@}: Stories of the Sea', 'literature'], ['{Clara Boyd|@}: The History of Our Town', 'history'], ['{Samuel Page|@}: Songs of the Harbour', 'arts']]),
  check('ac1_title', 1, 'c_oldman', 'Is the title on this card the same as on the book?', [P('card', 'Card', ['Title|Birds of the Sea', 'Author|{Peter Dunn|@}']), P('label', 'Title page', ['Title|Birds of the Bay', 'Author|{Peter Dunn|@}'])], 'Title'),
  pad('ac1_pad2', 1, 'p_thorne', ['Good morning. This is {Ken|@}.', 'I lost a book about maths.', 'I will come to the library on Friday.'], [
    ['who', 'Caller', '{Ken|@}', ['{Tom|@}', '{Professor Hale|@}']],
    ['problem', 'Problem', 'a lost book', ['a late book', 'a new card']],
    ['when', 'Come', 'on Friday', ['on Monday', 'tomorrow']],
  ], { say: 'Another call. Please write down the message.' }),
  msg('ac1_silent', 1, 'c_cook', 'memo', { say: 'Can I talk on the phone on the second floor?' }, ['Please be quiet', 'The second floor is a quiet floor.', 'You can talk on the first floor.'], 'No, please be quiet on the second floor.', ['Yes, you can talk on the second floor.', 'No, please be quiet on the first floor.']),
  slot('ac1_room3', 1, 'c_student', 'speech', ['I want to study for my test.', 'I need a room at 11:00, but not on Friday.'], DAYS, TIMES, ['t11'], ['fri'], 'tue-t11', READERS, {}),
  ask('ac1_ask1', 1, 'c_girl', 'Thank you for your help.', 'You are welcome. Enjoy your book.', ['It is on the first floor.', 'Please write your name here.']),
  check('ac1_ok2', 1, 'c_sailor', 'Here is the card and the book. Please check them.', [P('card', 'Card', ['Title|The History of Our Town', 'Author|{Clara Boyd|@}', 'Year|1975']), P('label', 'Title page', ['Title|The History of Our Town', 'Author|{Clara Boyd|@}', 'Year|1975'])], null),
  msg('ac1_copy', 1, 'c_boy', 'memo', { say: 'How much is it to copy ten pages?' }, ['Copies', 'One page costs 5 cents.'], 'It is 50 cents.', ['It is 5 cents.', 'It is 5 dollars.']),
  sort('ac1_shelf4', 1, 'The last books of the morning. Please read each title.', ['maths', 'tech', 'arts', 'literature'], [['A book of pictures', 'arts'], ['A book of poems', 'literature'], ['A book about computers', 'tech'], ['A book about numbers', 'maths']]),
];

// ---------------------------------------------------------------------------- rank 2 (英検準2級 · TOEIC 〜600)
// Subjects and their shelves, the first short abstracts, due dates and renewals, reservations, lectures on a day and a time.

const R2: AuthoredTask[] = [
  sort('ac2_shelf1', 2, 'Please read the title of each book.', ['science', 'history', 'literature', 'arts'], [['How a Volcano Grows', 'science'], ['Stories of the Old Kings', 'history'], ['Poems for a Rainy Day', 'literature'], ['Songs for the Harbour', 'arts']]),
  check('ac2_card1', 2, 'c_student', 'I need this book for my essay. Please check the publisher on the card.', [P('card', 'Card', ['Title|How a Volcano Grows', 'Author|{Edith Lowe|@}', 'Publisher|{Seabright|@} Press']), P('label', 'Title page', ['Title|How a Volcano Grows', 'Author|{Edith Lowe|@}', 'Publisher|{Sunbright|@} Press'])], 'Publisher'),
  msg('ac2_abs1', 2, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ['Abstract', 'A volcano grows when hot rock comes up from the earth.', 'Some volcanoes are dangerous.'], 'The book says that some volcanoes are dangerous.', ['The book says that all volcanoes are safe.', 'The book says that a volcano grows from cold rock.']),
  check('ac2_due1', 2, 'c_girl', 'I borrowed this book on March 3. Is the day to bring it back right?', [P('card', 'Loan slip', ['Name|{Lily|@}', 'Borrowed|March 3', 'Due|March 31']), N('Loans', ['You can keep a book for three weeks.'])], 'Due'),
  slot('ac2_room1', 2, 'c_student', 'speech', ['I need a study room to work on my essay with a friend.', 'We can come on Wednesday or Thursday, but not in the morning.'], DAYS.slice(1, 5), TIMES, ['afternoon'], ['tue'], 'wed-t2', READERS, {}),
  msg('ac2_renew', 2, 'c_scholar', 'memo', { say: 'My book is due on Friday, but I have not finished it. May I keep it longer?' }, ['Renewals', 'You can renew a book twice, for three more weeks each time.', 'You cannot renew a book that another reader has reserved.'], 'Yes, if nobody has reserved it, you can renew it for three more weeks.', ['Yes, you can renew it twice, even if another reader has reserved it.', 'No, a book can never be renewed.']),
  sort('ac2_shelf2', 2, 'Four more books. Please read each title.', ['science', 'history', 'maths', 'tech'], [['The Stars and the Moon', 'science'], ['The War at Sea', 'history'], ['Numbers and How to Use Them', 'maths'], ['How Computers Think', 'tech']]),
  check('ac2_pages', 2, 'c_cook', 'The card says that this book has 220 pages. Is that right?', [P('card', 'Card', ['Title|Cooking with Herbs', 'Author|{Nina Frost|@}', 'Pages|220']), P('label', 'Title page', ['Title|Cooking with Herbs', 'Author|{Nina Frost|@}', 'Pages|202'])], 'Pages'),
  msg('ac2_reserve', 2, 'c_student', 'memo', { say: 'Another reader has my book. May I reserve it?' }, ['Reservations', 'You can reserve a book that is out.', 'We will tell you when it is back.', 'A reserved book is kept for you for three days.'], 'Yes, we will tell you when it is back, and we will keep it for three days.', ['Yes, we will keep it for you for three weeks.', 'No, you cannot reserve a book that is out.']),
  pad('ac2_pad1', 2, 'p_thorne', ['Hello, this is {Professor Hale|@}.', 'I need the old maps of the harbour for my study.', 'Please keep them for me until Friday.'], [
    ['who', 'Caller', '{Professor Hale|@}', ['{Mr. Grant|@}', '{Captain Reed|@}']],
    ['what', 'He needs', 'the old maps of the harbour', ['the old pictures of the harbour', 'the new maps of the town']],
    ['keep', 'Keep them until', 'Friday', ['Monday', 'Wednesday']],
  ], { say: 'The telephone is ringing. Please write the message for me.' }),
  msg('ac2_abs2', 2, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ['Abstract', 'A great flood came to the harbour town. This book tells how the people built a wall.'], 'The book tells how the people built a wall after the flood.', ['The book tells how the people left the town after the flood.', 'The book says that nobody built a wall.']),
  check('ac2_year', 2, 'c_oldman', 'The year on this card is the year of the book, I think. Please check it.', [P('card', 'Card', ['Title|The Great Flood', 'Author|{Victor Shaw|@}', 'Year|1950']), P('label', 'Title page', ['Title|The Great Flood', 'Author|{Victor Shaw|@}', 'Year|1905'])], 'Year'),
  msg('ac2_rule1', 2, 'c_mom', 'memo', { say: 'My son is eight. Can he come alone?' }, ['Children', 'Children under 10 must come with an adult.', 'Older children may come alone.'], 'No, he must come with an adult.', ['Yes, he can come alone.', 'No, he must come with a teacher.']),
  slot('ac2_lect1', 2, 'c_scholar', 'speech', ['I would like to hear the lecture about the history of the harbour.', 'I can come in the afternoon, but not on Thursday.'], DAYS.slice(0, 4), TIMES, ['afternoon'], ['thu'], 'tue-t4', READERS, {}),
  sort('ac2_shelf3', 2, 'The last cart of the day. Please read each title.', ['arts', 'literature', 'history', 'science', 'tech'], [['Paintings of the Sea', 'arts'], ['A Novel of the North', 'literature'], ['The Old Roads of the Town', 'history'], ['How Plants Grow', 'science'], ['The Story of the Telephone', 'tech']]),
  check('ac2_ok1', 2, 'c_baker', 'Here are my book and the card. Is the information right?', [P('card', 'Card', ['Title|How Plants Grow', 'Author|{Helen Marsh|@}', 'Year|1999', 'Pages|180']), P('label', 'Title page', ['Title|How Plants Grow', 'Author|{Helen Marsh|@}', 'Year|1999', 'Pages|180'])], null),
  msg('ac2_phone1', 2, 'p_thorne', 'phone', { say: '{Ken|@} is on the telephone. Please listen and choose the answer.' }, ['Hello, this is {Ken|@}.', 'My book is due on Friday, but I am ill.', 'Can I bring it back on Monday?'], 'Yes. You can bring it back on Monday, and I will tell {Ms. Thorne|@}.', ['Yes. You can bring it back on Friday, and I will tell {Ms. Thorne|@}.', 'No. A book must be brought back on Friday.']),
  slot('ac2_room2', 2, 'c_student', 'speech', ['I need a room with a computer for a study group.', 'We can come on Tuesday or Friday morning.'], DAYS, TIMES, ['morning'], ['mon', 'wed', 'thu'], 'fri-t9', READERS, {}),
  msg('ac2_rule2', 2, 'c_girl', 'memo', { say: 'I want to take the big dictionary home. Is that possible?' }, ['Reference books', 'Reference books, such as dictionaries, may not leave the reading room.', 'You can copy a few pages.'], 'No, a dictionary may not leave the reading room, but you can copy a few pages.', ['Yes, you can take a dictionary home for three weeks.', 'No, and you cannot copy any pages.']),
  check('ac2_fine', 2, 'c_boy', 'My book was five days late. Please check my fine.', [P('invoice', 'Fine slip', ['Name|{Tom|@}', 'Days late|5', 'Fine|$1.50']), N('Loans', ['A late book costs 20 cents a day.'])], 'Fine'),
  msg('ac2_mail1', 2, 'p_thorne', 'email', { from: '{Professor Hale|@}', subject: 'Old maps', say: 'An email came from the professor. Please read it and answer it.' }, ['Dear {Ms. Thorne|@},', 'I would like to see the old maps of the harbour on Wednesday afternoon.', 'Please tell me whether they are in the archive.'], 'Yes, the maps are in the archive, and you may see them on Wednesday afternoon.', ['Yes, the maps are in the archive, and you may see them on Wednesday morning.', 'Yes, the maps are in the archive, and you may see them on Friday morning.']),
];

// ---------------------------------------------------------------------------- rank 3 (英検2級 · TOEIC 〜730)
// Abstracts and the summaries that say the same thing; summaries that misstate their passage; the library's rules for loans,
// copies, journals and theses; catalog cards and references against the title page; study rooms and lectures.

/** The lines of a memo: its title, then its rules. */
const L = (d: CheckDoc): string[] => [d.title ?? '', ...(d.lines ?? [])];
const ABS = (...lines: string[]): string[] => ['Abstract', ...lines];

const ILL = N('Books from other libraries', ['A book from another library takes about ten days to arrive.', 'The service costs $4 for each book.', 'Readers are told by email when the book has arrived.']);
const COPY = N('Copying', ['Readers may copy up to 10 percent of a book for study.', 'Copying a whole book is not allowed.', 'Copies cost 5 cents a page.']);
const JOURNALS = N('Journals', ['The latest issue of each journal stays in the reading room.', 'Older volumes may be borrowed for one week.']);
const THESES = N('Theses', ['A thesis may be read only in the reading room.', 'Readers may not take a thesis home, and they may not photograph it.']);
const ROOMRULE = N('Study rooms', ['A room may be booked for up to two hours.', 'Bookings may be made up to a week in advance.', 'A group of four or more may use the lecture hall.']);
const LOST = N('Lost books', ['A reader who loses a book must pay the price of the book and $5 for the work of the library.']);

const R3: AuthoredTask[] = [
  msg('ac3_abs1', 3, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('The north became colder. The harvests were poor.'), 'The north became colder, and the harvests were poor.', ['The north became hotter, and the harvests were poor.', 'The north became colder, and the harvests were good.']),
  check('ac3_sum1', 3, 'p_thorne', 'This was written by a student. Please find the line that is wrong.', [P('note', 'Summary', ['First point|The experiment was in 1962.', 'Second point|Twenty plants were grown in the dark.', 'Third point|All of the plants died in a week.']), N('Passage', ['In 1962 an experiment was done with twenty plants.', 'The plants were grown in the dark, and most of them lived for a month.'])], 'Third point', { fix: ['Most of the plants lived for a month.', 'Half of the plants lived for a month.'] }),
  sort('ac3_shelf1', 3, 'The new books are on the cart. Please read each title and put it on the right shelf.', ['science', 'history', 'literature', 'arts'], [['A study of the climate of the north', 'science'], ['The history of an old empire', 'history'], ['A novel about a poet', 'literature'], ['The paintings of the old harbour town', 'arts']]),
  msg('ac3_ill1', 3, 'c_scholar', 'memo', { say: 'I need a book that this library does not have. How long will it take, and what will it cost?' }, L(ILL), 'It will take about ten days and cost $4.', ['It will take about ten days and cost $14.', 'It will take about two days and cost $4.']),
  check('ac3_card1', 3, 'c_student', 'I need this book for my thesis. Could you check the edition on the card?', [P('card', 'Card', ['Title|A History of the Harbour Town', 'Author|{Victor Shaw|@}', 'Edition|Second', 'Year|1998']), P('label', 'Title page', ['Title|A History of the Harbour Town', 'Author|{Victor Shaw|@}', 'Edition|Third', 'Year|1998'])], 'Edition', { fix: ['Third', 'First'] }),
  msg('ac3_copy1', 3, 'c_student', 'memo', { say: 'This book has 300 pages. May I copy 50 pages for my essay?' }, L(COPY), 'No. You may copy only 10 percent of a book, which is 30 pages.', ['Yes. You may copy up to 10 percent of a book for study.', 'No. You may copy only 10 percent, which is 3 pages.']),
  slot('ac3_room1', 3, 'c_student', 'speech', ['I would like to book a study room for my essay group.', 'We can come on Tuesday or Wednesday, but we cannot come in the morning.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'thu'], 'tue-t1', READERS, {}),
  msg('ac3_journal1', 3, 'c_scholar', 'memo', { say: 'I want to take the latest issue of the journal home. Is that possible?' }, L(JOURNALS), 'No. The latest issue must stay in the reading room.', ['Yes. You may take it home for one week.', 'No. You may take it home only on Fridays.']),
  check('ac3_cite1', 3, 'c_student', 'This is my reference for the article. Is the volume the same as on the journal?', [P('note', 'Reference', ['Author|{Edith Lowe|@}', 'Journal|Harbour Science', 'Volume|14', 'Pages|22 to 41']), P('label', 'Title page', ['Author|{Edith Lowe|@}', 'Journal|Harbour Science', 'Volume|41', 'Pages|22 to 41'])], 'Volume', { fix: ['41', '40'] }),
  pad('ac3_pad1', 3, 'p_thorne', ['Good morning. This is {Professor Hale|@}.', 'The article that I ordered from the library in the capital has arrived.', 'I shall collect it on Thursday.'], [
    ['who', 'Caller', '{Professor Hale|@}', ['{Mr. Osei|@}', '{Mr. Grant|@}']],
    ['what', 'What', 'the article that he ordered', ['the book that he returned', 'the thesis that he wrote']],
    ['day', 'Collect', 'on Thursday', ['on Tuesday', 'on Friday']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Listen carefully, please, and write the message.' }),
  msg('ac3_abs2', 3, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('Students who studied in silence scored higher on a test than students who studied with music.'), 'The students who studied in silence scored higher.', ['The students who studied with music scored higher.', 'The students who studied in silence scored lower.']),
  check('ac3_sum2', 3, 'p_thorne', 'A student wrote this. Please find the line that is wrong.', [P('note', 'Summary', ['First point|The empire grew rich by trade.', 'Second point|Its capital was on the coast.', 'Third point|The empire ended in a war.']), N('Passage', ['The empire grew rich by trade, and its capital was on the coast.', 'A long drought came in 1200, and the empire ended ten years later.'])], 'Third point', { fix: ['The empire ended after a drought.', 'The empire ended after a flood.'] }),
  msg('ac3_room2', 3, 'c_mom', 'memo', { say: 'Six of us want to meet to study. Which room should we book?' }, L(ROOMRULE), 'You should book the lecture hall, because a group of four or more may use it.', ['You should book Study room 1, because it is for six readers.', 'You should book the lecture hall, because a group of four or more may not use it.']),
  sort('ac3_shelf2', 3, 'More books. Please read each title.', ['maths', 'tech', 'science', 'history'], [['A book of sums for children', 'maths'], ['How the steam engine works', 'tech'], ['The moon and the planets', 'science'], ['The first years of the harbour town', 'history']]),
  msg('ac3_loan2', 3, 'c_girl', 'memo', { say: 'I lost a book that cost $12. How much must I pay?' }, L(LOST), 'You must pay $17, which is the price of the book and $5 for the work of the library.', ['You must pay $12, which is only the price of the book.', 'You must pay $5, because that is the fee for a lost book.']),
  check('ac3_card2', 3, 'c_scholar', 'This card must have the same publisher as the title page. Please check it.', [P('card', 'Card', ['Title|The Poet and the Sea', 'Author|{Nina Frost|@}', 'Publisher|{Greenhill|@} Books', 'Year|2004']), P('label', 'Title page', ['Title|The Poet and the Sea', 'Author|{Nina Frost|@}', 'Publisher|{Bluehill|@} Books', 'Year|2004'])], 'Publisher', { fix: ['{Bluehill|@} Books', '{Greenhill|@} Press'] }),
  msg('ac3_thesis1', 3, 'c_student', 'memo', { say: 'I want to read a thesis at home this weekend. May I borrow it?' }, L(THESES), 'No. A thesis may be read only in the reading room.', ['Yes. You may take it home for a weekend.', 'No. You may borrow it, but you may not photograph it.']),
  slot('ac3_lect1', 3, 'c_scholar', 'speech', ['I would like to attend the lecture on ancient history.', 'I can come on Tuesday or Thursday, but not in the morning.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'wed'], 'thu-t3', READERS, {}),
  msg('ac3_abs3', 3, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('A young teacher goes to a village by the sea. The people do not like her at first. Then she saves a boat in a storm.'), 'The people like her after she saves a boat.', ['The people like her at first, but not after she saves a boat.', 'The people like her less after she saves a boat.']),
  check('ac3_sum3', 3, 'p_thorne', 'Please find the line that is wrong.', [P('note', 'Summary', ['First point|Someone wrote a symphony in 1890.', 'Second point|It was first heard in the capital.', 'Third point|The people did not like it.']), N('Passage', ['Someone wrote a symphony in 1890, and it was first heard in the capital.', 'The people loved it.'])], 'Third point', { fix: ['The people loved it.', 'The people left early.'] }),
  msg('ac3_mail1', 3, 'p_thorne', 'email', { from: '{Ken|@}', subject: 'My essay', say: 'A student has written to the library. Please read the email and answer it.' }, ['Dear {Ms. Thorne|@},', 'My essay is due on Friday, and I need the book on the history of the harbour town.', 'It is out, and I would like to reserve it.'], 'We will reserve the book for you and write to you when it is back.', ['We will reserve the book for you, and you may take it home today.', 'We cannot reserve it, because a book that is out may not be reserved.']),
  sort('ac3_shelf3', 3, 'The afternoon cart. Please read each line.', ['literature', 'arts', 'tech', 'history'], [['Letters of a poet to her friends', 'literature'], ['A book about the theater', 'arts'], ['A book about the telephone', 'tech'], ['A book about the great flood', 'history']]),
  check('ac3_ok1', 3, 'c_baker', 'Here is the book and the card. Is the volume on the card right?', [P('card', 'Card', ['Title|The Plants of the Coast', 'Author|{Helen Marsh|@}', 'Volume|3', 'Year|1999']), P('label', 'Title page', ['Title|The Plants of the Coast', 'Author|{Helen Marsh|@}', 'Volume|3', 'Year|1999'])], null),
  msg('ac3_phone1', 3, 'p_thorne', 'phone', { say: 'The professor is on the telephone. Please listen carefully.' }, ['Hello, this is {Professor Hale|@}.', 'I have an appointment to see the old maps on Wednesday at 2:00, but I shall be late.', 'May I come at 3:00?'], 'Yes. I will tell {Ms. Thorne|@} that you will come at 3:00.', ['Yes. I will tell {Ms. Thorne|@} that you will come at 2:00.', 'Yes. I will tell {Ms. Thorne|@} that you will come on Thursday.'], { features: ['audioOnly'] }),
  slot('ac3_room3', 3, 'c_student', 'speech', ['I want a study room with computers for my group.', 'We can come on Monday or Wednesday in the morning.'], ROOMS, ROOMCOLS, ['computers', 'morning'], ['tue'], 's2-mon10', READERS, { layout: 'rooms' }),
  msg('ac3_rule1', 3, 'c_mom', 'memo', { say: 'My son is a student. Can he borrow books free?' }, ['Borrowing', 'Students of the academy borrow books free.', 'Visitors must pay a deposit of $20.'], 'Yes. Students of the academy borrow books free.', ['No. He must pay a deposit of $20.', 'Yes, but only if he is a visitor.']),
  check('ac3_cite2', 3, 'c_student', 'Please check the pages in my reference against the first page of the article.', [P('note', 'Reference', ['Author|{Victor Shaw|@}', 'Title|The Harbour in 1850', 'Pages|12 to 29']), P('label', 'Title page', ['Author|{Victor Shaw|@}', 'Title|The Harbour in 1850', 'Pages|12 to 19'])], 'Pages', { fix: ['12 to 19', '12 to 21'] }),
  msg('ac3_abs4', 3, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('The author tested a new battery for two years.', 'It lasted longer than the old one, but it cost twice as much.'), 'The new battery lasted longer, but it cost twice as much.', ['The new battery lasted longer, and it cost half as much.', 'The new battery lasted a shorter time, but it cost twice as much.']),
  msg('ac3_ill2', 3, 'p_thorne', 'letter', { from: '{Professor Hale|@}', say: 'A letter has come from the professor. Please read it and answer it.' }, ['Dear {Ms. Thorne|@},', 'I need two books that are not in your catalog, and I should like to borrow them from the library in the capital.', 'I shall pay the fee, and I can wait for two weeks.'], 'We shall order the two books from the library in the capital, and we shall write to you when they arrive.', ['We cannot order books from other libraries, because the fee is too high.', 'We shall order the two books, and they will arrive in two days.']),
  check('ac3_sum4', 3, 'p_thorne', 'Please find the line that is wrong.', [P('note', 'Summary', ['First point|The painter lived in a small village.', 'Second point|She studied in the capital for ten years.', 'Third point|Her first show was in 1910.']), N('Passage', ['The painter lived in a small village in the north.', 'She studied in the capital for six years, and her first show was in 1910.'])], 'Second point', { fix: ['She studied in the capital for six years.', 'She studied in the capital for sixteen years.'] }),
  msg('ac3_rule2', 3, 'c_student', 'memo', { say: 'My friends and I booked a room for three hours. Is that allowed?' }, L(ROOMRULE), 'No. A room may be booked for up to two hours.', ['Yes. A room may be booked for up to three hours.', 'No. A room may be booked for up to a week.']),
  ask('ac3_ask1', 3, 'c_scholar', 'I should like to thank you for finding the maps.', 'You are welcome. Please come again.', ['A thesis may be read only in the reading room.', 'The service costs four dollars for each book.']),
  msg('ac3_lect2', 3, 'p_thorne', 'memo', { say: 'A reader asks when the poetry lecture is held and who gives it.' }, ['Lectures this month', 'Tuesday, 6:00: Ancient history, {Professor Hale|@}', 'Thursday, 6:00: Modern poetry, {Mr. Osei|@}'], 'It is held on Thursday at 6:00, and {Mr. Osei|@} gives it.', ['It is held on Tuesday at 6:00, and {Professor Hale|@} gives it.', 'It is held on Thursday at 6:00, and {Professor Hale|@} gives it.']),
  sort('ac3_shelf4', 3, 'A last cart for today. Please read each line.', ['science', 'maths', 'literature', 'arts'], [['A study of birds on the ocean', 'science'], ['A book of geometry', 'maths'], ['Essays on the novel', 'literature'], ['The music of the harbour', 'arts']]),
  check('ac3_ok2', 3, 'c_scholar', 'I copied the title from this book. Please check my reference.', [P('note', 'Reference', ['Author|{Edith Lowe|@}', 'Title|The Birds of the Ocean', 'Year|1987']), P('label', 'Title page', ['Author|{Edith Lowe|@}', 'Title|The Birds of the Ocean', 'Year|1987'])], null),
  msg('ac3_mail2', 3, 'p_thorne', 'email', { from: '{Ms. Reyes|@}', subject: 'The reading room', say: 'An assistant has sent a note about the reading room. Please read it and answer it.' }, ['Dear {Ms. Thorne|@},', 'Three readers have asked me whether they can eat in the reading room.', 'What shall I tell them?'], 'Please tell them that food is not allowed in the reading room, but they may eat in the hall.', ['Please tell them that they may eat in the reading room, but not in the hall.', 'Please tell them that food is not allowed in the library at all.']),
  slot('ac3_room4', 3, 'c_mom', 'speech', ['Our reading group would like to use a small quiet room.', 'We can meet in the afternoon, but not on Tuesday.'], ROOMS, ROOMCOLS, ['small', 'quiet', 'afternoon'], ['tue'], 's1-wed2', READERS, { layout: 'rooms' }),
  msg('ac3_fine2', 3, 'c_boy', 'memo', { say: 'I brought a book back eight days late. How much do I owe?' }, ['Loans', 'You can keep a book for three weeks.', 'A late book costs 20 cents a day.', 'The fine for one book is never more than $5.'], 'You owe $1.60, which is 20 cents for each of the eight days.', ['You owe $5, which is the most that anybody pays.', 'You owe $16, which is $2 for each of the eight days.']),
  msg('ac3_final', 3, 'p_thorne', 'email', { from: '{Ken|@}', subject: 'Thank you', say: 'A student has written to the library. Please read the email and answer it.' }, ['Dear {Ms. Thorne|@},', 'Thank you for finding the book for my essay.', 'I did well.'], 'You are welcome. We are glad that the book helped you.', ['Thank you for your question. The book is due on Friday.', 'Thank you for your message. The book costs four dollars.']),
];

// ---------------------------------------------------------------------------- rank 4 (英検準1級 · TOEIC 〜860)
// Longer abstracts and the summaries that distort them (cause and effect, "some" and "all"); special collections, digital
// access, copying, embargoed theses, fellowships; citations and catalog records; seminars booked by room and time.

const SPECIAL = N('Special collections', ['Rare books may be read only in the rare books room, by appointment made 48 hours before.', 'Readers must wear gloves and use pencils.', 'No photographs may be taken without written permission.', 'Readers may have three items at a time.']);
const DIGITAL = N('Digital library', ['Members of the academy may read the journals from home.', 'Visitors may read them only on the computers in the library.', 'An article may be downloaded, but it may not be shared.']);
const EMBARGO = N('Embargoed theses', ['An author may ask for a thesis to be embargoed for up to two years.', 'An embargoed thesis may be read only with the written permission of its author.']);
const FELLOW = N('Fellowships', ['Researchers may apply for a fellowship by March 1.', 'An application needs two references and a plan of the research.']);
const BUY = N('Suggestions for purchase', ['A reader may suggest a book for the library.', 'The library buys it if two members of staff approve and the price is under $80.']);

const R4: AuthoredTask[] = [
  msg('ac4_abs1', 4, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('Children who grew up by the harbour were taller than other children.', 'She says that the fish in their food, not their wealth, caused the difference.'), 'The harbour children were taller because of fish, not wealth.', ['The harbour children were taller because of wealth, not fish.', 'All children who eat fish are taller.']),
  check('ac4_sum1', 4, 'p_thorne', 'A summary of this passage has been written for the catalog. Please find the line that is wrong.', [P('note', 'Summary', ['First point|The survey covered 40 villages.', 'Second point|Some of the villages had a library.', 'Third point|None of the libraries was open on Sundays.']), N('Passage', ['The survey covered 40 villages.', 'Only twelve of them had a library, and most libraries were open on Sundays.'])], 'Third point', { fix: ['Most libraries were open on Sundays.', 'Half of the libraries were open on Sundays.'] }),
  sort('ac4_shelf1', 4, 'The new books are here. Please read each title.', ['science', 'history', 'literature', 'arts', 'tech'], [['The Tides of the Shore', 'science'], ['The Records of the Harbour', 'history'], ['The Letters of a Poet', 'literature'], ['The Painters of the Coast', 'arts'], ['The Design of a Crane', 'tech']]),
  msg('ac4_special0', 4, 'c_scholar', 'memo', { say: 'May I use a pen in the rare books room?' }, ['Rare books room', 'Gloves and pencils only.'], 'No, you may use only a pencil.', ['Yes, you may use a pen and gloves.', 'No, you may not use a pencil.']),
  msg('ac4_special1', 4, 'c_scholar', 'memo', { say: 'I would like to read the harbour records tomorrow afternoon, and I plan to photograph some of the pages. Is that possible?' }, L(SPECIAL), 'No. You must make an appointment 48 hours in advance, and you may not take photographs without written permission.', ['Yes. You may read the records tomorrow and photograph the pages.', 'No. You must make an appointment 48 hours in advance, but you may take photographs.']),
  check('ac4_cite1', 4, 'c_student', 'I am citing this article in my essay. Please check my citation against the first page of the journal.', [P('note', 'Citation', ['Author|{Edith Lowe|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|3', 'Year|2008']), P('label', 'Title page', ['Author|{Edith Lowe|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|4', 'Year|2008'])], 'Issue', { fix: ['4', '2'] }),
  msg('ac4_digital1', 4, 'c_mom', 'memo', { say: 'I am a visitor, and I would like to read a journal article from my home. Is that possible?' }, L(DIGITAL), 'No. Visitors may read the journals only on the computers in the library.', ['Yes. Anybody may read the journals from home with a card number.', 'No. Visitors may not read the journals at all.']),
  slot('ac4_room1', 4, 'c_student', 'speech', ['We are nine students, and we need a seminar room for our group.', 'We can meet on Wednesday or Thursday, but not in the morning.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'tue'], 'wed-t3', READERS, {}),
  msg('ac4_plag1', 4, 'c_student', 'memo', { say: 'I copied one paragraph from a book into my essay, but I did not cite it. What will happen?' }, ['Plagiarism', 'A paragraph from a book must have a citation.', 'Without it, the essay fails.'], 'It is plagiarism, so your essay will fail.', ['It is not plagiarism, because it is only one paragraph.', 'It is plagiarism, but your essay will not fail.']),
  check('ac4_card1', 4, 'c_scholar', 'This record in the catalog should agree with the title page. Please check the year of the edition.', [P('card', 'Record', ['Title|The Tides of the Shore', 'Author|{Helen Marsh|@}', 'Edition|Revised', 'Year|2011']), P('label', 'Title page', ['Title|The Tides of the Shore', 'Author|{Helen Marsh|@}', 'Edition|Revised', 'Year|2001'])], 'Year', { fix: ['2001', '2010'] }),
  pad('ac4_pad1', 4, 'p_thorne', ['Good afternoon. This is {Mr. Osei|@} from the department of history.', 'The seminar on the harbour records will be held in Room 2 on Thursday at 11:00.', 'Please put the records of 1850 on the cart before ten.'], [
    ['who', 'Caller', '{Mr. Osei|@}', ['{Professor Hale|@}', '{Mr. Ashby|@}']],
    ['what', 'Seminar on', 'the harbour records', ['the harbour maps', 'the harbour tides']],
    ['when', 'When', 'Thursday at 11:00', ['Thursday at 1:30', 'Tuesday at 11:00']],
    ['cart', 'Put on the cart', 'the records of 1850', ['the records of 1580', 'the maps of 1850']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('ac4_closing1', 4, 'c_student', 'memo', { say: 'I want to read a thesis that was embargoed last year. Who can give me permission?' }, L(EMBARGO), 'Only the author of the thesis can give you permission, and it must be in writing.', ['The head librarian can give you permission by telephone.', 'Only the author of the thesis can give you permission, but it need not be in writing.']),
  check('ac4_sum2', 4, 'p_thorne', 'This summary says something that the abstract does not. Please mark it.', [P('note', 'Summary', ['First point|The author studied the diaries of fifty sailors.', 'Second point|They wrote mostly about the weather.', 'Third point|The author says that the sailors disliked their work.']), N('Abstract', ['The author studied the diaries of fifty sailors, who wrote mostly about the weather.', 'The author does not say that they disliked their work.'])], 'Third point', { fix: ['The author does not say that the sailors disliked their work.', 'The author says that the sailors enjoyed their work.'] }),
  msg('ac4_fellow1', 4, 'c_scholar', 'memo', { say: 'I should like to apply for a fellowship, and my references are not ready. Must I send them with my application?' }, L(FELLOW), 'Yes. An application needs two references and a plan of the research, and it must reach us by March 1.', ['No. You may send the references after March 1.', 'Yes. An application needs three references and a plan of the research.']),
  sort('ac4_shelf2', 4, 'Another cart. Please read each line.', ['science', 'history', 'literature', 'arts'], [['The fish of the northern coast', 'science'], ['The voyages of the first ships that left the harbour', 'history'], ['The novels of a poet', 'literature'], ['A book of old maps and drawings', 'arts']]),
  msg('ac4_buy1', 4, 'c_student', 'memo', { say: 'I should like the library to buy a book that costs $95. Can I suggest it?' }, L(BUY), 'You may suggest it, but the library buys a book only if the price is under $80.', ['You may not suggest it, because only staff may suggest books.', 'You may suggest it, and the library will buy it if one member of staff approves.']),
  slot('ac4_room2', 4, 'p_thorne', 'email', ['Dear {Ms. Thorne|@},', 'The department of history would like to hold a seminar for about twenty people.', 'We shall need the lecture hall, and we can meet in the afternoon, but not on Monday.', 'Yours sincerely, {Mr. Osei|@}'], ROOMS, ROOMCOLS, ['large', 'afternoon'], ['mon'], 'hall-tue2', READERS, { say: 'A request for a seminar has arrived. Please look at the plan and choose the room and the time.', layout: 'rooms' }),
  check('ac4_ok1', 4, 'c_scholar', 'Here is my citation, and here is the journal. Is everything right?', [P('note', 'Citation', ['Author|{Edith Lowe|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|4', 'Year|2008']), P('label', 'Title page', ['Author|{Edith Lowe|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|4', 'Year|2008'])], null),
  msg('ac4_abs2', 4, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('Readers who used the reading room every week had better marks than other readers.', 'But the study does not prove that the room caused the better marks.'), 'The weekly readers had better marks, but the study does not prove that the room caused it.', ['The weekly readers had better marks, and the study proves that the room caused it.', 'The other readers had better marks than the weekly readers.']),
  msg('ac4_mail1', 4, 'p_thorne', 'email', { from: '{Professor Hale|@}', subject: 'The harbour records', say: 'The professor has written to the library. Please read his email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'I plan to visit the archive on Friday to read the records of 1850, and I should like to photograph two pages for my book.', 'I have not yet made an appointment. Is it too late?'], 'You must make an appointment 48 hours in advance, so please come on Monday, and you must ask for written permission to photograph the pages.', ['You may come on Friday without an appointment, and you may photograph the pages.', 'You must make an appointment 48 hours in advance, but you may photograph the pages without permission.']),
  check('ac4_card2', 4, 'c_student', 'The call number on this card must be the same as on the book. Please check it.', [P('card', 'Card', ['Title|The Voyages of the Harbour Ships', 'Author|{Victor Shaw|@}', 'Call number|{HIS|@} 442']), P('label', 'Spine of the book', ['Title|The Voyages of the Harbour Ships', 'Author|{Victor Shaw|@}', 'Call number|{HIS|@} 424'])], 'Call number', { fix: ['{HIS|@} 424', '{HIS|@} 244'] }),
  msg('ac4_digital2', 4, 'c_girl', 'memo', { say: 'I downloaded an article and sent it to my friends. Did I break a rule?' }, L(DIGITAL), 'Yes. An article may be downloaded, but it may not be shared with other people.', ['No. An article may be shared with anybody.', 'Yes. An article may not be downloaded at all.']),
  pad('ac4_pad2', 4, 'p_thorne', ['Hello, this is {Ken|@}.', 'My essay has a bad mark, but I think there was a mistake in my citation.', 'May I come and see {Ms. Thorne|@} on Monday?'], [['who', 'Caller', '{Ken|@}', ['{Tom|@}', '{Professor Hale|@}']], ['problem', 'Problem', 'a bad mark', ['a lost book', 'a late fine']], ['see', 'He wants to see', '{Ms. Thorne|@}', ['{Mr. Ashby|@}', '{Mr. Osei|@}']], ['day', 'On', 'Monday', ['Friday', 'Tuesday']]], { features: ['audioOnly'], say: 'One more call. Please listen carefully and write the message.' }),
  check('ac4_sum3', 4, 'p_thorne', 'Please mark the line in this summary that goes too far.', [P('note', 'Summary', ['First point|The author asked twenty teachers about the library.', 'Second point|Most of them used the library every week.', 'Third point|The author proves that the library helps all lessons.']), N('Abstract', ['The author asked twenty teachers about the library.', 'Most of them used the library every week, and several said that it helped their lessons.'])], 'Third point', { fix: ['Several teachers said that the library helped their lessons.', 'All teachers said that the library helped their lessons.'] }),
  msg('ac4_special2', 4, 'c_scholar', 'memo', { say: 'I should like to read five old maps at the same time in the rare books room. May I?' }, L(SPECIAL), 'No. Readers may have only three items at a time.', ['Yes. Readers may have as many items as they wish.', 'No. Readers may have only five items in a week.']),
  sort('ac4_shelf3', 4, 'The last cart. Please read each line.', ['maths', 'tech', 'science', 'literature'], [['A proof of an old problem in numbers', 'maths'], ['The history of the telegraph', 'tech'], ['How the climate may change the birds of the north', 'science'], ['The poems of the sailors at work', 'literature']]),
  slot('ac4_lect1', 4, 'c_scholar', 'speech', ['I wish to attend the lecture on the history of the harbour.', 'I can come on Tuesday or Wednesday, but I have a class in the morning.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'thu'], 'tue-t3', READERS, { extraBusy: [] }),
  msg('ac4_closing2', 4, 'p_thorne', 'email', { from: '{Ken|@}', subject: 'My thesis', say: 'A student has written about his thesis. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'My thesis will be finished soon, and I want to put it in a journal.', 'Can the library keep it from other readers?'], 'Yes. You may ask for your thesis to be embargoed for up to two years.', ['Yes. You may ask for your thesis to be embargoed for up to ten years.', 'No. A thesis must be open to all readers at once.']),
  check('ac4_ok2', 4, 'c_oldman', 'This is the loan slip for my books. Please check that the dates agree with the rule.', [P('card', 'Loan slip', ['Name|{Grandpa Sam|@}', 'Borrowed|May 3', 'Due|May 24']), N('Loans', ['You can keep a book for three weeks.'])], null),
  msg('ac4_fellow2', 4, 'p_thorne', 'letter', { from: '{Professor Hale|@}', say: 'A letter has come from the professor. Please read it and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'I am applying for a fellowship to study the harbour records, and I would be grateful if you would write one of my two references.', 'The application must be sent by March 1.'], 'I shall be glad to write a reference, and I shall send it to the fellowship office before March 1.', ['I cannot write a reference, because references may be written only by professors.', 'I shall be glad to write a reference, and I shall send it after March 1.']),
  msg('ac4_final', 4, 'p_thorne', 'email', { from: '{Mr. Osei|@}', subject: 'The seminar', say: 'The seminar was held yesterday, and a colleague has written. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'Thank you for the room and for the records, which the students found very useful.', 'Without your help, the seminar would not have been a success.'], 'Thank you for your kind message. We are glad that the seminar was a success.', ['Thank you for your question. Rare books may be read only in the rare books room.', 'Thank you for your message. The room must be booked three days in advance.']),
];

// ---------------------------------------------------------------------------- rank 5 (英検1級 · TOEIC 〜990)
// Dense abstracts with hedges and concessions, and the summaries that overstate them; copyright and permissions, the flooded
// archive, the lending agreement, peer review, the conference on the harbour town; embargoes that may be extended once.

const NETWORK = N('The Harbour Network', ['Member libraries lend books to each other for four weeks.', 'Rare books and theses are excluded from the agreement.', 'The library that borrows pays the cost of the post.']);
const SYMP = N('Conference on the harbour town', ['The conference will be held on May 12 and 13.', 'Each paper lasts 20 minutes, followed by 10 minutes for questions.', 'Registration closes on April 15. The fee is $40, or half for students.']);

const R5: AuthoredTask[] = [
  msg('ac5_abs1', 5, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('Many people think that the harbour town declined after the railway came in 1880.', 'The author says that this is not true: trade moved from the sea to the land, and the town grew richer.'), 'The town did not decline after the railway came, and it grew richer.', ['The town declined after the railway came, and it grew poorer.', 'The town did not decline, but it grew poorer after the railway came.']),
  check('ac5_sum1', 5, 'p_thorne', 'Please mark the line in this summary that goes too far.', [P('note', 'Summary', ['First point|The author read 120 letters from sailors.', 'Second point|Most of the letters speak of the price of food.', 'Third point|The letters prove that the sailors went on strike.']), N('Abstract', ['The author read 120 letters from sailors.', 'Most of them speak of the price of food, and a few speak of a strike, but this is not certain.'])], 'Third point', { fix: ['A few letters speak of a strike, but this is not certain.', 'None of the letters speak of a strike.'] }),
  sort('ac5_shelf1', 5, 'A box of papers has arrived for the conference. Please read each line.', ['science', 'history', 'literature', 'arts', 'tech'], [['A model of the tides', 'science'], ['Tax records and the rise of the town', 'history'], ['Songs and the dialect of the sailors', 'literature'], ['Light and color in the paintings of the harbour school', 'arts'], ['The design of a strong sea wall', 'tech']]),
  msg('ac5_copy1', 5, 'c_scholar', 'memo', { say: 'The author of this book died in 1948. May I copy a map from it?' }, ['Copyright', 'Copyright ends 70 years after the death of the author.', 'A work whose author died before 1950 is free to copy.'], 'Yes. The author died before 1950, so the work is free to copy.', ['No. You need the permission of the owner of the copyright.', 'No. Copyright ends only 20 years after the death of the author.']),
  check('ac5_cite1', 5, 'c_student', 'I have cited this paper in my thesis. Could you check that my citation agrees with the program of the conference?', [P('note', 'Citation', ['Author|{Helen Marsh|@}', 'Title|Tides and Sand', 'Presented on|May 12', 'Length|30 minutes']), P('note', 'Program', ['Author|{Helen Marsh|@}', 'Title|Tides and Sand', 'Presented on|May 13', 'Length|30 minutes']), SYMP], 'Presented on', { fix: ['May 13', 'May 11'] }),
  msg('ac5_flood1', 5, 'c_scholar', 'memo', { say: 'May I see the records of 1850 that the water damaged?' }, ['The flooded records', 'Readers must not touch the records that the water damaged.', 'Only the staff of the repair room may touch them.', 'Readers may see photographs of them.'], 'No, you may see only photographs of them.', ['Yes, you may touch them if you wear gloves.', 'No, you may not see them in any form.']),
  slot('ac5_room1', 5, 'p_thorne', 'email', ['Dear {Ms. Thorne|@},', 'The department of history will hold a conference on the harbour town, and about 60 people are expected.', 'We shall need the lecture hall for a full afternoon, but not on Monday, because the hall is used for the examinations.', 'Yours sincerely, {Mr. Osei|@}'], ROOMS, ROOMCOLS, ['large', 'afternoon'], ['mon'], 'hall-wed2', READERS, { say: 'A request for the conference has arrived. Please look at the plan and choose the room and the time.', layout: 'rooms' }),
  msg('ac5_network1', 5, 'c_scholar', 'memo', { say: 'I should like to borrow a thesis from the library of the capital, which is a member of the Harbour Network. May I?' }, L(NETWORK), 'No. Theses are excluded from the agreement.', ['Yes. Member libraries lend theses for four weeks.', 'No. Only the library that borrows may read theses.']),
  check('ac5_card1', 5, 'c_student', 'This record of the catalog should agree with the title page. Please check the number of volumes.', [P('card', 'Record', ['Title|A History of the Harbour Fleet', 'Author|{Victor Shaw|@}', 'Volumes|3', 'Year|2015']), P('label', 'Title page', ['Title|A History of the Harbour Fleet', 'Author|{Victor Shaw|@}', 'Volumes|2', 'Year|2015'])], 'Volumes', { fix: ['2', '4'] }),
  msg('ac5_review1', 5, 'c_scholar', 'memo', { say: 'Two of the three reviewers of my article recommend it. Will it be accepted?' }, ['Articles', 'An article is accepted if two of the three reviewers recommend it.'], 'Yes. Two of the three reviewers recommend it, so it is accepted.', ['No. All three reviewers must recommend it.', 'Yes. But the article must wait for eight weeks.']),
  pad('ac5_pad1', 5, 'p_thorne', ['Good morning. This is {Mr. Osei|@}.', 'The program of the conference has been changed: the paper on tides will now be presented on May 13 at 11:00.', 'Please correct the program before it is printed on Friday.'], [
    ['who', 'Caller', '{Mr. Osei|@}', ['{Professor Hale|@}', '{Mr. Ashby|@}']],
    ['paper', 'Paper on', 'tides', ['trade', 'songs']],
    ['when', 'Now on', 'May 13 at 11:00', ['May 12 at 11:00', 'May 13 at 1:00']],
    ['print', 'Print on', 'Friday', ['Monday', 'Thursday']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('ac5_abs2', 5, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('Some say that the fish became few because there were too many boats.', 'The author finds that the fish became few before the fleet grew, and he thinks that the temperature of the sea may be the cause.'), 'The author thinks that the temperature of the sea, not the number of boats, may be the cause.', ['The author proves that the number of boats was the cause.', 'The author thinks that the temperature of the sea was the only cause.']),
  check('ac5_sum2', 5, 'p_thorne', 'This is meant to be true to the abstract. Please mark the line that is not.', [P('note', 'Summary', ['First point|The author compares the poems of two sailors.', 'Second point|Both wrote mostly about the sea.', 'Third point|He says that the second sailor copied the first.']), N('Abstract', ['The author compares the poems of two sailors, one old and one young.', 'Both wrote mostly about the sea, but he does not say that the young sailor copied the old one.'])], 'Third point', { fix: ['He does not say that the second sailor copied the first.', 'He says that the first sailor copied the second.'] }),
  msg('ac5_extend1', 5, 'c_student', 'memo', { say: 'My thesis is under embargo for two years. I want the embargo to be longer because of an illness. May I?' }, ['Embargoed theses', 'A thesis may be embargoed for up to two years.', 'It may be embargoed for longer once, but only if a publisher asks in writing.'], 'No. It may be embargoed for longer only if a publisher asks in writing.', ['Yes. It may be embargoed for longer for any reason.', 'No. It may never be embargoed for longer.']),
  sort('ac5_shelf2', 5, 'More papers for the conference. Please read each line with care.', ['maths', 'science', 'history', 'literature'], [['A proof of an old problem in numbers', 'maths'], ['The sound of the harbour in a storm', 'science'], ['The politics of a small port', 'history'], ['A poet and her influence on the novels of the north', 'literature']]),
  msg('ac5_gift1', 5, 'p_thorne', 'letter', { from: '{Mrs. Hill|@}', say: 'A letter has come from a reader who wishes to give books to the library. Please read it and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'My late husband left over three hundred books, many of them about the sea.', 'Some are in poor condition. Would you take them?'], 'We should be glad to see the books, but we can take only those in good condition.', ['We shall take every book, even those in poor condition.', 'We cannot take any books, because the library has no room.']),
  slot('ac5_lect1', 5, 'c_scholar', 'speech', ['I wish to attend the session on the tax records of the harbour town.', 'I can come on Wednesday or Thursday, but I must leave before three.'], DAYS.slice(0, 4), TIMES2, ['afternoon'], ['mon', 'tue', 't3'], 'wed-t1', READERS, {}),
  check('ac5_cite2', 5, 'c_student', 'Please check that the year of publication in my citation is the same as on the title page.', [P('note', 'Citation', ['Author|{Edith Lowe|@}', 'Title|Light and Color', 'Published|1992']), P('label', 'Title page', ['Author|{Edith Lowe|@}', 'Title|Light and Color', 'Published|1929'])], 'Published', { fix: ['1929', '1939'] }),
  msg('ac5_flood2', 5, 'p_thorne', 'email', { from: '{Mr. Ashby|@}', subject: 'The archive', say: 'A colleague has written. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'A reader asks to see the damaged records for a short time, because he has come a long way.', 'What can we do for him?'], 'Please tell him that he may see photographs of the records, but not the originals.', ['Please let him touch the originals for a short time.', 'Please tell him that no photographs of the records are kept.']),
  check('ac5_sum3', 5, 'p_thorne', 'Please mark the line in this summary that goes too far.', [P('note', 'Summary', ['First point|The paper is about the school at the harbour.', 'Second point|The number of pupils doubled.', 'Third point|The paper proves that the school was the best of all.']), N('Abstract', ['The paper is about the school at the harbour. The number of pupils doubled.', 'The school may have been a good one, but the evidence is small.'])], 'Third point', { fix: ['The school may have been a good one.', 'The school was a bad one.'] }),
  msg('ac5_symp1', 5, 'c_student', 'memo', { say: 'I am a student, and I want to register for the conference on April 20. How much do I pay?' }, L(SYMP), 'You cannot register, because registration closes on April 15.', ['You pay $20, which is half the fee for students.', 'You pay $40, because the fee is the same for students.']),
  msg('ac5_symp2', 5, 'c_scholar', 'memo', { say: 'My paper is 25 minutes long, with 10 minutes for questions. Is that acceptable at the conference?' }, L(SYMP), 'No. A paper may last only 20 minutes, followed by 10 minutes for questions.', ['Yes. A paper may last up to 30 minutes.', 'No. A paper may last only 20 minutes, with no time for questions.']),
  pad('ac5_pad2', 5, 'p_thorne', ['Hello. This is the office of the Harbour Network.', 'The thesis that you asked for cannot be lent, because theses are excluded.', 'We can send you a copy of the abstract by post, at the cost of 3 dollars.'], [
    ['from', 'From', 'the Harbour Network', ['the library of the capital', 'the academy']],
    ['item', 'The item', 'a thesis', ['a rare book', 'an article']],
    ['answer', 'Answer', 'it cannot be lent', ['it will arrive on Friday', 'it is damaged']],
    ['cost', 'Cost of the copy', '3 dollars', ['30 dollars', '13 dollars']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('ac5_review2', 5, 'p_thorne', 'email', { from: '{Professor Hale|@}', subject: 'My article', say: 'The professor has written about his article. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'Two reviewers recommend my article, and the third wants changes.', 'May I reply to the third reviewer?'], 'You may reply once to the reviewers.', ['You may reply as often as you wish.', 'You may not reply to the reviewers.']),
  check('ac5_ok1', 5, 'c_scholar', 'Here is the program and my citation. Are they in agreement?', [P('note', 'Citation', ['Author|{Victor Shaw|@}', 'Title|Tax Records of the Harbour', 'Presented on|May 12']), P('note', 'Program', ['Author|{Victor Shaw|@}', 'Title|Tax Records of the Harbour', 'Presented on|May 12']), SYMP], null),
  msg('ac5_network2', 5, 'c_student', 'memo', { say: 'The library of the capital will send me a book. Who pays for the post?' }, L(NETWORK), 'The library that borrows pays the cost of the post, so your library pays.', ['The library that lends pays the cost of the post.', 'The reader pays the cost of the post.']),
  slot('ac5_room2', 5, 'c_student', 'speech', ['Our small group wants to rehearse a paper for the conference.', 'We need a quiet room in the morning, and we cannot come on Wednesday.'], ROOMS, ROOMCOLS, ['small', 'quiet', 'morning'], ['wed'], 's1-tue10', READERS, { layout: 'rooms' }),
  msg('ac5_abs3', 5, 'p_thorne', 'memo', { say: 'One more abstract, please. Which line is right?' }, ABS('Why did the academy build a library in 1895, when the town already had a public library?', 'The author says that the academy wanted to keep its books apart from the public, from fear of the new schools.'), 'The academy built its library to keep its books apart from the public.', ['The academy built its library because the public library had no space.', 'The academy built its library to give its books to the public.']),
  msg('ac5_flood3', 5, 'c_student', 'memo', { say: 'The photographs are not here today. May I touch the originals if I am careful?' }, ['The flooded records', 'Readers must not touch the records that the water damaged.', 'Only the staff of the repair room may touch them.', 'Readers may see photographs of them.'], 'No. Only the staff of the repair room may touch them, however careful you are.', ['Yes. Readers may touch the originals if they are careful.', 'No. Only the head librarian may touch the originals.']),
  check('ac5_ok2', 5, 'c_scholar', 'I copied this citation from a journal. Could you check it against the first page?', [P('note', 'Citation', ['Author|{Helen Marsh|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|3', 'Year|2008']), P('label', 'Title page', ['Author|{Helen Marsh|@}', 'Journal|Coastal Studies', 'Volume|12', 'Issue|3', 'Year|2008'])], null),
  msg('ac5_final1', 5, 'p_thorne', 'letter', { from: '{Grandma Rose|@}', say: 'A reader has written a letter to the head librarian. Please read it and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'I am eighty-two, and I came to your library every week for forty years.', 'I should like to thank you and your staff for the kindness that you have always shown me, and for the books that kept me company.'], 'Thank you for your kind words. We are always glad to see you, and we shall keep a chair for you in the reading room.', ['Thank you for your question. A thesis may be read only in the reading room.', 'Thank you for your letter. The library will close next month, and you must return your books.']),
  msg('ac5_gift2', 5, 'c_scholar', 'memo', { say: 'I want to give the library a box of books about the sea. Some are damaged. Will you take them all?' }, ['Gifts of books', 'The library takes only books in good condition.', 'It may sell books that it already has.'], 'We take only the books that are in good condition.', ['We take all of them, even the damaged ones.', 'We take none of them, because we do not take gifts.']),
  check('ac5_ok3', 5, 'c_oldman', 'Here is my loan slip for the books. Please check that the dates agree with the rule.', [P('card', 'Loan slip', ['Name|{Grandpa Sam|@}', 'Borrowed|June 2', 'Due|June 23']), N('Loans', ['You can keep a book for three weeks.'])], null),
  msg('ac5_abs4', 5, 'p_thorne', 'memo', { say: 'The last abstract of the day. Which line is right?' }, ABS('Many people think that children read more when books are cheap. The author asked 40 schools and found that this is not true. A quiet place to read is more important.'), 'Cheap books do not make children read more; a quiet place is more important.', ['Cheap books make children read more; a quiet place is not important.', 'Cheap books do not make children read more; the price of books is more important.']),
  msg('ac5_final2', 5, 'p_thorne', 'email', { from: '{Mr. Osei|@}', subject: 'After the conference', say: 'The conference is over, and a colleague has written. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'The conference was a great success, and several visitors asked whether the papers would be published.', 'If the contributors agree, the academy would like the library to keep a copy of each paper in the archive.'], 'We shall gladly keep a copy of each paper in the archive, provided that the contributors agree.', ['We shall gladly keep a copy of each paper in the archive, even if the contributors object.', 'We cannot keep the papers, because the archive accepts only rare books.']),
];

// ---------------------------------------------------------------------------- more fixed tasks (the same rules, new readers)

R3.push(
  check('ac3_card3', 3, 'c_student', 'This book has 300 pages, I think. Please check the pages on the card.', [P('card', 'Card', ['Title|The Plants of the Coast', 'Author|{Helen Marsh|@}', 'Pages|330']), P('label', 'Title page', ['Title|The Plants of the Coast', 'Author|{Helen Marsh|@}', 'Pages|300'])], 'Pages', { fix: ['300', '303'] }),
  msg('ac3_ill3', 3, 'c_student', 'memo', { say: 'I asked for a book from another library on Monday. Will it arrive on Wednesday?' }, L(ILL), 'No. A book from another library takes about ten days to arrive.', ['Yes. A book from another library arrives in two days.', 'No. A book from another library takes about ten weeks to arrive.']),
  msg('ac3_lect3', 3, 'c_scholar', 'memo', { say: 'When is the lecture on ancient history, and who gives it?' }, ['Lectures this month', 'Tuesday, 6:00: Ancient history, {Professor Hale|@}', 'Thursday, 6:00: Modern poetry, {Mr. Osei|@}'], 'It is on Tuesday at 6:00, and {Professor Hale|@} gives it.', ['It is on Thursday at 6:00, and {Mr. Osei|@} gives it.', 'It is on Tuesday at 6:00, and {Mr. Osei|@} gives it.']),
  sort('ac3_shelf5', 3, 'The cart again. Please read each line.', ['science', 'history', 'literature', 'tech'], [['A study of the climate and the harvests of the north', 'science'], ['The history of the telephone in the harbour town', 'tech'], ['A novel about a teacher in a village by the sea', 'literature'], ['The diaries of a sailor and the great flood', 'history']]),
  msg('ac3_mail3', 3, 'p_thorne', 'email', { from: '{Ms. Reyes|@}', subject: 'The lecture hall', say: 'An assistant has sent a question. Please read the email and answer it.' }, ['Dear {Ms. Thorne|@},', 'A group of six students would like to use the lecture hall on Wednesday afternoon.', 'May they book it?'], 'Yes. A group of four or more may use the lecture hall, so they may book it.', ['No. A group of four or more may not use the lecture hall.', 'Yes. But only a group of ten may use the lecture hall.']),
  slot('ac3_room5', 3, 'c_student', 'speech', ['I would like to book a room for my group of four, and we need computers.', 'We can come in the afternoon, but not on Tuesday.'], ROOMS, ROOMCOLS, ['computers', 'afternoon'], ['tue'], 's2-mon2', READERS, { layout: 'rooms' }),
  check('ac3_cite3', 3, 'c_student', 'Please check the pages in my reference against the journal.', [P('note', 'Reference', ['Author|{Nina Frost|@}', 'Journal|Harbour Science', 'Pages|8 to 19']), P('label', 'Title page', ['Author|{Nina Frost|@}', 'Journal|Harbour Science', 'Pages|8 to 16'])], 'Pages', { fix: ['8 to 16', '8 to 6'] }),
);
R4.push(
  check('ac4_card3', 4, 'c_student', 'Please check the author on this record against the title page.', [P('card', 'Record', ['Title|The Records of the Harbour', 'Author|{Victor Shaw|@}', 'Edition|Revised']), P('label', 'Title page', ['Title|The Records of the Harbour', 'Author|{Edith Lowe|@}', 'Edition|Revised'])], 'Author', { fix: ['{Edith Lowe|@}', '{Nina Frost|@}'] }),
  msg('ac4_special3', 4, 'c_scholar', 'memo', { say: 'May I photograph two pages of a rare book if I have written permission?' }, L(SPECIAL), 'Yes. No photographs may be taken without written permission, and you have it.', ['No. Photographs may never be taken in the rare books room.', 'Yes. Photographs may be taken by every reader.']),
  msg('ac4_digital3', 4, 'c_girl', 'memo', { say: 'I am a member of the academy. May I read the journals at home?' }, L(DIGITAL), 'Yes. Members of the academy may read the journals from home.', ['No. Members may read the journals only on the computers in the library.', 'Yes. But only on Sundays.']),
  msg('ac4_buy3', 4, 'c_student', 'memo', { say: 'Two members of staff approve my suggestion, and the book costs $60. Will the library buy it?' }, L(BUY), 'Yes. Two members of staff approve, and the price is under $80.', ['No. The price must be over $80.', 'No. Three members of staff must approve.']),
  msg('ac4_fellow3', 4, 'c_scholar', 'memo', { say: 'I have two references and a plan of my research. I shall send my application on March 5. Is that in time?' }, L(FELLOW), 'No. Applications must be made by March 1.', ['Yes. Applications may be made until March 31.', 'No. Applications need three references.']),
  sort('ac4_shelf4', 4, 'The new books are here. Please read each title.', ['science', 'history', 'literature', 'arts'], [['The Fish of the Northern Coast', 'science'], ['The Tax Records of the Harbour Town', 'history'], ['The Novels of a Poet', 'literature'], ['The Painters of the Harbour School', 'arts']]),
  check('ac4_loan3', 4, 'c_oldman', 'This is the loan slip for my books. Please check that the dates agree with the rule.', [P('card', 'Loan slip', ['Name|{Grandpa Sam|@}', 'Borrowed|May 3', 'Due|May 31']), N('Loans', ['You can keep a book for three weeks.'])], 'Due', { fix: ['May 24', 'May 17'] }),
  msg('ac4_mail3', 4, 'p_thorne', 'email', { from: '{Ken|@}', subject: 'The seminar room', say: 'A student has written to the library. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'We are six students, and we would like to use the seminar room on Wednesday.', 'May we?'], 'No. A group of eight or more may use the seminar room.', ['Yes. A group of six may use the seminar room.', 'No. A group of sixty or more may use the seminar room.']),
  slot('ac4_room3', 4, 'c_student', 'speech', ['We are about twenty students, and we need a room for a talk.', 'We can come in the morning, but not on Monday.'], ROOMS, ROOMCOLS, ['large', 'morning'], ['mon'], 'hall-wed10', READERS, { layout: 'rooms' }),
  msg('ac4_abs3', 4, 'p_thorne', 'memo', { say: 'Please read this and choose the right line.' }, ABS('The author asked twenty teachers about the library.', 'Most of them used the library every week, and several said that it helped their lessons.'), 'Most of the teachers used the library every week, and several said that it helped their lessons.', ['All of the teachers used the library every week.', 'Most of the teachers never used the library.']),
  check('ac4_sum4', 4, 'p_thorne', 'This summary goes beyond the abstract. Please mark the line that does.', [P('note', 'Summary', ['First point|The author studied the fish of the northern coast.', 'Second point|The fish became fewer in the last century.', 'Third point|The author proves that the cause was the sea.']), N('Abstract', ['The author studied the fish of the northern coast. The fish became fewer in the last century.', 'The author thinks that the temperature of the sea may be the cause, but he does not prove it.'])], 'Third point', { fix: ['The author does not prove the cause.', 'The author proves that the cause was too many boats.'] }),
  msg('ac4_closing3', 4, 'c_student', 'memo', { say: 'My thesis has been under embargo for two years. Who may read it now?' }, ['Embargoed theses', 'A thesis may be embargoed for up to two years.', 'An embargoed thesis may be read only with the written permission of its author.'], 'Only a reader who has the written permission of the author may read it.', ['Every reader may read it now.', 'Only the head librarian may read it.']),
  pad('ac4_pad3', 4, 'p_thorne', ['Good morning. This is {Professor Hale|@}.', 'I would like to see the records of 1850 on Friday.', 'Please tell me whether I must make an appointment.'], [
    ['who', 'Caller', '{Professor Hale|@}', ['{Mr. Osei|@}', '{Mr. Ashby|@}']],
    ['what', 'He wants to see', 'the records of 1850', ['the maps of 1850', 'the diaries of the sailors']],
    ['day', 'On', 'Friday', ['Monday', 'Wednesday']],
    ['ask', 'He asks about', 'an appointment', ['a photograph', 'a fine']],
  ], { features: ['audioOnly'], say: 'The telephone is ringing. Please listen carefully and write the message.' }),
  msg('ac4_phone3', 4, 'p_thorne', 'phone', { say: 'Please listen. A reader has a question about the rare books room.' }, ['Hello, this is {Ken|@}.', 'I should like to read a rare book on Thursday morning. It is Tuesday afternoon now.', 'Is that possible?'], 'No. An appointment must be made 48 hours before, so Thursday afternoon is the earliest.', ['Yes. You may read it on Thursday morning without an appointment.', 'No. An appointment must be made 48 days before.'], { features: ['audioOnly'] }),
);
R5.push(
  check('ac5_cite3', 5, 'c_student', 'Please check the length of my paper in my citation against the program of the conference.', [P('note', 'Citation', ['Author|{Victor Shaw|@}', 'Title|Tax Records of the Harbour', 'Length|30 minutes']), P('note', 'Program', ['Author|{Victor Shaw|@}', 'Title|Tax Records of the Harbour', 'Length|20 minutes']), N('Conference', ['Each paper lasts 20 minutes, followed by 10 minutes for questions.'])], 'Length', { fix: ['20 minutes', '10 minutes'] }),
  msg('ac5_network3', 5, 'c_scholar', 'memo', { say: 'May our library borrow a rare book from the library of the capital?' }, ['The Harbour Network', 'Member libraries lend books to each other for four weeks.', 'Rare books and theses are excluded from the agreement.'], 'No. Rare books are excluded from the agreement.', ['Yes. Member libraries lend rare books for four weeks.', 'No. Only theses are excluded from the agreement.']),
  msg('ac5_copy3', 5, 'c_student', 'memo', { say: 'The author of this book died in 1960. May I copy a map from it without asking?' }, ['Copyright', 'Copyright ends 70 years after the death of the author.', 'A work whose author died before 1950 is free to copy.'], 'No. The author died after 1950, so you need permission.', ['Yes. The author died before 1950.', 'No. Copyright ends 20 years after the death of the author.']),
  msg('ac5_review3', 5, 'c_scholar', 'memo', { say: 'Only one of the three reviewers recommends my article. Will it be accepted?' }, ['Articles', 'An article is accepted if two of the three reviewers recommend it.'], 'No. Two of the three reviewers must recommend it.', ['Yes. One reviewer is enough.', 'No. All three reviewers must recommend it.']),
  check('ac5_sum4', 5, 'p_thorne', 'Please mark the line in this summary that goes too far.', [P('note', 'Summary', ['First point|The author compares two poems about the sea.', 'Second point|Both poems speak of a storm.', 'Third point|The author proves that the later poet copied the earlier one.']), N('Abstract', ['The author compares two poems about the sea. Both poems speak of a storm.', 'He does not say that the later poet copied the earlier one.'])], 'Third point', { fix: ['The author does not say that the later poet copied the earlier one.', 'The author says that the earlier poet copied the later one.'] }),
  msg('ac5_gift3', 5, 'p_thorne', 'letter', { from: '{Mrs. Hill|@}', say: 'A letter has come from a reader who wishes to give books to the library. Please read it and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'I have a box of books about the sea, and some of them are damaged.', 'Would you take them?'], 'We should be glad to see the books, but we can take only those in good condition.', ['We shall take every book, even the damaged ones.', 'We cannot take any books about the sea.']),
  slot('ac5_room3', 5, 'c_scholar', 'speech', ['I would like to rehearse my paper for the conference.', 'I need a small quiet room in the morning, and I cannot come on Tuesday.'], ROOMS, ROOMCOLS, ['small', 'quiet', 'morning'], ['tue'], 's1-mon10', READERS, { layout: 'rooms' }),
  sort('ac5_shelf3', 5, 'The last papers for the conference. Please read each line.', ['science', 'history', 'literature', 'arts', 'tech'], [['A model of the sea and the fish of the north', 'science'], ['Tax records and the politics of a small port', 'history'], ['A poet and the dialect of the sailors', 'literature'], ['Light and color in the paintings of the harbour school', 'arts'], ['The design of a sea wall that can stand a storm', 'tech']]),
  msg('ac5_mail3', 5, 'p_thorne', 'email', { from: '{Mr. Osei|@}', subject: 'The papers', say: 'A colleague has written about the conference papers. Please read the email and choose the reply.' }, ['Dear {Ms. Thorne|@},', 'If the contributors agree, the academy would like the library to keep a copy of each paper.', 'May we send them to you?'], 'Yes. We shall gladly keep a copy of each paper, provided that the contributors agree.', ['Yes. We shall keep a copy of each paper, even if the contributors do not agree.', 'No. The library keeps only rare books.']),
  msg('ac5_phone3', 5, 'p_thorne', 'phone', { say: 'Please listen. A reader has a question about the damaged records.' }, ['Good morning. This is {Professor Hale|@}.', 'The photographs of the damaged records of 1850 are not in the reading room today.', 'May I see the originals instead?'], 'No. Only the staff of the repair room may touch the originals, but the photographs will be here tomorrow.', ['Yes. You may see the originals if you wear gloves.', 'No. The photographs and the originals are both lost.'], { features: ['audioOnly'] }),
  msg('ac5_closing3', 5, 'c_student', 'memo', { say: 'A publisher has asked in writing for my thesis to be embargoed for longer. Is that possible?' }, ['Embargoed theses', 'A thesis may be embargoed for up to two years.', 'It may be embargoed for longer once, but only if a publisher asks in writing.'], 'Yes. It may be embargoed for longer once, because a publisher has asked in writing.', ['No. It may never be embargoed for longer.', 'Yes. It may be embargoed for longer as often as you wish.']),
);

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

const LIB_CALLERS = ['{Professor Hale|@}', '{Ken|@}', '{Tom|@}', '{Lily|@}', '{Mr. Grant|@}', '{Nora|@}'];
const AUTHORS = ['{Helen Marsh|@}', '{Peter Dunn|@}', '{Clara Boyd|@}', '{Samuel Page|@}', '{Edith Lowe|@}', '{Victor Shaw|@}', '{Nina Frost|@}', '{Oscar Wynn|@}'];
const TITLES1 = ['The Stars of Spring', 'Birds of the Bay', 'Maths for Children', 'The History of Our Town', 'Songs of the Harbour', 'Stories of the Sea', 'How Plants Grow', 'The Old Kings'];

// ---------------------------------------------------------------------------- rank 1 banks and templates

const QA_SPEECH1: QaItem[] = [
  qa('Good morning. Can I have a library card, please?', 'Sure. Please fill in this form.', 'request', 1, ['The library closes at six.', 'It is twenty cents a day.']),
  qa('Thank you for your help.', 'You are welcome. Enjoy your book.', 'thanks', 1, ['Please write your name here.', 'It is on the first floor.']),
  qa('I am sorry. My book is late.', 'That is all right. Please give it to me.', 'apology', 1, ['It is five cents a page.', 'You can read it in the reading room.']),
  qa('Where can I find books about birds?', 'They are on the science shelf.', 'place', 1, ['It is twenty cents a day.', 'The library closes at six.']),
  qa('Can you help me find a book?', 'Of course. Please tell me the title.', 'help', 1, ['It is five cents a page.', 'Yes, the library is open on Saturday.']),
  qa('How much is it to copy a page?', 'It is five cents.', 'price', 1, ['It is on the first floor.', 'Yes, you can take it home.']),
  qa('Is this the reading room?', 'Yes, this is the reading room.', 'confirm', 1, ['It is five cents.', 'Please come back on Monday.']),
  qa('Can I put my bag here?', 'Yes, you can put it here.', 'permission', 1, ['It is on the second floor.', 'The library closes at six.']),
  qa('What is the number of this book?', 'The number is 482.', 'number', 1, ['You can keep it for three weeks.', 'Yes, it is on the science shelf.']),
];
const QA_PHONE1: QaItem[] = [
  qa('Hello. Is this the library?', 'Yes, this is the library.', 'confirm', 1, ['It is five cents.', 'No, thank you.']),
  qa('Hello. I want to talk to {Ms. Thorne|@}.', 'Just a moment, please.', 'transfer', 1, ['You are welcome.', 'It is on the second floor.']),
  qa('Can I leave a message?', 'Yes, please. Tell me your name.', 'message', 1, ['It is twenty cents a day.', 'Please come on Monday.']),
  qa('Who is calling, please?', 'This is {Professor Hale|@}.', 'name', 1, ['It is next to the reading room.', 'Please write your name here.']),
  qa('Thank you for calling.', 'You are welcome. Goodbye.', 'thanks', 1, ['Yes, this is the library.', 'It is five cents.']),
  qa('Please call me back after lunch.', 'Yes. I will call you after lunch.', 'callback', 1, ['It is on the first floor.', 'No, thank you.']),
  qa('What is your phone number?', 'My number is 4 5 8 2.', 'number', 1, ['You are welcome.', 'It is next to the window.']),
];
const QA_NOTICE1: QaItem[] = [
  qa('The library is closed on Sunday. Can I come on Sunday?', 'No, the library is closed on Sunday.', 'closed', 1, ['Yes, please come on Sunday at nine.', 'Yes, the library is open on Sunday until six.']),
  qa('You can keep a book for three weeks. Can I keep this book for a week?', 'Yes, you can keep it for three weeks.', 'loan', 1, ['No, you must bring it back in a week.', 'No, you can keep it for three days.']),
  qa('A late book costs 20 cents a day. My book is three days late. How much is the fine?', 'It is 60 cents.', 'fine', 1, ['It is 20 cents.', 'It is 6 dollars.']),
  qa('Please be quiet on the second floor. Can I talk loudly on the second floor?', 'No, please be quiet on the second floor.', 'quiet', 1, ['Yes, you can talk loudly.', 'No, please talk loudly on the first floor.']),
  qa('The study rooms are on the second floor. Where are the study rooms?', 'They are on the second floor.', 'place', 1, ['They are on the first floor.', 'They are next to the door.']),
  qa('The library opens at 8:30. Is the library open at eight?', 'No, it opens at half past eight.', 'hours', 1, ['Yes, it is open at eight.', 'No, it opens at nine.']),
  qa('You need a card to borrow books. Can I borrow a book without a card?', 'No, you need a card.', 'card', 1, ['Yes, you can borrow it today.', 'No, you need a dog.']),
  qa('Copies are 5 cents a page. How much are three pages?', 'It is 15 cents.', 'price', 1, ['It is 5 cents.', 'It is 3 dollars.']),
];

const T1: TaskTemplate[] = [
  srt('at1_sort1', 1, 'Please put the books on the right shelves.', [3, 4], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['A book about the stars', 'science'], ['A book about fish and the sea', 'science'], ['A book about plants', 'science'], ['A book of old stories', 'literature'], ['A book of poems', 'literature'],
    ['A book about the old town', 'history'], ['A book about kings and queens', 'history'], ['A book of songs', 'arts'], ['A book about drawing', 'arts'], ['A book about numbers', 'maths'],
    ['A book of easy sums', 'maths'], ['A book about machines', 'tech'], ['A book about computers', 'tech'],
  ]),
  chk('at1_check_card', 1, 'Is the card the same as the title page?', [
    { id: 'title', label: 'Title', values: TITLES1 },
    { id: 'author', label: 'Author', values: AUTHORS },
    { id: 'year', label: 'Year', values: ['1975', '1957', '1998', '1989', '2001', '2010'] },
  ], [{ kind: 'card', title: 'Card', fields: ['title', 'author', 'year'] }, { kind: 'label', title: 'Title page', fields: ['title', 'author', 'year'] }], ['title', 'author', 'year'], 0.65),
  chk('at1_check_fine', 1, 'Please check the fine on my slip.', [
    { id: 'days', label: 'Days late', range: [2, 9] },
    { id: 'fine', label: 'Fine', calc: 'days * 20', fmt: '{n} cents' },
  ], [{ kind: 'invoice', title: 'Fine slip', fields: ['days', 'fine'] }, { kind: 'note', title: 'Loans', lines: ['A late book costs 20 cents a day.'] }], ['fine'], 0.65),
  slt('at1_slot', 1, 'speech', 'Please book a study room for me.', DAYS.slice(0, 4), TIMES, [['mon', 'I can come on Monday.'], ['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'I want to come in the morning.'], ['afternoon', 'I want to come in the afternoon.']], [['mon', 'I cannot come on Monday.'], ['t9', 'I cannot come at nine.'], ['t4', 'I cannot come at four.']], READERS),
  choose('at1_speech', 1, 'speech1', 'speech'),
  choose('at1_phone', 1, 'phone1', 'phone', 'The telephone is ringing. Please answer the call.'),
  choose('at1_notice', 1, 'notice1', 'memo'),
  frm('at1_pad', 1, ['Hello, this is {who}.', 'I want to reserve {want}.', 'Please call me back {call}.'], [
    { id: 'who', label: 'Caller', values: LIB_CALLERS },
    { id: 'want', label: 'About', values: ['a book about birds', 'a book about stars', 'a book of poems', 'a book about the old town'] },
    { id: 'call', label: 'Call back', values: ['after lunch', 'before lunch', 'tomorrow'] },
  ], 'The telephone is ringing. Please write down the message.'),
];

// ---------------------------------------------------------------------------- rank 2 banks and templates

const QA_SPEECH2: QaItem[] = [
  qa('I would like to renew my library card. What should I do?', 'Please fill in this form and show me your old card.', 'renew', 2, ['A late book costs twenty cents a day.', 'The reading room is on the first floor.']),
  qa('I think there is a mistake on my fine slip.', 'I am sorry. Let me look at it.', 'complaint', 2, ['Please come back on Friday.', 'You can copy a few pages.']),
  qa('Could you tell me where the maps are kept?', 'They are in the archive, next to the reading room.', 'place', 2, ['It is five cents a page.', 'Please fill in this form.']),
  qa('Do I have to pay now?', 'No, you can pay when you bring the book back.', 'payment', 2, ['The archive is on the first floor.', 'Please show me your card.']),
  qa('I have lost my library card. Can you help me?', 'Of course. Please fill in this form.', 'help', 2, ['The library opens at half past eight.', 'You can copy a few pages.']),
  qa('May I use the computer for ten minutes?', 'Yes, of course. It is free for readers.', 'permission', 2, ['The fine is twenty cents a day.', 'Please sit over there.']),
  qa('Thank you very much. You have been very kind.', 'It was my pleasure. Have a nice day.', 'thanks', 2, ['The form is on the table.', 'You must bring it back on Friday.']),
  qa('Excuse me, is there someone at this desk?', 'Yes, I am sorry to keep you waiting.', 'attention', 2, ['The book is due on Friday.', 'The archive is closed today.']),
];
const QA_PHONE2: QaItem[] = [
  qa('Good morning. I would like to speak to the person who looks after the archive.', 'I will put you through. Please hold the line.', 'transfer', 2, ['The book is due on Friday.', 'You are welcome. Goodbye.']),
  qa('Could you tell {Ms. Thorne|@} that I called?', 'Yes, I will tell her. Please give me your name.', 'message', 2, ['The fine is twenty cents a day.', 'The library is closed on Sunday.']),
  qa('I am calling about my reserved book. Is {Mr. Ashby|@} in?', 'I am afraid he is out. I can take a message.', 'absent', 2, ['The book is ready.', 'Please pay at the desk.']),
  qa('Could you repeat that number, please?', 'Of course. It is 4 5 8 2.', 'repeat', 2, ['Yes, I will tell her.', 'It is twenty cents a day.']),
  qa('Thank you. I will call again tomorrow.', 'All right. Goodbye.', 'closing', 2, ['The form is on the desk.', 'Please fill in this form.']),
  qa('Is the reading room open this evening?', 'I am sorry. The reading room is closed this evening.', 'hours', 2, ['The fine is twenty cents.', 'Please bring your card.']),
];
const QA_NOTICE2: QaItem[] = [
  qa('You can renew a book twice if nobody has reserved it. Nobody has reserved my book. May I renew it a second time?', 'Yes, you may renew it twice.', 'renew', 2, ['No, you may renew it only once.', 'No, a book can never be renewed.']),
  qa('Reference books may not leave the reading room. May I take a dictionary home?', 'No, a dictionary may not leave the reading room.', 'reference', 2, ['Yes, you may take it home for three weeks.', 'No, a dictionary must leave the reading room.']),
  qa('A reserved book is kept for three days. My reserved book arrived on Monday. Until when is it kept?', 'It is kept until Thursday.', 'reserve', 2, ['It is kept until Friday.', 'It is kept until next Monday.']),
  qa('Children under 10 must come with an adult. My brother is eight. May he come alone?', 'No, he must come with an adult.', 'children', 2, ['Yes, he may come alone.', 'No, he must come with a teacher.']),
  qa('Copies are 5 cents a page, and scanning is free. How much does it cost to scan ten pages?', 'It is free.', 'copy', 2, ['It is 50 cents.', 'It is 5 cents.']),
  qa('The archive is open on Tuesday and Thursday afternoon. Is it open on Wednesday afternoon?', 'No, it is open on Tuesday and Thursday.', 'archive', 2, ['Yes, it is open on Wednesday afternoon.', 'No, it is open on Wednesday and Friday.']),
  qa('A study room may be booked for two hours. My friends and I want a room for three hours. Is that allowed?', 'No, a room may be booked for two hours only.', 'room', 2, ['Yes, a room may be booked for three hours.', 'No, a room may be booked for one hour only.']),
  qa('The lecture on the old harbour begins at 6:00 on Tuesday. When does the lecture begin?', 'It begins at six on Tuesday.', 'lecture', 2, ['It begins at six on Thursday.', 'It begins at eight on Tuesday.']),
];
const QA_ABS2: QaItem[] = [
  qa('Abstract: A volcano grows when hot rock comes up from deep in the earth. This book explains how a volcano grows and why some volcanoes are dangerous.', 'The book explains how a volcano grows and why some are dangerous.', 'science', 2, ['The book explains how to build a house near a volcano.', 'The book says that all volcanoes are safe.']),
  qa('Abstract: In 1850 a great flood covered the harbour town. This book tells how the people saved their homes and built a wall.', 'The book tells how the people saved their homes after the flood and built a wall.', 'history', 2, ['The book tells how the harbour was built after the wall fell.', 'The book says that the flood happened in 1580.']),
  qa('Abstract: This book teaches children to paint with three colors. It has twenty pictures and easy steps.', 'The book teaches children to paint with three colors, using twenty pictures.', 'arts', 2, ['The book teaches children to paint with twenty colors.', 'The book teaches teachers to paint with three colors.']),
  qa('Abstract: A young girl finds an old map in a box. She follows it and finds a small island with a secret.', 'A girl finds an old map and follows it to an island with a secret.', 'story', 2, ['A girl finds an old box and follows it to a map with a secret.', 'A boy finds an old map and sails to a big city.']),
  qa('Abstract: This book explains how birds find their way. Some birds follow the stars, and others follow rivers.', 'The book explains that some birds follow the stars and others follow rivers.', 'science', 2, ['The book explains that all birds follow rivers.', 'The book explains that some fish follow the stars.']),
  qa('Abstract: The author visited ten towns on the coast and wrote about their markets. Each chapter is about one town.', 'The author wrote about the markets of ten coastal towns, one in each chapter.', 'travel', 2, ['The author wrote about the markets of one town, in ten chapters.', 'The author wrote about the harbours of twenty coastal towns.']),
];
const QA_MAIL2: QaItem[] = [
  qa('Dear {Ms. Thorne|@}, I would like to see the old maps on Wednesday afternoon. Are they in the archive?', 'Yes, the maps are in the archive, and you may see them on Wednesday afternoon.', 'maps', 2, ['Yes, the maps are in the archive, and you may see them on Wednesday morning.', 'No, the maps are not in the archive, but you may see them on Friday.']),
  qa('Dear Sir, please reserve the book on birds for me. My library card number is 4582.', 'We will reserve the book for card number 4582.', 'reserve', 2, ['We will reserve the book for card number 4852.', 'We will reserve the book on stars for card number 4582.']),
  qa('Dear Sir, thank you for finding the book for my essay. It was very useful.', 'Thank you for your kind words. We are glad that we could help.', 'thanks', 2, ['We will send the book to you tomorrow.', 'Your fine is twenty cents a day.']),
  qa('Dear Sir, my book is due on Friday, but I am ill. May I bring it back on Monday?', 'Yes, you may bring it back on Monday.', 'extend', 2, ['Yes, you may bring it back on Friday only.', 'No, you must bring it back on Sunday.']),
  qa('Dear Sir, the lecture is held only on Tuesday at six. I cannot come on Tuesday. May I hear it on Thursday?', 'No. The lecture is held only on Tuesday.', 'lecture', 2, ['Yes. You may hear it on Thursday at six.', 'No. The lecture is held only on Thursday.']),
  qa('Dear Sir, my library card is lost. Please send me a new one to 8 Mill Street.', 'We will send a new card to 8 Mill Street.', 'card', 2, ['We will send a new card to 18 Mill Street.', 'We will send a new card to 8 Mill Lane.']),
];

const T2: TaskTemplate[] = [
  srt('at2_sort1', 2, 'Please read each title and put the book on the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['How a Volcano Grows', 'science'], ['The Planets and Their Moons', 'science'], ['Birds and How They Find Their Way', 'science'], ['The Kings of the Old Empire', 'history'], ['The Great War: A Short History', 'history'],
    ['Poems for a Rainy Day', 'literature'], ['A Novel of the North', 'literature'], ['A Guide to Oil Painting', 'arts'], ['Songs and Dances of the Coast', 'arts'], ['Numbers and How to Use Them', 'maths'],
    ['Sums for Young Scholars', 'maths'], ['How Computers Think', 'tech'], ['The Story of the Telephone', 'tech'],
  ]),
  chk('at2_check_pub', 2, 'Please check the publisher on the card.', [
    { id: 'title', label: 'Title', values: ['How a Volcano Grows', 'The Planets and Their Moons', 'Poems for a Rainy Day', 'The Great War'] },
    { id: 'publisher', label: 'Publisher', values: ['{Seabright|@} Press', '{Sunbright|@} Press', '{Greenhill|@} Books', '{Bluehill|@} Books'] },
  ], [{ kind: 'card', title: 'Card', fields: ['title', 'publisher'] }, { kind: 'label', title: 'Title page', fields: ['title', 'publisher'] }], ['publisher'], 0.65),
  chk('at2_check_due', 2, 'I borrowed this book on the day shown. Is the day to bring it back right?', [
    { id: 'borrowed', label: 'Borrowed', range: [1, 5], names: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'due', label: 'Due', calc: 'borrowed', names: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  ], [{ kind: 'card', title: 'Loan slip', fields: ['borrowed', 'due'] }, { kind: 'note', title: 'Loans', lines: ['A book is due on the same day of the week, three weeks later.'] }], ['due'], 0.65),
  chk('at2_check_pages', 2, 'Is the number of pages on the card right?', [
    { id: 'title', label: 'Title', values: ['Cooking with Herbs', 'How Plants Grow', 'The Great Flood', 'Paintings of the Sea'] },
    { id: 'pages', label: 'Pages', values: ['220', '202', '180', '108', '312', '321'] },
  ], [{ kind: 'card', title: 'Card', fields: ['title', 'pages'] }, { kind: 'label', title: 'Title page', fields: ['title', 'pages'] }], ['pages'], 0.65),
  slt('at2_slot', 2, 'speech', 'Please book a study room for my group.', DAYS.slice(0, 4), TIMES, [['tue', 'We can come on Tuesday.'], ['wed', 'We can come on Wednesday.'], ['thu', 'We can come on Thursday.'], ['morning', 'The morning is best for us.'], ['afternoon', 'We can only come in the afternoon.']], [['mon', 'We are not free on Monday.'], ['wed', 'We are not free on Wednesday.'], ['t11', 'We cannot come at eleven.']], READERS),
  choose('at2_speech', 2, 'speech2', 'speech'),
  choose('at2_phone', 2, 'phone2', 'phone', 'The telephone is ringing. Please answer the call.'),
  choose('at2_notice', 2, 'notice2', 'memo'),
  choose('at2_abs', 2, 'abs2', 'memo', 'Please read this abstract and choose the right short description.'),
  choose('at2_mail', 2, 'mail2', 'email', 'An email came for us. Please read it and answer it.'),
  frm('at2_pad', 2, ['Hello, this is {who}.', 'I need {what} for my study.', 'Please keep it for me until {day}.'], [
    { id: 'who', label: 'Caller', values: LIB_CALLERS },
    { id: 'what', label: 'Needs', values: ['the old map', 'the harbour record', 'a book about birds', 'a book of poems', 'an encyclopedia', 'a leaflet about the lectures', 'a manual for the printer', 'the syllabus of the lecturer'] },
    { id: 'day', label: 'Until', values: ['Friday', 'Monday', 'Wednesday'] },
  ], 'The telephone is ringing. Please write down the message.'),
];

// ---------------------------------------------------------------------------- rank 3 banks and templates

const QA_SPEECH3: QaItem[] = [
  qa('I was wondering if you could help me find a book on the climate of the north.', 'Of course. Please tell me what you need it for, and I will look in the catalog.', 'help', 3, ['A thesis may be read only in the reading room.', 'The service costs four dollars for each book.']),
  qa('Would you mind checking whether my article has arrived from the other library?', 'Not at all. Let me look at the list.', 'check', 3, ['Copies cost five cents a page.', 'The lecture begins at six on Tuesday.']),
  qa('Excuse me, could you tell me where the journals are kept?', 'The journals are in the reading room, on the first floor.', 'direction', 3, ['A late book costs twenty cents a day.', 'Visitors must pay a deposit of twenty dollars.']),
  qa('I am afraid that I did not understand the card in the catalog.', 'I am sorry about that. Let me explain it to you.', 'explain', 3, ['A study room may be booked for two hours.', 'Older volumes may be borrowed for one week.']),
  qa('Would it be possible to speak to someone who knows about old maps?', 'Certainly. I will ask {Mr. Ashby|@} to come.', 'request', 3, ['The fine for one book is never more than five dollars.', 'Copying a whole book is not allowed.']),
  qa('I should like to thank you for your patience.', 'It was no trouble. I am glad to help.', 'thanks', 3, ['The archive is open on Tuesday and Thursday.', 'Readers are told by email when the book has arrived.']),
  qa('Could you give me a slip with the number of this book, please?', 'Certainly. Here is the slip.', 'slip', 3, ['A group of four or more may use the lecture hall.', 'The service takes about ten days.']),
  qa('I am sorry to trouble you again. I have one more question about my essay.', 'It is no trouble at all. Please ask.', 'question', 3, ['A reader who loses a book must pay the price.', 'The latest issue stays in the reading room.']),
];
const QA_PHONE3: QaItem[] = [
  qa('Good morning. This is {Professor Hale|@}. I cannot come on Tuesday. Can I come on Thursday instead?', 'Yes. I will move your appointment to Thursday.', 'move', 3, ['Yes. I will move your appointment to Wednesday.', 'Yes. I will keep your appointment on Tuesday.']),
  qa('I have an appointment at 2:00 on Wednesday, but I shall be late. May I come at 3:00?', 'Yes. I will tell {Ms. Thorne|@} that you will come at 3:00.', 'late', 3, ['Yes. I will tell {Ms. Thorne|@} that you will come at 2:00.', 'Yes. I will tell {Ms. Thorne|@} that you will come on Thursday.']),
  qa('Hello. I am calling about the article that I ordered from the other library. Has it arrived?', 'I will check, and I will call you back this afternoon.', 'status', 3, ['The service costs four dollars for each book.', 'The lecture begins at six on Tuesday.']),
  qa('Please tell {Mr. Ashby|@} that I returned the old maps on Monday.', 'Yes, I will tell him that you returned the old maps on Monday.', 'message', 3, ['Yes, I will tell him that you returned the old maps on Friday.', 'Yes, I will tell him that you returned the new maps on Monday.']),
  qa('This is {Ken|@}. My thesis is due on Friday. How can I find the journals that I need?', 'Please come to the reading room, and I will show you the catalog.', 'help', 3, ['Please pay the fee after Friday.', 'Please bring the thesis to the hearing.']),
  qa('Could you send the list of lectures to 14 Mill Lane?', 'Yes, I will send the list to 14 Mill Lane.', 'send', 3, ['Yes, I will send the list to 41 Mill Lane.', 'Yes, I will send the list to 14 Mill Road.']),
  qa('Hello, I would like to complain about the noise on the second floor.', 'I am sorry to hear that. I will ask the readers to be quiet.', 'complaint', 3, ['Thank you. The book will be ready on Friday.', 'The fine is twenty cents a day.']),
  qa('Thank you for your help. I will come to the library on Friday.', 'You are welcome. We shall see you on Friday.', 'closing', 3, ['You are welcome. We shall see you on Monday.', 'Thank you. A thesis may be read only in the reading room.']),
];
const QA_NOTICE3: QaItem[] = [
  qa('Readers may copy up to 10 percent of a book. This book has 200 pages. How many pages may I copy?', 'You may copy 20 pages.', 'copy', 3, ['You may copy 10 pages.', 'You may copy 100 pages.']),
  qa('A thesis may be read only in the reading room. May I take a thesis home for the weekend?', 'No. A thesis may be read only in the reading room.', 'thesis', 3, ['Yes. You may take it home for a weekend.', 'No. A thesis may be taken home only by staff.']),
  qa('Older volumes of journals may be borrowed for one week. I borrowed one on Monday. When must I bring it back?', 'You must bring it back next Monday.', 'journal', 3, ['You must bring it back on Friday.', 'You must bring it back in three weeks.']),
  qa('A book from another library takes about ten days to arrive. I asked for one today. Will it arrive tomorrow?', 'No. It takes about ten days.', 'ill', 3, ['Yes. It arrives the next day.', 'No. It takes about ten weeks.']),
  qa('A reader who loses a book pays the price of the book and $5. I lost a book that cost $10. What must I pay?', 'You must pay $15.', 'lost', 3, ['You must pay $10.', 'You must pay $50.']),
  qa('Visitors must pay a deposit of $20, which is returned when they leave. I paid the deposit. Will I get it back?', 'Yes. It is returned when you leave.', 'deposit', 3, ['No. The deposit is kept by the library.', 'Yes. It is returned after a year.']),
  qa('A group of four or more may use the lecture hall. We are five. May we book the lecture hall?', 'Yes. A group of four or more may use it.', 'room', 3, ['No. A group of five may not use it.', 'Yes. But only a group of ten may use it.']),
  qa('The latest issue of each journal stays in the reading room. May I borrow the latest issue?', 'No. The latest issue stays in the reading room.', 'journal', 3, ['Yes. You may borrow it for one week.', 'No. The latest issue may be borrowed only by staff.']),
];
const QA_MAIL3: QaItem[] = [
  qa('Dear {Ms. Thorne|@}, I need the book on the history of the harbour town for my essay. It is out, and I would like to reserve it.', 'We will reserve the book for you and write to you when it is back.', 'reserve', 3, ['We will reserve the book for you, and you may take it home today.', 'We cannot reserve it, because a book that is out may not be reserved.']),
  qa('Dear Sir, I should like to borrow two books from the library in the capital. I can wait for two weeks.', 'We shall order the two books and write to you when they arrive.', 'ill', 3, ['We cannot order books from other libraries.', 'We shall order the two books, and they will arrive in two days.']),
  qa('Dear Sir, my essay is about the old harbour. Do you have any maps that I may photograph?', 'Please come to the archive, and we shall show you the maps. Photographs need written permission.', 'maps', 3, ['Please come to the archive, and photograph the maps as you wish.', 'Please come to the archive, but there are no maps.']),
  qa('Dear Sir, I lost a book that cost $12. How much must I pay?', 'You must pay $17, which is the price of the book and $5 for the work of the library.', 'lost', 3, ['You must pay $12, which is only the price of the book.', 'You must pay $5, because that is the fee for a lost book.']),
  qa('Dear Sir, thank you for finding the book for my essay. I got a good mark.', 'Thank you for your kind words. We are glad that the book helped you.', 'thanks', 3, ['Thank you for your question. The book is due on Friday.', 'Thank you for your message. A thesis may be read only in the reading room.']),
  qa('Dear Sir, may my group of six use the lecture hall on Wednesday afternoon?', 'Yes. A group of four or more may use the lecture hall, and we shall book it for Wednesday afternoon.', 'room', 3, ['Yes. A group of six may use Study room 1, and we shall book it for Wednesday afternoon.', 'No. A group of four or more may not use the lecture hall.']),
  qa('Dear Sir, I would like to attend the lecture on ancient history. When is it?', 'The lecture on ancient history is on Tuesday at 6:00.', 'lecture', 3, ['The lecture on ancient history is on Thursday at 6:00.', 'The lecture on modern poetry is on Tuesday at 6:00.']),
  qa('Dear Sir, there is a student who talks loudly on the second floor. What can I do?', 'Please tell a member of staff, and we shall ask him to be quiet.', 'complaint', 3, ['Please ask him to leave, and tell the dean.', 'Please be quiet yourself, because the second floor is for talking.']),
];
const QA_ABS3: QaItem[] = [
  qa('Abstract: Using tree rings and old records, the author shows that the climate of the north became colder between 1300 and 1850. She argues that the cold weather caused poor harvests.', 'The author shows that the north became colder, and that this caused poor harvests.', 'science', 3, ['The author shows that the north became hotter, and that this caused rich harvests.', 'The author shows that the north became colder, but that the harvests were not affected.']),
  qa('Abstract: The author compares two groups of students. One group studied with music, and the other studied in silence. The group that studied in silence scored higher on a test of reading.', 'The students who studied in silence scored higher on the reading test.', 'education', 3, ['The students who studied with music scored higher on the reading test.', 'The students who studied in silence scored higher on a test of music.']),
  qa('Abstract: The novel follows a young teacher who moves to a village by the sea. At first the villagers do not like her, but after she saves a boat in a storm, they begin to accept her.', 'A young teacher is not liked at first and is liked after she saves a boat.', 'literature', 3, ['A young teacher is liked at once and is not liked after she saves a boat.', 'A young fisherman is not liked at first and is liked after he saves a boat.']),
  qa('Abstract: A new method for storing electricity in batteries is described. The results show that the batteries lasted longer than the old ones, but they cost twice as much.', 'The new batteries lasted longer than the old ones, but they cost twice as much.', 'technology', 3, ['The new batteries lasted longer than the old ones, and they cost half as much.', 'The new batteries lasted a shorter time than the old ones, but they cost twice as much.']),
  qa('Abstract: The empire grew rich by trade, and its capital stood on a wide river. In 1200 it was weakened by a long drought, and it ended a century later when its cities were left empty.', 'The empire was weakened by a drought in 1200, and it ended about a century later.', 'history', 3, ['The empire was weakened by a war in 1200, and it ended about a year later.', 'The empire grew rich by farming, and it ended in 1200.']),
  qa('Abstract: The painter lived in a small village in the north. She studied in the capital for six years, and her first exhibition was held in 1910.', 'The painter studied in the capital for six years, and her first exhibition was in 1910.', 'arts', 3, ['The painter studied in the capital for sixteen years, and her first exhibition was in 1910.', 'The painter studied in the village for six years, and her first exhibition was in 1901.']),
  qa('Abstract: The composer wrote the symphony in 1890, and it was first played in the capital. Although a few critics did not like it, the audience loved it at once.', 'The audience loved the symphony at once, although a few critics did not like it.', 'arts', 3, ['The audience disliked the symphony at once, although a few critics liked it.', 'The critics loved the symphony at once, although the audience did not like it.']),
  qa('Abstract: The experiment was carried out in 1962 with twenty plants, which were grown in the dark. Most of the plants survived for a month.', 'Most of the plants grown in the dark survived for a month.', 'science', 3, ['All of the plants grown in the dark died within a week.', 'Most of the plants grown in the light survived for a month.']),
];

const T3: TaskTemplate[] = [
  srt('at3_sort1', 3, 'The new books are on the cart. Please read each subject line, and put each book on the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['A study of the climate of the north over six hundred years', 'science'], ['The orbit of a planet and the force that holds it', 'science'], ['The rise and fall of an empire on the river', 'history'], ['The first century of the harbour town and its trade', 'history'],
    ['A novel about a poet who loses her voice', 'literature'], ['Essays on the novels of the last century', 'literature'], ['The paintings and sculptures of the old harbour town', 'arts'], ['A guide to the theater of the last century', 'arts'],
    ['An introduction to the theory of numbers', 'maths'], ['A textbook on geometry with solutions to the exercises', 'maths'], ['How the steam engine changed the factories of the north', 'tech'], ['A study of the first telephone network in the town', 'tech'],
  ]),
  srt('at3_sort2', 3, 'The afternoon cart. Please read each subject line with care.', [4, 4], ['science', 'history', 'literature', 'arts', 'tech'], [
    ['A study of how birds find their way across the ocean', 'science'], ['An experiment on how plants grow in the dark', 'science'], ['The great flood of 1850 and the wall that was built after it', 'history'], ['The diaries of a sailor in the old trade', 'history'],
    ['Letters of a poet to her friends, edited by her daughter', 'literature'], ['A novel about a teacher in a village by the sea', 'literature'], ['A history of music in the harbour churches', 'arts'], ['Light and color in the paintings of the coast', 'arts'],
    ['A new method for storing electricity in batteries', 'tech'], ['The design of a sea wall', 'tech'],
  ]),
  chk('at3_check_cite', 3, 'Is my reference the same as the title page of the journal?', [
    { id: 'author', label: 'Author', values: AUTHORS },
    { id: 'journal', label: 'Journal', values: ['Harbour Science', 'Coastal Studies', 'The Northern Review', 'Old Maps'] },
    { id: 'volume', label: 'Volume', values: ['14', '41', '12', '21', '33', '3'] },
  ], [{ kind: 'note', title: 'Reference', fields: ['author', 'journal', 'volume'] }, { kind: 'label', title: 'Title page', fields: ['author', 'journal', 'volume'] }], ['volume', 'author'], 0.7),
  chk('at3_check_edition', 3, 'Could you check the edition on the card?', [
    { id: 'title', label: 'Title', values: ['A History of the Harbour Town', 'The Poet and the Sea', 'The Plants of the Coast', 'Maths for Scholars'] },
    { id: 'edition', label: 'Edition', values: ['First', 'Second', 'Third', 'Fourth'] },
  ], [{ kind: 'card', title: 'Card', fields: ['title', 'edition'] }, { kind: 'label', title: 'Title page', fields: ['title', 'edition'] }], ['edition'], 0.7),
  chk('at3_check_copy', 3, 'Please check how many pages I may copy from this book.', [
    { id: 'pages', label: 'Pages in the book', range: [100, 400, 50] },
    { id: 'may', label: 'May be copied', calc: 'pages / 10' },
  ], [{ kind: 'note', title: 'Copy slip', fields: ['pages', 'may'] }, { kind: 'note', title: 'Copying', lines: ['Readers may copy up to 10 percent of a book for study.'] }], ['may'], 0.7),
  chk('at3_check_sum', 3, 'This summary was written by a student. Please find the point that does not agree with the passage.', [
    { id: 'year', label: 'First point: year', values: ['1962', '1926'] },
    { id: 'plants', label: 'Second point: plants', values: ['20', '40'] },
    { id: 'result', label: 'Third point: result', values: ['most of the plants lived for a month', 'all of the plants died within a week'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['year', 'plants', 'result'] }, { kind: 'note', title: 'Passage', lines: ['The experiment was carried out in {year} with {plants} plants, which were grown in the dark.', 'In the end, {result}.'] }], ['year', 'plants', 'result'], 0.75),
  chk('at3_check_sum2', 3, 'A student has summarized this passage. Please mark the point that is wrong.', [
    { id: 'rich', label: 'First point: wealth', values: ['trade', 'farming'] },
    { id: 'capital', label: 'Second point: capital', values: ['on a river', 'on the coast'] },
    { id: 'cause', label: 'Third point: cause of the end', values: ['a drought', 'a war'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['rich', 'capital', 'cause'] }, { kind: 'note', title: 'Passage', lines: ['The empire grew rich by {rich}, and its capital stood {capital}.', 'It was weakened by {cause}, and it ended a century later.'] }], ['rich', 'capital', 'cause'], 0.75),
  slt('at3_slot1', 3, 'speech', 'Please book a study room for my group.', DAYS.slice(0, 4), TIMES2, [['tue', 'We can come on Tuesday.'], ['wed', 'We can come on Wednesday.'], ['thu', 'We can come on Thursday.'], ['morning', 'We would like to come in the morning.'], ['afternoon', 'We can come only in the afternoon.']], [['mon', 'We cannot come on Monday.'], ['wed', 'We are away on Wednesday.'], ['t9', 'We cannot come at 9:30.']], READERS),
  slt('at3_slot2', 3, 'speech', 'Please look at the plan and book the room for my group.', ROOMS, ROOMCOLS, [['small', 'We are only four, so a small room is enough.'], ['large', 'We are about twenty, so we need the lecture hall.'], ['computers', 'We need computers.'], ['quiet', 'We need a quiet room.'], ['morning', 'We can come in the morning.'], ['afternoon', 'We can come in the afternoon.']], [['mon', 'We cannot come on Monday.'], ['tue', 'We cannot come on Tuesday.'], ['wed', 'We cannot come on Wednesday.']], READERS, undefined, undefined, 'rooms'),
  frm('at3_pad1', 3, ['Good morning. This is {who}.', 'The {what} that I ordered from the library in the capital has arrived.', 'I shall collect it {when}.'], [
    { id: 'who', label: 'Caller', values: LIB_CALLERS },
    { id: 'what', label: 'What', values: ['article', 'book', 'thesis', 'map', 'brochure', 'photocopy', 'periodical', 'manuscript'] },
    { id: 'when', label: 'Collect', values: ['on Tuesday', 'on Thursday', 'on Friday'] },
  ], 'The telephone is ringing. Listen carefully, please, and write the message.'),
  frm('at3_pad2', 3, ['Hello. This is {who}.', 'The lecture on {topic} is on {day} at {time}.', 'Please tell {person}.'], [
    { id: 'who', label: 'Caller', values: ['{Mr. Osei|@}', '{Professor Hale|@}', '{Mr. Ashby|@}'] },
    { id: 'topic', label: 'Lecture on', values: ['ancient history', 'modern poetry', 'the stars', 'old songs'] },
    { id: 'day', label: 'Day', values: ['Tuesday', 'Wednesday', 'Thursday'] },
    { id: 'time', label: 'Time', values: ['5:00', '6:00', '7:00'] },
    { id: 'person', label: 'Tell', values: ['the head librarian', 'the porter', 'the students'] },
  ], 'Another call. Listen carefully, please, and write the message.'),
  choose('at3_speech', 3, 'speech3', 'speech'),
  choose('at3_phone', 3, 'phone3', 'phone', 'The telephone is ringing. Please listen carefully.'),
  choose('at3_notice', 3, 'notice3', 'memo'),
  choose('at3_mail', 3, 'mail3', 'email', 'An email came for us. Please read it and answer it.'),
  choose('at3_abs', 3, 'abs3', 'memo', 'Please read this abstract and choose the summary that is true.'),
];

// ---------------------------------------------------------------------------- rank 4 banks and templates

const QA_SPEECH4: QaItem[] = [
  qa('I should like to speak to someone about a book that has been missing from the shelf for a month.', 'Certainly. Please give me the title and the call number.', 'request', 4, ['The article may be downloaded, but not shared.', 'The seminar room needs the approval of a member of staff.']),
  qa('I have been waiting for more than an hour, and I have an appointment with {Mr. Ashby|@} at eleven.', 'I apologize for the delay. I will tell him that you are here.', 'complaint', 4, ['Rare books may be read only in the rare books room.', 'An application needs two references.']),
  qa('I am afraid that I have cited my source in the wrong way. What should I do now?', 'Please do not worry. I will show you how to write it.', 'problem', 4, ['The essay fails for a first offense.', 'The fellowship closes on March 1.']),
  qa('Could you possibly explain why my request for a book was refused?', 'Of course. The reasons are given in the letter, and I can go through them with you.', 'explain', 4, ['The thesis may be embargoed for two years.', 'Readers may have three items at a time.']),
  qa('I should like to give the library a collection of old maps. To whom should I speak?', 'Thank you. You may speak to {Ms. Thorne|@}, who will tell you whether the library can accept them.', 'donation', 4, ['A late book costs twenty cents a day.', 'The latest issue stays in the reading room.']),
  qa('I came on the wrong day, I am afraid. Is there anybody who could help me now?', 'Let me see. I will ask a colleague whether he can spare a few minutes.', 'help', 4, ['No photographs may be taken without permission.', 'Visitors may use only the library computers.']),
  qa('Would you be kind enough to tell me when the new catalog will be ready?', 'It will be ready next month, and we shall write to all readers the same week.', 'date', 4, ['The library buys a book only if the price is under eighty dollars.', 'The case is reported to the dean.']),
  qa('Thank you so much. I do not know what I would have done without your help.', 'It was a pleasure. Please do not hesitate to come back if you have any more questions.', 'thanks', 4, ['A group of eight or more may use the seminar room.', 'The seminar needs approval three days in advance.']),
];
const QA_PHONE4: QaItem[] = [
  qa('Good afternoon. This is {Professor Hale|@}. I should like to see the harbour records on Friday. Could you tell me whether that is possible?', 'You must make an appointment at least 48 hours in advance, so please come on Monday.', 'special', 4, ['You must make an appointment at least 4 hours in advance, so please come on Monday.', 'You need no appointment, and you may come on Friday.']),
  qa('Hello, this is {Ken|@}. I would like to know whether the library has accepted my suggestion for a book. My number is 4 5 8 2.', 'We will check, and {Ms. Reyes|@} will call you back on 4 5 8 2.', 'status', 4, ['We will check, and {Ms. Reyes|@} will call you back on 4 5 2 8.', 'We will check, and {Ms. Reyes|@} will call you back on 4 8 5 2.']),
  qa('Hello. My thesis is under embargo, and a reader wants to see it. May he?', 'Only with your written permission, so please send it to us by post or by email.', 'closing', 4, ['Yes, any reader may see it after a year.', 'Only with the permission of the dean, which he must give by telephone.']),
  qa('Could you tell {Ms. Thorne|@} that I cannot come to the seminar on Thursday, but that I can come on Friday at ten?', 'Yes, I will tell her that you cannot come on Thursday, but that you can come on Friday at ten.', 'message', 4, ['Yes, I will tell her that you cannot come on Friday, but that you can come on Thursday at ten.', 'Yes, I will tell her that you cannot come on Thursday, but that you can come on Friday at two.']),
  qa('Hello. I am a visitor, and I want to read an article from home. Is that possible?', 'I am afraid not. Visitors may read the journals only on the computers in the library.', 'digital', 4, ['Yes, with your card number you may read it from home.', 'I am afraid not. Visitors may not read the journals at all.']),
  qa('Hello. I should like to apply for a fellowship. What do I have to send?', 'You must send a plan of your research and two references, and they must reach us by March 1.', 'fellowship', 4, ['You must send a plan of your research and two references, and they must reach us by March 11.', 'You must send a plan of your research and one reference, and they must reach us by March 1.']),
  qa('Hello. This is {Nora|@}. I borrowed a book on cooking, and it was damaged by my son. What shall I do?', 'Please bring it back, and we shall tell you the cost of the repair.', 'damage', 4, ['Please throw it away, and we shall send you a new one.', 'Please keep it, and we shall tell you the cost of the repair.']),
  qa('Hello, I am calling about the seminar room. We are ten students, and we need it on Wednesday.', 'A member of staff must approve the booking, and it must be made three days in advance.', 'seminar', 4, ['A member of staff must approve the booking, and it must be made thirty days in advance.', 'No approval is needed, and the booking may be made on the day.']),
];
const QA_NOTICE4: QaItem[] = [
  qa('Rare books may be read only in the rare books room, by appointment made 48 hours in advance. May I read a rare book in the reading room?', 'No. Rare books may be read only in the rare books room.', 'special', 4, ['Yes. Rare books may be read anywhere.', 'No. Rare books may not be read at all.']),
  qa('Readers may have three items at a time in the rare books room. I have asked for four maps. May I see all four?', 'No. Readers may have only three items at a time.', 'special', 4, ['Yes. Readers may have as many as they wish.', 'No. Readers may have only four items in a day.']),
  qa('For a first offense of plagiarism, the essay fails; for a second, the case is reported to the dean. This is my second offense. What will happen?', 'The case will be reported to the dean.', 'copying', 4, ['The essay will fail, and nothing more will happen.', 'Nothing will happen, because a second offense is ignored.']),
  qa('A thesis may be embargoed for up to two years. The author asked for an embargo of three years. Will it be granted?', 'No. An embargo may last up to two years.', 'closing', 4, ['Yes. An embargo may last any time.', 'No. An embargo may last only one month.']),
  qa('The library buys a suggested book if two members of staff approve and the price is under $80. One member approved, and the price is $60. Will the library buy it?', 'No. Two members of staff must approve.', 'buy', 4, ['Yes. The price is under $80.', 'No. The price must be under $6.']),
  qa('A group of eight or more may use the seminar room, with approval. We are six. May we use the seminar room?', 'No. A group of eight or more may use it.', 'room', 4, ['Yes. A group of six may use it.', 'No. Only a group of sixty may use it.']),
  qa('Members of the academy may read the journals from home with their card number. I am a member. May I read an article at home?', 'Yes. Members may read the journals from home with their card number.', 'digital', 4, ['No. Members may read the journals only in the library.', 'Yes. But only on the library computers.']),
  qa('Applications for a fellowship must be made by March 1. I sent my application on March 5. Is it in time?', 'No. Applications must be made by March 1.', 'fellowship', 4, ['Yes. Applications may be made until March 31.', 'No. Applications must be made by March 15.']),
];
const QA_MAIL4: QaItem[] = [
  qa('Dear {Ms. Thorne|@}, I should like to read the harbour records on Friday, and I should like to photograph two pages. I have not made an appointment.', 'You must make an appointment 48 hours in advance, and you must ask for written permission to photograph the pages.', 'special', 4, ['You may come on Friday without an appointment, and you may photograph the pages.', 'You must make an appointment 48 hours in advance, but you may photograph the pages without permission.']),
  qa('Dear Sir, I should like the library to buy a book that costs $60, and a colleague also supports my suggestion.', 'Thank you. The library buys a book if two members of staff approve and the price is under $80, so we shall ask two members of staff.', 'buy', 4, ['Thank you. The library buys only books that cost more than $80.', 'Thank you. The library will buy the book at once, without asking anybody.']),
  qa('Dear Sir, my thesis will be finished in June, but I plan to publish part of it in a journal. Can the library keep it from other readers for a while?', 'Yes. You may ask for your thesis to be embargoed for up to two years.', 'closing', 4, ['Yes. You may ask for your thesis to be embargoed for up to ten years.', 'No. A thesis must be open to all readers at once.']),
  qa('Dear Sir, I am applying for a fellowship, and I would be grateful if you would write one of my two references.', 'I shall be glad to write a reference, and I shall send it before March 1.', 'fellowship', 4, ['I shall be glad to write a reference, and I shall send it after March 1.', 'I cannot write a reference, because only professors may write references.']),
  qa('Dear Sir, I downloaded an article and sent it to my friends. Did I break a rule?', 'Yes. An article may be downloaded, but it may not be shared with other people.', 'digital', 4, ['No. An article may be shared with anybody.', 'Yes. An article may not be downloaded at all.']),
  qa('Dear Sir, my essay was marked as plagiarism, but I think there was a mistake in my citation. May I see the dean?', 'Yes. Please make an appointment, and bring your essay and your sources.', 'copying', 4, ['No. The dean does not see students.', 'Yes. Please make an appointment, and bring nothing.']),
  qa('Dear Sir, thank you for the room and for the records, which the students found very useful.', 'Thank you for your kind message. We are glad that the seminar was a success.', 'thanks', 4, ['Thank you for your question. Rare books may be read only in the rare books room.', 'Thank you for your message. The room must be booked three days in advance.']),
  qa('Dear Sir, I should like to give the library a collection of old maps of the harbour.', 'Thank you. We should be glad to see them, and {Mr. Ashby|@} will tell you whether we can accept them.', 'donation', 4, ['Thank you. We cannot accept any gifts.', 'Thank you. We accept every gift, and {Mr. Ashby|@} will tell you where to put them.']),
];
const QA_ABS4: QaItem[] = [
  qa('Abstract: Drawing on records of 2,000 families, the author shows that children who grew up near the harbour were taller than children who grew up inland. She argues that the difference was caused not by wealth but by the fish in their diet.', 'The harbour children were taller because of the fish in their diet, not because of wealth.', 'science', 4, ['The harbour children were taller because of their wealth, not because of fish.', 'All children who ate fish were taller than children who did not, in every country.']),
  qa('Abstract: The author studied the diaries of fifty sailors. The diaries show that sailors wrote mostly about the weather, but the author does not conclude that they disliked their work.', 'The sailors wrote mostly about the weather, and the author does not say that they disliked their work.', 'history', 4, ['The sailors wrote mostly about their work, and the author says that they disliked it.', 'The sailors wrote mostly about the weather, and the author concludes that they disliked their work.']),
  qa('Abstract: A study of 300 readers found that those who used the reading room every week had higher marks than those who used it only before examinations. The author warns that the study does not prove that the reading room caused the higher marks.', 'The weekly readers had higher marks, but the study does not prove that the room caused it.', 'education', 4, ['The weekly readers had higher marks, and the study proves that the room caused it.', 'The readers who came before examinations had higher marks than the weekly readers.']),
  qa('Abstract: The author interviewed twenty teachers in the harbour schools. Most of them said that they used the library every week, and several said that it helped their lessons.', 'Most of the teachers used the library every week, and several said that it helped their lessons.', 'education', 4, ['All of the teachers used the library every week, and all said that it helped their lessons.', 'Most of the teachers never used the library, but several said that it helped their lessons.']),
  qa('Abstract: This paper examines the effects of the railway on the harbour town after 1880. Contrary to the usual view, it finds that the fishing fleet grew rather than became smaller.', 'The paper finds that the fishing fleet grew after the railway came, contrary to the usual view.', 'history', 4, ['The paper finds that the fishing fleet became smaller after the railway came, as in the usual view.', 'The paper finds that the railway grew rather than the fishing fleet.']),
  qa('Abstract: The poet is known for her songs of the sea, but this essay argues that her letters show a fear of the water that she never mentioned in her poems.', 'The essay argues that the poet\'s letters show a fear of the water that her poems never mention.', 'literature', 4, ['The essay argues that the poet\'s poems show a fear of the water that her letters never mention.', 'The essay argues that the poet loved the water, as her letters and poems both show.']),
  qa('Abstract: A new type of crane for lifting heavy boxes at the harbour is described. Tests show that it lifts twice as much as the old type, but it uses three times as much electricity.', 'The new crane lifts twice as much as the old type, but it uses three times as much electricity.', 'technology', 4, ['The new crane lifts three times as much as the old type, but it uses twice as much electricity.', 'The new crane lifts twice as much as the old type, and it uses less electricity.']),
  qa('Abstract: The painters of the harbour school left the capital in 1880 because rents were high there. They hoped to find cheaper homes and better light on the coast.', 'The painters left the capital because rents were high, hoping to find cheaper homes and better light.', 'arts', 4, ['The painters left the coast because rents were high, hoping to find cheaper homes in the capital.', 'The painters left the capital because the light was poor, hoping to find higher rents.']),
];

const T4: TaskTemplate[] = [
  srt('at4_sort1', 4, 'The cart is full of new acquisitions. Please read each subject line, and send each book to the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'tech', 'maths'], [
    ['A study of how tides shape the life of the shore', 'science'], ['The effects of warming on the fish of the northern coast', 'science'], ['The archives of a trading company and the people who kept them', 'history'], ['The voyages of the first ships that left the harbour', 'history'],
    ['A critical edition of the letters of a poet', 'literature'], ['The novels of an author who wrote under a false name', 'literature'], ['The painters who left the capital for the coast', 'arts'], ['A catalog of an exhibition of old maps and drawings', 'arts'],
    ['The design of the first harbour crane', 'tech'], ['The history of the telegraph and the cables under the sea', 'tech'], ['A proof that corrects an error in an older theory of numbers', 'maths'], ['A textbook on the geometry of curves', 'maths'],
  ]),
  srt('at4_sort2', 4, 'Another cart. Please read each paper with care.', [4, 5], ['science', 'history', 'literature', 'arts', 'tech'], [
    ['How a changing climate may affect the birds of the north', 'science'], ['A model of the ocean currents near the coast', 'science'], ['The trade in salt and the rise of three small ports', 'history'], ['A study of the harbour council in the nineteenth century', 'history'],
    ['A study of the poems that the sailors sang at work', 'literature'], ['An essay on the novel and the village school', 'literature'], ['The theater of the harbour town between the wars', 'arts'], ['The sculptures that stand along the sea wall', 'arts'],
    ['Cranes, cables and the machines of the old docks', 'tech'], ['A new design for a boat that uses less fuel', 'tech'],
  ]),
  chk('at4_check_cite', 4, 'Please check my citation against the first page of the journal.', [
    { id: 'author', label: 'Author', values: AUTHORS },
    { id: 'journal', label: 'Journal', values: ['Coastal Studies', 'Harbour Science', 'The Northern Review'] },
    { id: 'issue', label: 'Issue', range: [1, 4] },
    { id: 'year', label: 'Year', values: ['2008', '2009', '2011', '1998'] },
  ], [{ kind: 'note', title: 'Citation', fields: ['author', 'journal', 'issue', 'year'] }, { kind: 'label', title: 'Title page', fields: ['author', 'journal', 'issue', 'year'] }], ['issue', 'year', 'author'], 0.7),
  chk('at4_check_card', 4, 'This record in the catalog should agree with the title page. Please check it.', [
    { id: 'title', label: 'Title', values: ['The Tides of the Shore', 'The Voyages of the Harbour Ships', 'Letters of a Poet', 'The Harbour School'] },
    { id: 'call', label: 'Call number', values: ['{HIS|@} 442', '{HIS|@} 424', '{SCI|@} 118', '{SCI|@} 181', '{LIT|@} 305', '{LIT|@} 350'] },
  ], [{ kind: 'card', title: 'Record', fields: ['title', 'call'] }, { kind: 'label', title: 'Spine of the book', fields: ['title', 'call'] }], ['call'], 0.7),
  chk('at4_check_loan', 4, 'Please check that the dates on my loan slip agree with the rule.', [
    { id: 'day', label: 'Borrowed', range: [3, 25], names: Array.from({ length: 26 }, (_, i) => (i ? `May ${i}` : '')) },
    { id: 'due', label: 'Due', calc: 'day + 21', names: Array.from({ length: 60 }, (_, i) => (i <= 31 ? `May ${i}` : `June ${i - 31}`)) },
  ], [{ kind: 'card', title: 'Loan slip', fields: ['day', 'due'] }, { kind: 'note', title: 'Loans', lines: ['You can keep a book for three weeks.'] }], ['due'], 0.7),
  chk('at4_check_sum', 4, 'A summary of this passage has been written for the catalog. Please find the point that distorts the passage.', [
    { id: 'villages', label: 'First point: villages', values: ['40', '14'] },
    { id: 'library', label: 'Second point: libraries', values: ['only twelve had a library', 'most of them had a library'] },
    { id: 'sundays', label: 'Third point: Sundays', values: ['most of the libraries were open on Sundays', 'none of the libraries was open on Sundays'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['villages', 'library', 'sundays'] }, { kind: 'note', title: 'Passage', lines: ['The survey covered {villages} villages along the coast.', 'In the end, {library}, and {sundays}.'] }], ['villages', 'library', 'sundays'], 0.75),
  chk('at4_check_sum2', 4, 'This summary contains a claim that the abstract does not make. Please mark it.', [
    { id: 'sailors', label: 'First point: sailors', values: ['fifty', 'five hundred'] },
    { id: 'topic', label: 'Second point: topic', values: ['the weather', 'their work'] },
    { id: 'claim', label: 'Third point: conclusion', values: ['does not conclude that they disliked their work', 'concludes that they disliked their work'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['sailors', 'topic', 'claim'] }, { kind: 'note', title: 'Abstract', lines: ['The author studied the diaries of {sailors} sailors, who wrote mostly about {topic}.', 'The author {claim}.'] }], ['sailors', 'topic', 'claim'], 0.75),
  slt('at4_slot1', 4, 'speech', 'Please book a time for me.', DAYS.slice(0, 4), TIMES2, [['tue', 'I can come on Tuesday.'], ['wed', 'I can come on Wednesday.'], ['thu', 'I can come on Thursday.'], ['morning', 'I can come only in the morning.'], ['afternoon', 'I can come only in the afternoon.']], [['mon', 'I cannot come on Monday.'], ['thu', 'I cannot come on Thursday.'], ['t9', 'I cannot come at 9:30.'], ['t3', 'I cannot come at three.']], READERS),
  slt('at4_slot2', 4, 'email', 'A request for a seminar has arrived. Please look at the plan and choose the room and the time.', ROOMS, ROOMCOLS, [['large', 'We shall be about twenty people, so we need the lecture hall.'], ['small', 'We shall be only five people, so a small room is enough.'], ['quiet', 'We need a quiet room.'], ['afternoon', 'We can come in the afternoon.'], ['morning', 'We can come only in the morning.']], [['mon', 'We cannot come on Monday.'], ['tue', 'We cannot come on Tuesday.']], READERS, ['Dear {Ms. Thorne|@},', 'We would like to book a room for a seminar.'], ['Yours sincerely, {Mr. Osei|@}'], 'rooms'),
  frm('at4_pad1', 4, ['Good afternoon. This is {who}.', 'The seminar on {topic} will be held in {room} on {day} at {time}.', 'Please put {items} on the cart before ten.'], [
    { id: 'who', label: 'Caller', values: ['{Mr. Osei|@}', '{Professor Hale|@}', '{Mr. Ashby|@}'] },
    { id: 'topic', label: 'Seminar on', values: ['the harbour records', 'the harbour tides', 'the old maps'] },
    { id: 'room', label: 'Room', values: ['Room 1', 'Room 2', 'the lecture hall'] },
    { id: 'day', label: 'Day', values: ['Tuesday', 'Wednesday', 'Thursday'] },
    { id: 'time', label: 'Time', values: ['9:30', '11:00', '1:30'] },
    { id: 'items', label: 'On the cart', values: ['the records of 1850', 'the maps of 1850', 'the diaries of the sailors'] },
  ], 'The telephone is ringing. Please listen carefully and write the message.'),
  frm('at4_pad2', 4, ['Hello, this is {who}.', 'My {what} has a bad mark, but I think there was a mistake in my citation.', 'May I come and see {person} on {day}?'], [
    { id: 'who', label: 'Caller', values: LIB_CALLERS },
    { id: 'what', label: 'My', values: ['essay', 'thesis', 'paper'] },
    { id: 'person', label: 'See', values: ['{Ms. Thorne|@}', 'the head librarian', 'the catalog clerk'] },
    { id: 'day', label: 'On', values: ['Monday', 'Tuesday', 'Friday'] },
  ], 'One more call. Please listen carefully and write the message.'),
  choose('at4_speech', 4, 'speech4', 'speech'),
  choose('at4_phone', 4, 'phone4', 'phone', 'The telephone is ringing. Please listen carefully.'),
  choose('at4_notice', 4, 'notice4', 'memo'),
  choose('at4_mail', 4, 'mail4', 'email', 'An email came for us. Please read it carefully and choose the reply.'),
  choose('at4_abs', 4, 'abs4', 'memo', 'Please read this abstract and choose the summary that is true.'),
];

// ---------------------------------------------------------------------------- rank 5 banks and templates

const QA_SPEECH5: QaItem[] = [
  qa('I should like to lodge a formal complaint about the way in which my request for permission to reproduce a picture was handled.', 'I am sorry to hear that. You may put your complaint in writing, and it will be investigated.', 'complaint', 5, ['A work whose author died before 1950 is in the public domain.', 'Member libraries lend books to each other for four weeks.']),
  qa('I wonder whether it would be possible to see the damaged records, since I have travelled a long way.', 'I am afraid that only the conservators may touch them, but you may consult photographs.', 'flood', 5, ['An article is accepted if two of the three reviewers agree.', 'Registration closes on April 15.']),
  qa('I hope that you will forgive my coming without an appointment, but the matter is rather urgent.', 'Not at all. Please take a seat, and I shall see whether someone is free.', 'urgent', 5, ['An embargo may be extended once, by up to two years.', 'The editors decide within eight weeks.']),
  qa('I am not sure that I understand the condition in the second paragraph of the agreement.', 'Let me read it with you, and I shall explain what it requires.', 'explain', 5, ['The library may sell duplicates and use the money to buy books.', 'Each paper lasts twenty minutes.']),
  qa('Would you be able to tell me whether my article has been accepted by the reviewers?', 'I shall check the file, and I shall tell you before you leave.', 'status', 5, ['A thesis is excluded from the agreement.', 'The conference is held on May 12 and 13.']),
  qa('I have come to collect the book that was promised for today, but I understand that there is a problem.', 'There is a small problem with one slip, but we shall put it right today.', 'problem', 5, ['The fee is forty dollars, or half for students.', 'The author died before 1950.']),
  qa('May I take it that the book will not be sold until the donor has been told?', 'I am afraid that I cannot say. Please ask the head librarian, who decides such matters.', 'gift', 5, ['The library that borrows pays the cost of the post.', 'Papers last twenty minutes.']),
  qa('I am grateful for all that you have done, and I shall certainly recommend this library to my colleagues.', 'That is very kind of you. We are always glad to help.', 'thanks', 5, ['The program has been changed.', 'Reviewers recommend publication.']),
];
const QA_PHONE5: QaItem[] = [
  qa('Hello, this is {Professor Hale|@}. I would like to reproduce a map from a book by an author who died in 1948. Do I need permission?', 'No. His work is in the public domain, because he died before 1950.', 'copyright', 5, ['Yes. You need the written permission of the copyright holder for any picture.', 'No. Copyright lasts only 20 years after the death of the author.']),
  qa('Good afternoon. This is {Ken|@}. Two of the three reviewers of my article recommend publication. Will it be accepted?', 'Yes. An article is accepted if at least two of the three reviewers recommend publication.', 'review', 5, ['No. An article is accepted only if all three reviewers recommend publication.', 'Yes. But the author must reply twice to the reviewers.']),
  qa('Hello. I should like to borrow a thesis from the library of the capital. Is that possible?', 'I am afraid not. Theses are excluded from the lending agreement.', 'network', 5, ['Yes. Member libraries lend theses for four weeks.', 'I am afraid not. Only rare books are excluded from the agreement.']),
  qa('This is {Nora|@}. My thesis was embargoed for two years, and I should like to extend the embargo because of a family illness.', 'I am afraid not. An extension is granted only if a publisher asks for it in writing.', 'closing', 5, ['Yes. An embargo may be extended for any reason.', 'I am afraid not. An embargo may never be extended.']),
  qa('Hello. I am a student, and I want to register for the conference on April 20. How much do I pay?', 'I am afraid that registration closed on April 15, so you cannot register.', 'conference', 5, ['You pay $20, which is half the fee for students.', 'You pay $40, because the fee is the same for students.']),
  qa('Hello. My paper is 25 minutes long, with 10 minutes for questions. Is that acceptable at the conference?', 'No. A paper may last only 20 minutes, followed by 10 minutes for questions.', 'conference', 5, ['Yes. A paper may last up to 30 minutes.', 'No. A paper may last only 20 minutes, with no time for questions.']),
  qa('Good morning. The library of the capital will send me a book. Who pays for the post?', 'The library that borrows pays the cost of the post, so your library pays.', 'network', 5, ['The library that lends pays the cost of the post.', 'The reader pays the cost of the post.']),
  qa('Please tell {Mr. Osei|@} that I shall give my paper on Wednesday, May 13, at 11:00.', 'Yes, I will tell him that you will give your paper on Wednesday, May 13, at 11:00.', 'message', 5, ['Yes, I will tell him that you will give your paper on Friday, May 13, at 11:00.', 'Yes, I will tell him that you will give your paper on Wednesday, May 13, at 1:00.']),
];
const QA_NOTICE5: QaItem[] = [
  qa('Copyright lasts for the life of the author and 70 years after his death. The author died in 1960. Is the work still protected in 2020?', 'Yes. 1960 plus 70 years is 2030, so it is still protected.', 'copyright', 5, ['No. 1960 plus 70 years is 2020, so it is free.', 'No. Copyright ends at the death of the author.']),
  qa('The library that borrows pays the cost of the post. Our library borrowed a book from the capital. Who pays for the post?', 'Our library pays for the post.', 'network', 5, ['The library of the capital pays for the post.', 'The reader pays for the post.']),
  qa('An article is accepted if at least two of the three reviewers recommend publication. One reviewer recommends it, and two do not. Is the article accepted?', 'No. At least two reviewers must recommend publication.', 'review', 5, ['Yes. One reviewer is enough.', 'No. All three reviewers must recommend publication.']),
  qa('An embargo may be extended once, by up to two years, if a publisher asks in writing. An embargo has already been extended once. May it be extended again?', 'No. An embargo may be extended only once.', 'closing', 5, ['Yes. An embargo may be extended again and again.', 'No. An embargo may never be extended.']),
  qa('Documents damaged by water must not be handled by readers, and only conservators may touch them. May a careful reader touch a damaged document?', 'No. Only the conservators may touch it.', 'flood', 5, ['Yes. A careful reader may touch it.', 'No. Only the head librarian may touch it.']),
  qa('The library accepts books in good condition that are relevant to its collections. A box of cooking books in good condition is offered. Will the library accept them?', 'No. They are not relevant to the collections.', 'gift', 5, ['Yes. Any book in good condition is accepted.', 'No. They are not in good condition.']),
  qa('Papers at the conference last 20 minutes, followed by 10 minutes for questions. How long is a session for one paper?', 'It is 30 minutes in all.', 'conference', 5, ['It is 20 minutes in all.', 'It is 10 minutes in all.']),
  qa('A work whose author died before 1950 is in the public domain. The author died in 1949. May I reproduce the work freely?', 'Yes. The author died before 1950.', 'copyright', 5, ['No. The author died after 1950.', 'No. Every work needs written permission.']),
];
const QA_MAIL5: QaItem[] = [
  qa('Dear {Ms. Thorne|@}, I should like to reproduce a map from a book by an author who died in 1948. Do I need permission?', 'No. His work is in the public domain, because he died before 1950.', 'copyright', 5, ['Yes. You need the written permission of the copyright holder for any picture.', 'No. Copyright lasts only 20 years after the death of the author.']),
  qa('Dear Sir, I should like to borrow a thesis from the library of the capital, which is a member of the Harbour Network. May I?', 'No. Theses are excluded from the agreement of the network.', 'network', 5, ['Yes. Member libraries lend theses for four weeks.', 'No. Only the library that borrows may read theses.']),
  qa('Dear Sir, my thesis was embargoed for two years, and my supervisor would like to extend the embargo because of an illness in the family.', 'We are sorry, but an extension is granted only if a publisher asks for it in writing.', 'closing', 5, ['We shall extend the embargo for any reason that you give.', 'We are sorry, but an embargo may never be extended.']),
  qa('Dear Sir, the editors have told me that two reviewers recommend publication, and the third wants major changes. How long will the decision take?', 'You may reply once to the reviewers, and the editors decide within eight weeks.', 'review', 5, ['You may reply as often as you wish, and the editors decide within eight weeks.', 'You may reply once to the reviewers, and the editors decide within eighteen weeks.']),
  qa('Dear Sir, a reader has asked to look at the damaged records of 1850 for a short time, since he travelled a long way. Can we offer him anything?', 'Please tell him that we cannot show him the originals, but that he may consult photographs of them.', 'flood', 5, ['Please let him look at the originals for a short time, since he travelled a long way.', 'Please tell him that no photographs of the records exist.']),
  qa('Dear {Ms. Thorne|@}, my late husband left over three hundred books. Some are damp, and a few are duplicates. Would you consider accepting them?', 'We should be glad to see the books, but we can accept only those in good condition, and we may sell the duplicates.', 'gift', 5, ['We shall accept every book, including the damp ones, and we shall keep all the duplicates.', 'We cannot accept any gift of books, because the library has no room.']),
  qa('Dear Sir, the conference was a great success, and several visitors asked whether the papers would be published.', 'We are glad that the conference was a success, and we shall gladly keep a copy of each paper in the archive, provided that the contributors agree.', 'conference', 5, ['We are glad that the conference was a success, and we shall keep a copy of each paper, even if the contributors object.', 'We are sorry, but the archive accepts only rare books.']),
  qa('Dear {Ms. Thorne|@}, I came to your library every week for forty years, and I should like to thank you and your staff.', 'Thank you for your kind words. We are always glad to see you, and we shall keep a chair for you in the reading room.', 'thanks', 5, ['Thank you for your question. A thesis may be read only in the reading room.', 'Thank you for your letter. The library will close next month.']),
];
const QA_ABS5: QaItem[] = [
  qa('Abstract: Contrary to the common view, the harbour town did not decline after the railway was built in 1880. On the evidence of tax records, the author argues that trade shifted from the sea to the land, and that the town grew richer until 1914.', 'The author argues that the town did not decline, because trade shifted from the sea to the land.', 'history', 5, ['The author argues that the town declined, because trade shifted from the land to the sea.', 'The author argues that the town did not decline, but he says that it grew poorer after 1880.']),
  qa('Abstract: Earlier scholars blamed the decline of the fisheries on overfishing, but the author finds that the decline began before the fleet grew. He suggests that the temperature of the sea may have been the main cause.', 'The author suggests that the temperature of the sea, not overfishing, may have been the main cause.', 'science', 5, ['The author proves that overfishing was the main cause, because the fleet grew before the decline.', 'The author suggests that the temperature of the sea was the only cause of the decline.']),
  qa('Abstract: The author compares the poems of two sailors who lived a century apart. He finds that both wrote mainly about the sea, but he rejects the view that the later poet imitated the earlier one.', 'The author rejects the view that the later sailor imitated the earlier one.', 'literature', 5, ['The author concludes that the later sailor imitated the earlier one.', 'The author concludes that the earlier sailor imitated the later one.']),
  qa('Abstract: The author asks why the library of the academy was built in 1895, when the town already had a public library. He argues that the academy wished to keep its books apart from the public, from a fear of the new schools rather than a lack of space.', 'The author argues that the academy built its library to keep its books apart from the public, from fear of the new schools.', 'history', 5, ['The author argues that the academy built its library because the public library had no space.', 'The author argues that the academy opened its library to the public, from fear of the new schools.']),
  qa('Abstract: Most studies of reading in schools assume that children read more when books are cheap. The author, who surveyed 40 schools in the north, finds no such effect, and he concludes that access to a quiet place to read matters more than the price of the books.', 'The author finds no effect of cheap books, and concludes that a quiet place to read matters more.', 'education', 5, ['The author finds that cheap books make children read more, and concludes that quiet places do not matter.', 'The author finds no effect of cheap books, and concludes that the price of the books matters more than quiet places.']),
  qa('Abstract: The paper studies the school at the harbour between 1870 and 1900. It shows that the number of pupils doubled, and it suggests that the school was among the better ones in the region, although the evidence is limited.', 'The paper shows that the number of pupils doubled, and suggests that the school was among the better ones, though the evidence is limited.', 'education', 5, ['The paper shows that the number of pupils doubled, and proves that the school was the best in the country.', 'The paper shows that the number of pupils became half, and suggests that the school was among the better ones.']),
  qa('Abstract: The author examined 120 letters written by sailors between 1890 and 1900. Most of them mention the high price of food, and a few hint at a strike, but the evidence is not conclusive.', 'Most of the letters mention the price of food, and a few hint at a strike, though the evidence is not conclusive.', 'history', 5, ['The letters prove that the sailors went on strike in 1890.', 'Most of the letters hint at a strike, and a few mention the price of food.']),
  qa('Abstract: A model of the tides is presented that explains why the harbour silts up. The model predicts that the problem will worsen if the sea wall is lengthened, but it will improve if the channel is made deeper.', 'The model predicts that a longer wall will worsen the problem, and that a deeper channel will improve it.', 'science', 5, ['The model predicts that a longer wall will improve the problem, and that a deeper channel will worsen it.', 'The model predicts that neither a longer wall nor a deeper channel will have any effect.']),
];

const T5: TaskTemplate[] = [
  srt('at5_sort1', 5, 'A great box of papers has arrived for the conference. Please read each abstract, and send each paper to the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'tech', 'maths'], [
    ['A model of the tides that explains why the harbour silts up', 'science'], ['An experiment on the sound that a harbour makes during a storm', 'science'], ['Tax records and the rise of the town between 1880 and 1914', 'history'], ['The diaries of a harbour master and the politics of a small port', 'history'],
    ['Dialect and identity in the songs of the sailors', 'literature'], ['A monograph on a forgotten poet who wrote novels under a pseudonym', 'literature'], ['Light and color in the paintings of the harbour school', 'arts'], ['The sculptor of the harbour statues and the memory of the flood', 'arts'],
    ['The design of a sea wall that can withstand a storm of the kind seen in 1850', 'tech'], ['A comparison of two cranes under a heavy load', 'tech'], ['A proof that a conjecture of the last century holds for all large numbers', 'maths'], ['A new method of estimating the area of curved shapes', 'maths'],
  ]),
  srt('at5_sort2', 5, 'The conference papers again. Please read each abstract with care.', [4, 5], ['science', 'history', 'literature', 'arts', 'tech'], [
    ['Temperature, plankton and the decline of the northern fisheries', 'science'], ['Whether the railway or the war ended the age of sail in the harbour town', 'history'], ['The letters of an exile and the novels that he never published', 'literature'], ['Memory and the monument: a study of the harbour statues', 'arts'],
    ['Batteries, cables and the power of the old harbour crane', 'tech'], ['How the moon and the wind combine to raise the tides', 'science'], ['The council minutes of 1850 and the response to the flood', 'history'], ['A comparison of two poems on the same shipwreck', 'literature'],
  ]),
  chk('at5_check_cite', 5, 'Please check that my citation agrees with the program of the conference.', [
    { id: 'author', label: 'Author', values: AUTHORS },
    { id: 'presented', label: 'Presented on', values: ['May 12', 'May 13'] },
    { id: 'length', label: 'Length', values: ['20 minutes', '30 minutes', '25 minutes'] },
  ], [{ kind: 'note', title: 'Citation', fields: ['author', 'presented', 'length'] }, { kind: 'note', title: 'Program', fields: ['author', 'presented', 'length'] }], ['presented', 'length'], 0.7),
  chk('at5_check_card', 5, 'This record of the catalog should agree with the title page. Please check the number of volumes.', [
    { id: 'title', label: 'Title', values: ['A History of the Harbour Fleet', 'The Complete Letters of a Poet', 'The Harbour Council, 1800 to 1900'] },
    { id: 'volumes', label: 'Volumes', range: [2, 6] },
  ], [{ kind: 'card', title: 'Record', fields: ['title', 'volumes'] }, { kind: 'label', title: 'Title page', fields: ['title', 'volumes'] }], ['volumes'], 0.7),
  chk('at5_check_pub', 5, 'Please check that the year of publication in my citation is the same as on the title page.', [
    { id: 'title', label: 'Title', values: ['Light and Color', 'Tax Records of the Harbour', 'The Letters of an Exile'] },
    { id: 'year', label: 'Published', values: ['1992', '1929', '1939', '1993', '2004', '1949'] },
  ], [{ kind: 'note', title: 'Citation', fields: ['title', 'year'] }, { kind: 'label', title: 'Title page', fields: ['title', 'year'] }], ['year'], 0.7),
  chk('at5_check_sum', 5, 'A summary of this abstract was written for the program. Please mark the sentence that overstates it.', [
    { id: 'letters', label: 'First point: letters', values: ['120', '12'] },
    { id: 'food', label: 'Second point: food', values: ['most of them mention the price of food', 'none of them mentions the price of food'] },
    { id: 'strike', label: 'Third point: strike', values: ['a few hint at a strike, but this is not certain', 'they prove that the sailors went on strike'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['letters', 'food', 'strike'] }, { kind: 'note', title: 'Abstract', lines: ['The author examined {letters} letters written by sailors.', 'In the end, {food}, and {strike}.'] }], ['letters', 'food', 'strike'], 0.75),
  chk('at5_check_sum2', 5, 'This summary is meant to be faithful to the abstract. Please mark the sentence that is not.', [
    { id: 'poets', label: 'First point: poets', values: ['two sailors', 'three sailors'] },
    { id: 'theme', label: 'Second point: theme', values: ['the sea', 'the weather'] },
    { id: 'view', label: 'Third point: conclusion', values: ['rejects the view that the later poet imitated the earlier one', 'concludes that the later poet imitated the earlier one'] },
  ], [{ kind: 'note', title: 'Summary', fields: ['poets', 'theme', 'view'] }, { kind: 'note', title: 'Abstract', lines: ['The author compares the poems of {poets}, who wrote mainly about {theme}.', 'He {view}.'] }], ['poets', 'theme', 'view'], 0.75),
  slt('at5_slot1', 5, 'speech', 'Please look at the plan and book the time for me.', DAYS.slice(0, 4), TIMES2, [['wed', 'I am free on Wednesday.'], ['thu', 'I am free on Thursday.'], ['fri', 'I am free on Friday.'], ['afternoon', 'I have lectures in the morning.'], ['morning', 'I can come only in the morning.']], [['mon', 'I am not free on Monday.'], ['tue', 'I am at sea on Tuesday.'], ['t3', 'I must leave before three.']], READERS),
  slt('at5_slot2', 5, 'email', 'Please look at the plan and book the room for the conference.', ROOMS, ROOMCOLS, [['large', 'About 60 people are expected, so we shall need the lecture hall.'], ['small', 'Only a few people will attend, so a small room is enough.'], ['afternoon', 'The session must be held in the afternoon.'], ['morning', 'The session must be held in the morning.']], [['mon', 'It cannot be held on a Monday, because the hall is used for examinations.'], ['tue', 'I am unavailable on Tuesdays.']], READERS, ['Dear {Ms. Thorne|@},'], [], 'rooms'),
  frm('at5_pad1', 5, ['Good morning. This is {who}.', 'The program of the conference has been changed: the paper on {topic} will now be presented on {day} at {time}.', 'Please correct the program before it is printed on {print}.'], [
    { id: 'who', label: 'Caller', values: ['{Mr. Osei|@}', '{Professor Hale|@}', '{Mr. Ashby|@}'] },
    { id: 'topic', label: 'Paper on', values: ['tides', 'trade', 'songs', 'letters'] },
    { id: 'day', label: 'Now on', values: ['May 12', 'May 13'] },
    { id: 'time', label: 'At', values: ['9:30', '11:00', '1:00'] },
    { id: 'print', label: 'Print on', values: ['Monday', 'Thursday', 'Friday'] },
  ], 'The telephone is ringing. Please listen carefully and write the message.'),
  frm('at5_pad2', 5, ['Hello. This is the office of {from}.', 'The {item} that you asked for cannot be lent, because it is excluded from the agreement.', 'We can send you {offer}, at the cost of {cost}.'], [
    { id: 'from', label: 'From', values: ['the Harbour Network', 'the library of the capital', 'the academy'] },
    { id: 'item', label: 'The item', values: ['thesis', 'rare book', 'old map'] },
    { id: 'offer', label: 'Offer', values: ['a copy of the abstract', 'a photograph of the page', 'a list of other libraries'] },
    { id: 'cost', label: 'Cost', values: ['3 dollars', '30 dollars', '13 dollars'] },
  ], 'The telephone is ringing. Please listen carefully and write the message.'),
  choose('at5_speech', 5, 'speech5', 'speech'),
  choose('at5_phone', 5, 'phone5', 'phone', 'Please listen. A caller has a question.'),
  choose('at5_notice', 5, 'notice5', 'memo'),
  choose('at5_mail', 5, 'mail5', 'email', 'A reader has written to us. Please read the email carefully and choose the reply.'),
  choose('at5_abs', 5, 'abs5', 'memo', 'Please read this abstract and choose the summary that is true.'),
];

const BANKS: Record<string, QaItem[]> = {
  speech1: QA_SPEECH1, phone1: QA_PHONE1, notice1: QA_NOTICE1,
  speech2: QA_SPEECH2, phone2: QA_PHONE2, notice2: QA_NOTICE2, mail2: QA_MAIL2, abs2: QA_ABS2,
  speech3: QA_SPEECH3, phone3: QA_PHONE3, notice3: QA_NOTICE3, mail3: QA_MAIL3, abs3: QA_ABS3,
  speech4: QA_SPEECH4, phone4: QA_PHONE4, notice4: QA_NOTICE4, mail4: QA_MAIL4, abs4: QA_ABS4,
  speech5: QA_SPEECH5, phone5: QA_PHONE5, notice5: QA_NOTICE5, mail5: QA_MAIL5, abs5: QA_ABS5,
};

// ---------------------------------------------------------------------------- more templates: the subjects of the shelves

T2.push(
  srt('at2_sort2', 2, 'Please read each title and put the book on the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['A book about energy and the sun', 'science'], ['How a cell grows', 'science'], ['The soil and the plants that grow in it', 'science'], ['Oxygen and the air', 'science'], ['Minerals and metals under the ground', 'science'], ['A book about forests and wild animals', 'science'],
    ['A short history of the old market', 'history'], ['The origin of the harbour festival', 'history'], ['The legend of the lost island', 'history'], ['The knights and the kings of the north', 'history'],
    ['A tale of a sailor and the sea', 'literature'], ['A comedy about a clever clown', 'literature'], ['The biography of a famous poet', 'literature'], ['A mystery in a small town', 'literature'],
    ['The melody and the rhythm of folk songs', 'arts'], ['A guide to the orchestra', 'arts'], ['Pottery and clay in the old village', 'arts'], ['A gallery of portraits', 'arts'],
    ['The area of a circle', 'maths'], ['A book of graphs and diagrams', 'maths'], ['How a device uses electricity', 'tech'], ['How a robot works', 'tech'], ['A handbook of electronic parts', 'tech'],
  ]),
);
T3.push(
  srt('at3_sort3', 3, 'The new books are on the cart. Please read each subject line, and put each book on the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['The species of the northern coast', 'science'], ['The carbon in the air and the sea', 'science'], ['The formation of rocks and mountains', 'science'], ['Solar energy and its uses', 'science'], ['The structure of a molecule', 'science'], ['The cycle of water on the earth', 'science'],
    ['The revolution and the new government', 'history'], ['The province and its trade', 'history'], ['The tribe that lived on the river', 'history'], ['The dynasty of the great kings', 'history'], ['The exploration of the northern coast', 'history'], ['The historian and the old records', 'history'],
    ['The plot of a novel about a long voyage', 'literature'], ['Verse and prose of the northern poets', 'literature'], ['A literary study of a famous tragedy', 'literature'], ['The narrative of a long journey', 'literature'],
    ['Classical music and the role of the conductor', 'arts'], ['The animation of a cartoon', 'arts'], ['The sculpture of a hero in the square', 'arts'], ['The harmony of a folk tune', 'arts'],
    ['The ratio and the proportion of two numbers', 'maths'], ['The logic of a proof', 'maths'], ['A table of measurements and statistics', 'maths'],
    ['The design of a circuit', 'tech'], ['A power plant that burns coal', 'tech'], ['The database of a library', 'tech'], ['The wires and the cables under the sea', 'tech'], ['The technology of a satellite', 'tech'],
  ]),
);
T4.push(
  srt('at4_sort3', 4, 'The cart is full of new acquisitions. Please read each subject line with care.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['The evolution of living things', 'science'], ['The galaxy and the gravity that holds it', 'science'], ['The spectrum of light and the particle that carries it', 'science'], ['The genetic code and the mutation of genes', 'science'], ['The ecology of a coral reef', 'science'], ['A laboratory study of an enzyme', 'science'],
    ['The migration of tribes across the continent', 'history'], ['The civilization of the ancient coast', 'history'], ['The memoir of a harbour master', 'history'], ['The propaganda of the war years', 'history'], ['The manuscript of a medieval monk', 'history'], ['The censorship of books in the old kingdom', 'history'],
    ['A study of the genre of the sea story', 'literature'], ['The prose and the imagery of a northern writer', 'literature'], ['An anthology of folk tales', 'literature'], ['The trilogy of a famous novelist', 'literature'], ['The commentary on a sonnet', 'literature'], ['The saga of a family of sailors', 'literature'],
    ['The ensemble and the chorus of the harbour church', 'arts'], ['The soundtrack of a film about the sea', 'arts'], ['The palette of the painters of the coast', 'arts'], ['The aesthetic theory of the romantic age', 'arts'], ['The architecture of the old cathedral', 'arts'], ['The masterpiece of a forgotten painter', 'arts'],
    ['The equation of a curve', 'maths'], ['The matrix and the vector', 'maths'], ['The theorem and its proof', 'maths'],
    ['The algorithm that sorts a list', 'tech'], ['The sensor that detects a storm', 'tech'], ['The radar and the antenna of a ship', 'tech'], ['The voltage of a battery and the current in a wire', 'tech'], ['The laser and the optical cable', 'tech'], ['The simulation of a flood', 'tech'],
  ]),
);
T5.push(
  srt('at5_sort3', 5, 'The conference papers are in. Please read each abstract with care, and send each paper to the right shelf.', [4, 5], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['The hypothesis of an early universe', 'science'], ['The correlation between the temperature of the sea and the catch', 'science'], ['The geological history of the coast', 'science'], ['The neuron and the structure of the brain', 'science'], ['The fossil of a giant fish', 'science'], ['The synthesis of a new polymer', 'science'], ['The ozone layer and the climate', 'science'],
    ['The empirical study of the grain trade', 'history'], ['The mythology of the northern tribes', 'history'], ['The archaeology of the old harbour', 'history'], ['The pamphlets of the revolution', 'history'], ['The sociology of a small port', 'history'],
    ['The protagonist and the plot of the great novel', 'literature'], ['The ballad and the hymn in the north', 'literature'], ['The screenplay of a film about the flood', 'literature'], ['A study of the pastoral tradition', 'literature'], ['The playwright and the stage of the capital', 'literature'],
    ['The ensemble and the choreography of the ballet', 'arts'], ['The curator and the exhibition of the museum', 'arts'], ['The concerto and the cello', 'arts'], ['The baroque church and its organ', 'arts'], ['The tempo and the chord in the jazz of the harbour', 'arts'],
    ['The calculus of motion', 'maths'], ['A theorem on prime numbers', 'maths'], ['The algebra of curves', 'maths'], ['The decimal system and the fraction', 'maths'],
    ['The computation of a large table', 'tech'], ['The automation of the harbour crane', 'tech'], ['The transistor and the amplifier', 'tech'], ['The blueprint of a sea wall', 'tech'], ['The wavelength of a radio signal', 'tech'], ['The firewall and the network', 'tech'],
  ]),
);
T1.push(
  srt('at1_sort2', 1, 'Please put the books on the right shelves.', [3, 4], ['science', 'history', 'literature', 'arts', 'maths', 'tech'], [
    ['A book about nature', 'science'], ['A book about wood and metal', 'science'], ['A book about the waves of the sea', 'science'], ['A book about life in the old world', 'history'], ['A book about a famous discovery', 'history'],
    ['A popular book of stories', 'literature'], ['A series of books for young readers', 'literature'], ['A book about a famous artist', 'arts'], ['A book about the style of old pictures', 'arts'], ['A book of average numbers', 'maths'],
    ['A book about the online world', 'tech'], ['A book about the production of machines', 'tech'], ['A book about how to search for an image', 'tech'],
  ]),
);

const QA: Record<string, QaItem[]> = Object.fromEntries(Object.entries(BANKS).map(([k, v]) => [k, withBankTags(k, v)]));

// ---------------------------------------------------------------------------- reactions and the boss's lines
// The readers and the librarian say in English what was right or wrong: a wrong result names the line, the shelf or the fact.

const REACTIONS: JobContent['reactions'] = [
  // ---- perfect
  { id: 'ar_ok1', kind: 'perfect', text: 'Thank you. That is right.', face: 'happy' },
  { id: 'ar_ok2', kind: 'perfect', text: 'Good. That is just what I need.', face: 'happy' },
  { id: 'ar_ok3', kind: 'perfect', arch: 'sort', text: 'Good. Now every book is on the right shelf.', face: 'happy' },
  { id: 'ar_ok4', kind: 'perfect', arch: 'check', voice: 'person', text: 'Thank you for checking. Now I can take my book home.', face: 'delighted' },
  { id: 'ar_ok5', kind: 'perfect', arch: 'respond', voice: 'person', text: 'Yes, that answers my question. Thank you.', face: 'happy' },
  { id: 'ar_ok6', kind: 'perfect', voice: 'boss', text: 'Good work. That is the right answer.', face: 'happy' },
  { id: 'ar_ok7', kind: 'perfect', rank: 2, text: 'Thank you. You have helped me a lot.', face: 'delighted' },
  { id: 'ar_ok8', kind: 'perfect', rank: 2, arch: 'check', text: 'Good eyes. Now the card and the book agree.', face: 'delighted' },
  { id: 'ar_ok9', kind: 'perfect', rank: 2, arch: 'respond', voice: 'boss', text: 'Good. You read it carefully, and the answer is right.', face: 'happy' },
  { id: 'ar_ok10', kind: 'perfect', rank: 3, text: 'Excellent. That is exactly what the passage says.', face: 'delighted' },
  { id: 'ar_ok11', kind: 'perfect', rank: 3, arch: 'check', text: 'Good work. The record is correct now, and nobody will be confused.', face: 'happy' },
  { id: 'ar_ok12', kind: 'perfect', rank: 3, arch: 'sort', text: 'Very good. Each book will be easy to find on its shelf.', face: 'delighted' },
  { id: 'ar_ok13', kind: 'perfect', rank: 4, text: 'Exactly right. You read the abstract with great care.', face: 'delighted' },
  { id: 'ar_ok14', kind: 'perfect', rank: 4, arch: 'respond', voice: 'boss', text: 'A clear and correct reply. Please send it, and thank you.', face: 'happy' },
  { id: 'ar_ok15', kind: 'perfect', rank: 5, text: 'Precisely. That is what the author says, and nothing more.', face: 'delighted' },
  { id: 'ar_ok16', kind: 'perfect', rank: 5, arch: 'check', text: 'Well spotted. The summary would have been wrong for every reader of the program.', face: 'delighted' },
  // ---- minor
  { id: 'ar_late1', kind: 'minor', late: true, text: 'That is right, but please be a little faster next time.', face: 'neutral' },
  { id: 'ar_late2', kind: 'minor', late: true, rank: 3, text: 'Correct, though many readers are waiting. Please work a little quicker.', face: 'neutral' },
  { id: 'ar_minor1', kind: 'minor', arch: 'sort', text: 'Nearly. One book is on the wrong shelf. Please look again.', face: 'neutral' },
  { id: 'ar_minor2', kind: 'minor', arch: 'respond', text: 'Nearly. One line of the message is wrong. Please look again.', face: 'neutral' },
  // ---- sort
  { id: 'ar_bin1', kind: 'wrong_bin', text: 'No. This book belongs on “{bin}”.', face: 'puzzled' },
  { id: 'ar_bin2', kind: 'wrong_bin', text: 'Oh! That one is for “{bin}”, not for this shelf.', face: 'puzzled' },
  { id: 'ar_bin3', kind: 'wrong_bin', rank: 3, text: 'That is the wrong shelf. The subject of this book belongs to “{bin}”, so please read the title again.', face: 'puzzled' },
  { id: 'ar_bin4', kind: 'wrong_bin', rank: 5, text: 'No. What this abstract describes is the subject of “{bin}”. Please read it again, line by line.', face: 'puzzled' },
  // ---- check
  { id: 'ar_miss1', kind: 'missed', text: 'Wait! This is not right. The {field} is not the same on both papers.', face: 'angry' },
  { id: 'ar_miss2', kind: 'missed', voice: 'person', text: 'Stop. Look at the {field} again. It is wrong on the card.', face: 'sad' },
  { id: 'ar_miss3', kind: 'missed', rank: 3, text: 'A reader would not find this book. The {field} on the card does not agree with the title page.', face: 'angry' },
  { id: 'ar_miss4', kind: 'missed', rank: 3, needs: '\\b(passage|abstract)\\b', text: 'This summary is wrong. The {field} does not say what the passage says.', face: 'angry' },
  { id: 'ar_miss5', kind: 'missed', rank: 4, needs: '\\bcitation\\b', text: 'A scholar would be unable to find this source. The {field} in the citation does not match the journal.', face: 'angry' },
  { id: 'ar_miss6', kind: 'missed', rank: 5, needs: '\\b(passage|abstract)\\b', text: 'The {field} goes beyond the abstract, and a reader of the program would be misled.', face: 'angry' },
  { id: 'ar_alarm1', kind: 'false_alarm', text: 'But there is no problem. The {field} is the same on both papers.', face: 'puzzled' },
  { id: 'ar_alarm2', kind: 'false_alarm', text: 'This one is fine. Everything agrees with the title page.', face: 'puzzled' },
  { id: 'ar_alarm3', kind: 'false_alarm', rank: 3, text: 'You stopped a correct record. The {field} agrees with the paper behind it, so please do not hold it back.', face: 'puzzled' },
  { id: 'ar_alarm4', kind: 'false_alarm', rank: 5, needs: '\\b(passage|abstract)\\b', text: 'The {field} is faithful to the abstract. Please do not reject a summary that is accurate.', face: 'puzzled' },
  { id: 'ar_field1', kind: 'wrong_field', text: 'Not that line. The problem is the {field}.', face: 'puzzled' },
  { id: 'ar_field2', kind: 'wrong_field', rank: 2, text: 'That line is correct. Please look at the {field} again.', face: 'puzzled' },
  { id: 'ar_field3', kind: 'wrong_field', rank: 4, text: 'That line is accurate. The mistake is in the {field}.', face: 'puzzled' },
  { id: 'ar_fix1', kind: 'wrong_fix', text: 'You found the right line, but that is not the right new value for the {field}.', face: 'neutral' },
  { id: 'ar_fix2', kind: 'wrong_fix', rank: 4, text: 'Yes, the {field} is wrong, but the wording you chose does not follow from the other paper.', face: 'neutral' },
  // ---- respond
  { id: 'ar_reply0', kind: 'wrong_reply', text: 'Sorry? That is not right. Please look at it again.', face: 'puzzled' },
  { id: 'ar_reply1', kind: 'wrong_reply', voice: 'person', text: 'Sorry? That is not an answer to my question.', face: 'puzzled' },
  { id: 'ar_reply2', kind: 'wrong_reply', voice: 'person', needs: '\\b(rule|loans?|fees?|hours?|renewals?|reservations?)\\b', text: 'But the notice says something different. Please read it again.', face: 'puzzled' },
  { id: 'ar_reply3', kind: 'wrong_reply', voice: 'boss', text: 'That is not the right answer. Please read it again.', face: 'puzzled' },
  { id: 'ar_reply4', kind: 'wrong_reply', rank: 2, needs: '\\babstract\\b', text: 'That is not what the abstract says. Please read it again.', face: 'puzzled' },
  { id: 'ar_reply5', kind: 'wrong_reply', rank: 3, voice: 'boss', text: 'That reply does not agree with the facts in the message. Please read it again.', face: 'puzzled' },
  { id: 'ar_reply6', kind: 'wrong_reply', rank: 4, needs: '\\babstract\\b', text: 'That summary changes the claim of the author. Please read the abstract again, and watch for the small words.', face: 'sad' },
  { id: 'ar_reply7', kind: 'wrong_reply', rank: 5, text: 'That reply ignores a condition of the rule, or a qualification in the abstract. Please read it again, and watch for the exceptions.', face: 'sad' },
  { id: 'ar_slot1', kind: 'wrong_slot', text: 'That time is not free, or it is not the time I asked for. Please try again.', face: 'sad' },
  { id: 'ar_slot2', kind: 'wrong_slot', rank: 3, text: 'That booking does not meet every condition of the request. Please check the day, the time and the room.', face: 'sad' },
  { id: 'ar_form1', kind: 'wrong_form', text: 'Some of this message is wrong. Please listen again.', face: 'sad' },
  { id: 'ar_form2', kind: 'wrong_form', rank: 3, text: 'The message is not quite right. Please check every name and number.', face: 'sad' },
  // ---- any failure
  { id: 'ar_fail1', kind: 'any_fail', text: 'Oh no. That is not right. Please look again.', face: 'sad' },
  { id: 'ar_fail2', kind: 'any_fail', rank: 3, text: 'That is not correct. Please be more careful.', face: 'sad' },
];

const LINES: JobContent['lines'] = [
  { id: 'al_s1', kind: 'start', text: 'Good morning. The doors are open, and the first readers are waiting.' },
  { id: 'al_s2', kind: 'start', text: 'Hello. The books are on your desk.' },
  { id: 'al_s3', kind: 'start', rank: 2, text: 'Good morning. Please check every card twice today.' },
  { id: 'al_s4', kind: 'start', rank: 3, text: 'Good morning. The reading room is full today, but accuracy comes first.' },
  { id: 'al_s5', kind: 'start', rank: 4, text: 'Good morning. We have a full list, and several rules have changed since last term.' },
  { id: 'al_s6', kind: 'start', rank: 5, text: 'Good morning. The conference is this week, so every record and every summary must be perfect.' },
  { id: 'al_e1', kind: 'end', text: 'Thank you for your work today.' },
  { id: 'al_e2', kind: 'end', text: 'Good work. See you tomorrow.' },
  { id: 'al_e3', kind: 'end', rank: 3, text: 'Thank you. The reading room is quiet at last.' },
  { id: 'al_e4', kind: 'end', rank: 5, text: 'The scholars will be pleased with today. Thank you for your careful work.' },
  { id: 'al_r1', kind: 'rankup', text: 'You are doing very well. Here is a little more work for you.' },
  { id: 'al_r5', kind: 'rankup', rank: 5, text: 'You may now read the abstracts with me, and the conference is yours to prepare.' },
  { id: 'al_h1', kind: 'handover', msg: 'phone', text: 'The telephone is for you. Please take the message.' },
  { id: 'al_h2', kind: 'handover', msg: 'email', text: 'An email came for us. Please read it and answer it.' },
  { id: 'al_h3', kind: 'handover', msg: 'memo', text: 'Please read this notice and choose the right answer.' },
  { id: 'al_h4', kind: 'handover', msg: 'letter', text: 'This letter came by the morning post. Please read it and answer it.' },
  { id: 'al_h5', kind: 'handover', msg: 'check', text: 'Please check this card against the title page.' },
  { id: 'al_h6', kind: 'handover', msg: 'sort', text: 'The new books are here. Please put each one on the right shelf.' },
  { id: 'al_h7', kind: 'handover', rank: 4, msg: 'email', text: 'Read this carefully, please, and be sure that the reply agrees with the rule.' },
];

// ---------------------------------------------------------------------------- the job

const LEXICON = lex(LEX_SRC);
const FORMS: Record<string, string[]> = EXTRA_FORMS;

const EN: JobContent = {
  sign: '{Harbour|@} Academy Library',
  lexicon: LEXICON.entries,
  pages: LEXICON.pages,
  forms: FORMS,
  people: [
    { id: 'p_thorne', name: 'Ms. Thorne', avatar: '👩‍🏫' },
    { id: 'p_ashby', name: 'Mr. Ashby', avatar: '👨', staff: true },
    { id: 'p_reyes', name: 'Ms. Reyes', avatar: '👩', staff: true },
    { id: 'p_osei', name: 'Mr. Osei', avatar: '👨‍🏫' },
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
  boss: 'p_thorne',
  things: [],
  sort: {
    item: 'file',
    bins: [
      { id: 'science', label: 'Science', ref: 'the science shelf', art: 'shelf' },
      { id: 'history', label: 'History', ref: 'the history shelf', art: 'store' },
      { id: 'literature', label: 'Literature', ref: 'the literature shelf', art: 'idea' },
      { id: 'arts', label: 'Arts and Music', ref: 'the arts shelf', art: 'board' },
      { id: 'maths', label: 'Maths', ref: 'the maths shelf', art: 'day' },
      { id: 'tech', label: 'Technology', ref: 'the technology shelf', art: 'light' },
    ],
  },
  tasks: [...R1, ...R2, ...R3, ...R4, ...R5],
  templates: withTemplateTags([...T1, ...T2, ...T3, ...T4, ...T5]),
  qa: QA,
  reactions: REACTIONS,
  lines: LINES,
};

export const ACADEMY_JOB: JobDef = {
  id: 'academy',
  nameJa: '学院の図書室',
  blurbJa: '港町の学院の図書室で働く。本や論文をタイトルや要旨を読んで書架に仕分け、目録カードや引用を表紙と照らし合わせ、要約が本文を言い違えている文を見つけ、貸出や複写の規則から読者への返事を選び、自習室や講義の日時を空きに入れ、電話の伝言を書き、要旨に合う要約を選ぶ。教育・科学・歴史・文学・芸術・技術・研究の言葉と、学術的な英語（英検向け）。',
  icon: '📚',
  domains: ['science', 'school', 'arts', 'technology', 'society', 'nature', 'media', 'communication', 'office'],
  archetypes: ['sort', 'check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '3', toeic: 500 }, tasks: 4, noteJa: '本を書架（科学・歴史・文学・芸術・数学・技術）へ仕分ける。目録カードと表紙の食い違い（題名・著者・年）を探す。掲示から開館時間や貸出の決まりを読んで答える。自習室の日時を空きに入れる。電話の伝言を書く。英検3級。' },
    { rank: 2, need: { good: 13, words: 50 }, level: { eiken: 'pre2', toeic: 600 }, unlocks: ['long'], tasks: 5, reward: { coins: 12 }, noteJa: '題名から書架を選ぶ。出版社・ページ数・返却日の確認。貸出・更新・予約の決まり。短い要旨に合う紹介文を選ぶ。条件がふたつの日程。英検準2級。' },
    { rank: 3, need: { good: 26, words: 130 }, level: { eiken: '2', toeic: 730 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 5, reward: { coins: 20 }, noteJa: '要旨と、それを正しく言い換えた要約を結ぶ。要約が本文と食い違う文を見つけ、正しい文も選んで直す。複写・雑誌・論文・館外取り寄せの規則。電話を耳だけで聞く。時間制限（選んだときだけ）。英検2級。' },
    { rank: 4, need: { good: 53, words: 250 }, level: { eiken: 'pre1', toeic: 860 }, tasks: 6, reward: { coins: 30 }, noteJa: '長い要旨と、原因と結果や「一部」と「すべて」をゆがめた要約。特別収蔵室・電子図書館・剽窃・論文の公開猶予・研究助成。引用と目録の確認。耳だけの留守番電話。英検準1級。' },
    { rank: 5, need: { good: 80, words: 370 }, level: { eiken: '1', toeic: 990 }, tasks: 6, reward: { coins: 50 }, noteJa: '灯台：図書室の右腕。ヘッジや譲歩を含む密な要旨、著作権と許可、水に濡れた記録、館間貸出の協定、査読、シンポジウムの準備。大げさな要約を見抜く。耳だけの伝言。英検1級。' },
  ],
  wage: { perfect: 4, minor: 2, fail: 0, bad: 0 },
  opensAfter: 6,
  hours: [0, 2],
  building: 'academy',
  content: { en: EN },
  flavour: 'school',
};
