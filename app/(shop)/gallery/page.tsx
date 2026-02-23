'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, X, ChevronUp, SlidersHorizontal, ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// SORT OPTIONS
const PRICE_RANGES = ['Low to High', 'High to Low', '50', '75', '100', '125', '150', '175', '200', '225', '250', '300'];

// ------------------------------------------------------------------
// FULL INVENTORY (397 Items) - KEPT EXACTLY AS PROVIDED
// ------------------------------------------------------------------
const MANUAL_INVENTORY = [
  { "id": "397", "code": "99", "title": "99", "price": "150", "Sort by": "150", "img": "/tattoo/99-150.png" },
  { "id": "1", "code": "1", "title": "1", "price": "100", "Sort by": "100", "img": "/tattoo/1-100.png" },
  { "id": "2", "code": "10", "title": "10", "price": "100", "Sort by": "100", "img": "/tattoo/10-100.png" },
  { "id": "3", "code": "100", "title": "100", "price": "150", "Sort by": "150", "img": "/tattoo/100-150.png" },
  { "id": "4", "code": "101", "title": "101", "price": "150", "Sort by": "150", "img": "/tattoo/101-150.png" },
  { "id": "5", "code": "102", "title": "102", "price": "200", "Sort by": "200", "img": "/tattoo/102-200.png" },
  { "id": "6", "code": "103", "title": "103", "price": "200", "Sort by": "200", "img": "/tattoo/103-200.png" },
  { "id": "7", "code": "104", "title": "104", "price": "150", "Sort by": "150", "img": "/tattoo/104-150.png" },
  { "id": "8", "code": "105", "title": "105", "price": "150", "Sort by": "150", "img": "/tattoo/105-150.png" },
  { "id": "9", "code": "106", "title": "106", "price": "150", "Sort by": "150", "img": "/tattoo/106-150.png" },
  { "id": "10", "code": "107", "title": "107", "price": "150", "Sort by": "150", "img": "/tattoo/107-150.png" },
  { "id": "11", "code": "108", "title": "108", "price": "150", "Sort by": "150", "img": "/tattoo/108-150.png" },
  { "id": "12", "code": "109", "title": "109", "price": "100", "Sort by": "100", "img": "/tattoo/109-100.png" },
  { "id": "13", "code": "11", "title": "11", "price": "150", "Sort by": "150", "img": "/tattoo/11-150.png" },
  { "id": "14", "code": "110", "title": "110", "price": "150", "Sort by": "150", "img": "/tattoo/110-150.png" },
  { "id": "15", "code": "111", "title": "111", "price": "150", "Sort by": "150", "img": "/tattoo/111-150.png" },
  { "id": "16", "code": "112", "title": "112", "price": "150", "Sort by": "150", "img": "/tattoo/112-150.png" },
  { "id": "17", "code": "113", "title": "113", "price": "150", "Sort by": "150", "img": "/tattoo/113-150.png" },
  { "id": "18", "code": "114", "title": "114", "price": "150", "Sort by": "150", "img": "/tattoo/114-150.png" },
  { "id": "19", "code": "115", "title": "115", "price": "150", "Sort by": "150", "img": "/tattoo/115-150.png" },
  { "id": "20", "code": "116", "title": "116", "price": "250", "Sort by": "250", "img": "/tattoo/116-250.png" },
  { "id": "21", "code": "117", "title": "117", "price": "150", "Sort by": "150", "img": "/tattoo/117-150.png" },
  { "id": "22", "code": "12", "title": "12", "price": "150", "Sort by": "150", "img": "/tattoo/12-150.png" },
  { "id": "23", "code": "120", "title": "120", "price": "150", "Sort by": "150", "img": "/tattoo/120-150.png" },
  { "id": "24", "code": "121", "title": "121", "price": "200", "Sort by": "200", "img": "/tattoo/121-200.png" },
  { "id": "25", "code": "122", "title": "122", "price": "200", "Sort by": "200", "img": "/tattoo/122-200.png" },
  { "id": "26", "code": "123", "title": "123", "price": "150", "Sort by": "150", "img": "/tattoo/123-150.png" },
  { "id": "27", "code": "124", "title": "124", "price": "200", "Sort by": "200", "img": "/tattoo/124-200.png" },
  { "id": "28", "code": "125", "title": "125", "price": "150", "Sort by": "150", "img": "/tattoo/125-150.png" },
  { "id": "29", "code": "126", "title": "126", "price": "200", "Sort by": "200", "img": "/tattoo/126-200.png" },
  { "id": "30", "code": "127", "title": "127", "price": "150", "Sort by": "150", "img": "/tattoo/127-150.png" },
  { "id": "31", "code": "128", "title": "128", "price": "200", "Sort by": "200", "img": "/tattoo/128-200.png" },
  { "id": "32", "code": "129", "title": "129", "price": "150", "Sort by": "150", "img": "/tattoo/129-150.png" },
  { "id": "33", "code": "13", "title": "13", "price": "150", "Sort by": "150", "img": "/tattoo/13-150.png" },
  { "id": "34", "code": "130", "title": "130", "price": "150", "Sort by": "150", "img": "/tattoo/130-150.png" },
  { "id": "35", "code": "131", "title": "131", "price": "150", "Sort by": "150", "img": "/tattoo/131-150.png" },
  { "id": "36", "code": "132", "title": "132", "price": "200", "Sort by": "200", "img": "/tattoo/132-200.png" },
  { "id": "37", "code": "133", "title": "133", "price": "150", "Sort by": "150", "img": "/tattoo/133-150.png" },
  { "id": "38", "code": "134", "title": "134", "price": "150", "Sort by": "150", "img": "/tattoo/134-150.png" },
  { "id": "39", "code": "135", "title": "135", "price": "150", "Sort by": "150", "img": "/tattoo/135-150.png" },
  { "id": "40", "code": "136", "title": "136", "price": "200", "Sort by": "200", "img": "/tattoo/136-200.png" },
  { "id": "41", "code": "137", "title": "137", "price": "150", "Sort by": "150", "img": "/tattoo/137-150.png" },
  { "id": "42", "code": "138", "title": "138", "price": "150", "Sort by": "150", "img": "/tattoo/138-150.png" },
  { "id": "43", "code": "139", "title": "139", "price": "150", "Sort by": "150", "img": "/tattoo/139-150.png" },
  { "id": "44", "code": "14", "title": "14", "price": "150", "Sort by": "150", "img": "/tattoo/14-150.png" },
  { "id": "45", "code": "140", "title": "140", "price": "200", "Sort by": "200", "img": "/tattoo/140-200.png" },
  { "id": "46", "code": "141", "title": "141", "price": "200", "Sort by": "200", "img": "/tattoo/141-200.png" },
  { "id": "47", "code": "142", "title": "142", "price": "200", "Sort by": "200", "img": "/tattoo/142-200.png" },
  { "id": "48", "code": "143", "title": "143", "price": "200", "Sort by": "200", "img": "/tattoo/143-200.png" },
  { "id": "49", "code": "144", "title": "144", "price": "200", "Sort by": "200", "img": "/tattoo/144-200.png" },
  { "id": "50", "code": "145", "title": "145", "price": "200", "Sort by": "200", "img": "/tattoo/145-200.png" },
  { "id": "51", "code": "146", "title": "146", "price": "150", "Sort by": "150", "img": "/tattoo/146-150.png" },
  { "id": "52", "code": "147", "title": "147", "price": "150", "Sort by": "150", "img": "/tattoo/147-150.png" },
  { "id": "53", "code": "148", "title": "148", "price": "150", "Sort by": "150", "img": "/tattoo/148-150.png" },
  { "id": "54", "code": "149", "title": "149", "price": "200", "Sort by": "200", "img": "/tattoo/149-200.png" },
  { "id": "55", "code": "15", "title": "15", "price": "150", "Sort by": "150", "img": "/tattoo/15-150.png" },
  { "id": "56", "code": "150", "title": "150", "price": "200", "Sort by": "200", "img": "/tattoo/150-200.png" },
  { "id": "57", "code": "151", "title": "151", "price": "200", "Sort by": "200", "img": "/tattoo/151-200.png" },
  { "id": "58", "code": "152", "title": "152", "price": "200", "Sort by": "200", "img": "/tattoo/152-200.png" },
  { "id": "59", "code": "153", "title": "153", "price": "200", "Sort by": "200", "img": "/tattoo/153-200.png" },
  { "id": "60", "code": "154", "title": "154", "price": "200", "Sort by": "200", "img": "/tattoo/154-200.png" },
  { "id": "61", "code": "155", "title": "155", "price": "200", "Sort by": "200", "img": "/tattoo/155-200.png" },
  { "id": "62", "code": "156", "title": "156", "price": "200", "Sort by": "200", "img": "/tattoo/156-200.png" },
  { "id": "63", "code": "157", "title": "157", "price": "200", "Sort by": "200", "img": "/tattoo/157-200.png" },
  { "id": "64", "code": "158", "title": "158", "price": "200", "Sort by": "200", "img": "/tattoo/158-200.png" },
  { "id": "65", "code": "159", "title": "159", "price": "200", "Sort by": "200", "img": "/tattoo/159-200.png" },
  { "id": "66", "code": "16", "title": "16", "price": "100", "Sort by": "100", "img": "/tattoo/16-100.png" },
  { "id": "67", "code": "160", "title": "160", "price": "150", "Sort by": "150", "img": "/tattoo/160-150.png" },
  { "id": "68", "code": "161", "title": "161", "price": "150", "Sort by": "150", "img": "/tattoo/161-150.png" },
  { "id": "69", "code": "162", "title": "162", "price": "150", "Sort by": "150", "img": "/tattoo/162-150.png" },
  { "id": "70", "code": "163", "title": "163", "price": "150", "Sort by": "150", "img": "/tattoo/163-150.png" },
  { "id": "71", "code": "164", "title": "164", "price": "200", "Sort by": "200", "img": "/tattoo/164-200.png" },
  { "id": "72", "code": "165", "title": "165", "price": "150", "Sort by": "150", "img": "/tattoo/165-150.png" },
  { "id": "73", "code": "166", "title": "166", "price": "150", "Sort by": "150", "img": "/tattoo/166-150.png" },
  { "id": "74", "code": "167", "title": "167", "price": "200", "Sort by": "200", "img": "/tattoo/167-200.png" },
  { "id": "75", "code": "168", "title": "168", "price": "150", "Sort by": "150", "img": "/tattoo/168-150.png" },
  { "id": "76", "code": "169", "title": "169", "price": "150", "Sort by": "150", "img": "/tattoo/169-150.png" },
  { "id": "77", "code": "17", "title": "17", "price": "150", "Sort by": "150", "img": "/tattoo/17-150.png" },
  { "id": "78", "code": "170", "title": "170", "price": "200", "Sort by": "200", "img": "/tattoo/170-200.png" },
  { "id": "79", "code": "171", "title": "171", "price": "200", "Sort by": "200", "img": "/tattoo/171-200.png" },
  { "id": "80", "code": "172", "title": "172", "price": "200", "Sort by": "200", "img": "/tattoo/172-200.png" },
  { "id": "81", "code": "173", "title": "173", "price": "150", "Sort by": "150", "img": "/tattoo/173-150.png" },
  { "id": "82", "code": "174", "title": "174", "price": "150", "Sort by": "150", "img": "/tattoo/174-150.png" },
  { "id": "83", "code": "175", "title": "175", "price": "200", "Sort by": "200", "img": "/tattoo/175-200.png" },
  { "id": "84", "code": "176", "title": "176", "price": "200", "Sort by": "200", "img": "/tattoo/176-200.png" },
  { "id": "85", "code": "177", "title": "177", "price": "200", "Sort by": "200", "img": "/tattoo/177-200.png" },
  { "id": "86", "code": "178", "title": "178", "price": "150", "Sort by": "150", "img": "/tattoo/178-150.png" },
  { "id": "87", "code": "179", "title": "179", "price": "150", "Sort by": "150", "img": "/tattoo/179-150.png" },
  { "id": "88", "code": "18", "title": "18", "price": "150", "Sort by": "150", "img": "/tattoo/18-150.png" },
  { "id": "89", "code": "180", "title": "180", "price": "200", "Sort by": "200", "img": "/tattoo/180-200.png" },
  { "id": "90", "code": "181", "title": "181", "price": "150", "Sort by": "150", "img": "/tattoo/181-150.png" },
  { "id": "91", "code": "182", "title": "182", "price": "150", "Sort by": "150", "img": "/tattoo/182-150.png" },
  { "id": "92", "code": "183", "title": "183", "price": "200", "Sort by": "200", "img": "/tattoo/183-200.png" },
  { "id": "93", "code": "184", "title": "184", "price": "150", "Sort by": "150", "img": "/tattoo/184-150.png" },
  { "id": "94", "code": "185", "title": "185", "price": "200", "Sort by": "200", "img": "/tattoo/185-200.png" },
  { "id": "95", "code": "186", "title": "186", "price": "150", "Sort by": "150", "img": "/tattoo/186-150.png" },
  { "id": "96", "code": "187", "title": "187", "price": "200", "Sort by": "200", "img": "/tattoo/187-200.png" },
  { "id": "97", "code": "188", "title": "188", "price": "200", "Sort by": "200", "img": "/tattoo/188-200.png" },
  { "id": "98", "code": "189", "title": "189", "price": "150", "Sort by": "150", "img": "/tattoo/189-150.png" },
  { "id": "99", "code": "19", "title": "19", "price": "150", "Sort by": "150", "img": "/tattoo/19-150.png" },
  { "id": "100", "code": "190", "title": "190", "price": "150", "Sort by": "150", "img": "/tattoo/190-150.png" },
  { "id": "101", "code": "191", "title": "191", "price": "200", "Sort by": "200", "img": "/tattoo/191-200.png" },
  { "id": "102", "code": "192", "title": "192", "price": "200", "Sort by": "200", "img": "/tattoo/192-200.png" },
  { "id": "103", "code": "193", "title": "193", "price": "200", "Sort by": "200", "img": "/tattoo/193-200.png" },
  { "id": "104", "code": "194", "title": "194", "price": "150", "Sort by": "150", "img": "/tattoo/194-150.png" },
  { "id": "105", "code": "195", "title": "195", "price": "150", "Sort by": "150", "img": "/tattoo/195-150.png" },
  { "id": "106", "code": "196", "title": "196", "price": "200", "Sort by": "200", "img": "/tattoo/196-200.png" },
  { "id": "107", "code": "197", "title": "197", "price": "200", "Sort by": "200", "img": "/tattoo/197-200.png" },
  { "id": "108", "code": "198", "title": "198", "price": "200", "Sort by": "200", "img": "/tattoo/198-200.png" },
  { "id": "109", "code": "199", "title": "199", "price": "200", "Sort by": "200", "img": "/tattoo/199-200.png" },
  { "id": "110", "code": "2", "title": "2", "price": "100", "Sort by": "100", "img": "/tattoo/2-100.png" },
  { "id": "111", "code": "20", "title": "20", "price": "150", "Sort by": "150", "img": "/tattoo/20-150.png" },
  { "id": "112", "code": "200", "title": "200", "price": "200", "Sort by": "200", "img": "/tattoo/200-200.png" },
  { "id": "113", "code": "201", "title": "201", "price": "200", "Sort by": "200", "img": "/tattoo/201-200.png" },
  { "id": "114", "code": "202", "title": "202", "price": "200", "Sort by": "200", "img": "/tattoo/202-200.png" },
  { "id": "115", "code": "203", "title": "203", "price": "200", "Sort by": "200", "img": "/tattoo/203-200.png" },
  { "id": "116", "code": "204", "title": "204", "price": "200", "Sort by": "200", "img": "/tattoo/204-200.png" },
  { "id": "117", "code": "205", "title": "205", "price": "200", "Sort by": "200", "img": "/tattoo/205-200.png" },
  { "id": "118", "code": "206", "title": "206", "price": "200", "Sort by": "200", "img": "/tattoo/206-200.png" },
  { "id": "119", "code": "207", "title": "207", "price": "200", "Sort by": "200", "img": "/tattoo/207-200.png" },
  { "id": "120", "code": "208", "title": "208", "price": "150", "Sort by": "150", "img": "/tattoo/208-150.png" },
  { "id": "121", "code": "209", "title": "209", "price": "200", "Sort by": "200", "img": "/tattoo/209-200.png" },
  { "id": "122", "code": "21", "title": "21", "price": "150", "Sort by": "150", "img": "/tattoo/21-150.png" },
  { "id": "123", "code": "210", "title": "210", "price": "200", "Sort by": "200", "img": "/tattoo/210-200.png" },
  { "id": "124", "code": "211", "title": "211", "price": "200", "Sort by": "200", "img": "/tattoo/211-200.png" },
  { "id": "125", "code": "212", "title": "212", "price": "200", "Sort by": "200", "img": "/tattoo/212-200.png" },
  { "id": "126", "code": "213", "title": "213", "price": "200", "Sort by": "200", "img": "/tattoo/213-200.png" },
  { "id": "127", "code": "214", "title": "214", "price": "200", "Sort by": "200", "img": "/tattoo/214-200.png" },
  { "id": "128", "code": "215", "title": "215", "price": "200", "Sort by": "200", "img": "/tattoo/215-200.png" },
  { "id": "129", "code": "216", "title": "216", "price": "200", "Sort by": "200", "img": "/tattoo/216-200.png" },
  { "id": "130", "code": "217", "title": "217", "price": "200", "Sort by": "200", "img": "/tattoo/217-200.png" },
  { "id": "131", "code": "218", "title": "218", "price": "200", "Sort by": "200", "img": "/tattoo/218-200.png" },
  { "id": "132", "code": "219", "title": "219", "price": "150", "Sort by": "150", "img": "/tattoo/219-150.png" },
  { "id": "133", "code": "22", "title": "22", "price": "150", "Sort by": "150", "img": "/tattoo/22-150.png" },
  { "id": "134", "code": "220", "title": "220", "price": "150", "Sort by": "150", "img": "/tattoo/220-150.png" },
  { "id": "135", "code": "221", "title": "221", "price": "200", "Sort by": "200", "img": "/tattoo/221-200.png" },
  { "id": "136", "code": "222", "title": "222", "price": "200", "Sort by": "200", "img": "/tattoo/222-200.png" },
  { "id": "137", "code": "223", "title": "223", "price": "200", "Sort by": "200", "img": "/tattoo/223-200.png" },
  { "id": "138", "code": "224", "title": "224", "price": "150", "Sort by": "150", "img": "/tattoo/224-150.png" },
  { "id": "139", "code": "225", "title": "225", "price": "200", "Sort by": "200", "img": "/tattoo/225-200.png" },
  { "id": "140", "code": "226", "title": "226", "price": "200", "Sort by": "200", "img": "/tattoo/226-200.png" },
  { "id": "141", "code": "227", "title": "227", "price": "200", "Sort by": "200", "img": "/tattoo/227-200.png" },
  { "id": "142", "code": "228", "title": "228", "price": "200", "Sort by": "200", "img": "/tattoo/228-200.png" },
  { "id": "143", "code": "229", "title": "229", "price": "150", "Sort by": "150", "img": "/tattoo/229-150.png" },
  { "id": "144", "code": "23", "title": "23", "price": "150", "Sort by": "150", "img": "/tattoo/23-150.png" },
  { "id": "145", "code": "230", "title": "230", "price": "150", "Sort by": "150", "img": "/tattoo/230-150.png" },
  { "id": "146", "code": "231", "title": "231", "price": "150", "Sort by": "150", "img": "/tattoo/231-150.png" },
  { "id": "147", "code": "232-150", "title": "232-150", "price": "150", "Sort by": "150", "img": "/tattoo/232-150-.png" },
  { "id": "148", "code": "233", "title": "233", "price": "200", "Sort by": "200", "img": "/tattoo/233-200.png" },
  { "id": "149", "code": "234", "title": "234", "price": "200", "Sort by": "200", "img": "/tattoo/234-200.png" },
  { "id": "150", "code": "235", "title": "235", "price": "150", "Sort by": "150", "img": "/tattoo/235-150.png" },
  { "id": "151", "code": "236", "title": "236", "price": "200", "Sort by": "200", "img": "/tattoo/236-200.png" },
  { "id": "152", "code": "237", "title": "237", "price": "200", "Sort by": "200", "img": "/tattoo/237-200.png" },
  { "id": "153", "code": "238", "title": "238", "price": "150", "Sort by": "150", "img": "/tattoo/238-150.png" },
  { "id": "154", "code": "239", "title": "239", "price": "200", "Sort by": "200", "img": "/tattoo/239-200.png" },
  { "id": "155", "code": "24", "title": "24", "price": "150", "Sort by": "150", "img": "/tattoo/24-150.png" },
  { "id": "156", "code": "240", "title": "240", "price": "200", "Sort by": "200", "img": "/tattoo/240-200.png" },
  { "id": "157", "code": "241", "title": "241", "price": "150", "Sort by": "150", "img": "/tattoo/241-150.png" },
  { "id": "158", "code": "242", "title": "242", "price": "200", "Sort by": "200", "img": "/tattoo/242-200.png" },
  { "id": "159", "code": "243", "title": "243", "price": "200", "Sort by": "200", "img": "/tattoo/243-200.png" },
  { "id": "160", "code": "244", "title": "244", "price": "200", "Sort by": "200", "img": "/tattoo/244-200.png" },
  { "id": "161", "code": "245", "title": "245", "price": "200", "Sort by": "200", "img": "/tattoo/245-200.png" },
  { "id": "162", "code": "246", "title": "246", "price": "150", "Sort by": "150", "img": "/tattoo/246-150.png" },
  { "id": "163", "code": "247", "title": "247", "price": "200", "Sort by": "200", "img": "/tattoo/247-200.png" },
  { "id": "164", "code": "248", "title": "248", "price": "200", "Sort by": "200", "img": "/tattoo/248-200.png" },
  { "id": "165", "code": "249", "title": "249", "price": "150", "Sort by": "150", "img": "/tattoo/249-150.png" },
  { "id": "166", "code": "25", "title": "25", "price": "100", "Sort by": "100", "img": "/tattoo/25-100.png" },
  { "id": "167", "code": "250", "title": "250", "price": "150", "Sort by": "150", "img": "/tattoo/250-150.png" },
  { "id": "168", "code": "251", "title": "251", "price": "150", "Sort by": "150", "img": "/tattoo/251-150.png" },
  { "id": "169", "code": "252", "title": "252", "price": "200", "Sort by": "200", "img": "/tattoo/252-200.png" },
  { "id": "170", "code": "253", "title": "253", "price": "200", "Sort by": "200", "img": "/tattoo/253-200.png" },
  { "id": "171", "code": "254", "title": "254", "price": "150", "Sort by": "150", "img": "/tattoo/254-150.png" },
  { "id": "172", "code": "255", "title": "255", "price": "100", "Sort by": "100", "img": "/tattoo/255-100X3.png" },
  { "id": "173", "code": "256", "title": "256", "price": "200", "Sort by": "200", "img": "/tattoo/256-200.png" },
  { "id": "174", "code": "257", "title": "257", "price": "150", "Sort by": "150", "img": "/tattoo/257-150.png" },
  { "id": "175", "code": "258", "title": "258", "price": "150", "Sort by": "150", "img": "/tattoo/258-150.png" },
  { "id": "176", "code": "259", "title": "259", "price": "200", "Sort by": "200", "img": "/tattoo/259-200.png" },
  { "id": "177", "code": "26", "title": "26", "price": "150", "Sort by": "150", "img": "/tattoo/26-150.png" },
  { "id": "178", "code": "260", "title": "260", "price": "200", "Sort by": "200", "img": "/tattoo/260-200.png" },
  { "id": "179", "code": "261", "title": "261", "price": "200", "Sort by": "200", "img": "/tattoo/261-200.png" },
  { "id": "180", "code": "262", "title": "262", "price": "200", "Sort by": "200", "img": "/tattoo/262-200.png" },
  { "id": "181", "code": "263", "title": "263", "price": "200", "Sort by": "200", "img": "/tattoo/263-200.png" },
  { "id": "182", "code": "264", "title": "264", "price": "150", "Sort by": "150", "img": "/tattoo/264-150.png" },
  { "id": "183", "code": "265", "title": "265", "price": "200", "Sort by": "200", "img": "/tattoo/265-200.png" },
  { "id": "184", "code": "266", "title": "266", "price": "150", "Sort by": "150", "img": "/tattoo/266-150.png" },
  { "id": "185", "code": "267", "title": "267", "price": "150", "Sort by": "150", "img": "/tattoo/267-150.png" },
  { "id": "186", "code": "268", "title": "268", "price": "150", "Sort by": "150", "img": "/tattoo/268-150.png" },
  { "id": "187", "code": "269", "title": "269", "price": "150", "Sort by": "150", "img": "/tattoo/269-150.png" },
  { "id": "188", "code": "27", "title": "27", "price": "150", "Sort by": "150", "img": "/tattoo/27-150.png" },
  { "id": "189", "code": "270", "title": "270", "price": "150", "Sort by": "150", "img": "/tattoo/270-150.png" },
  { "id": "190", "code": "271", "title": "271", "price": "150", "Sort by": "150", "img": "/tattoo/271-150.png" },
  { "id": "191", "code": "272", "title": "272", "price": "150", "Sort by": "150", "img": "/tattoo/272-150.png" },
  { "id": "192", "code": "273", "title": "273", "price": "150", "Sort by": "150", "img": "/tattoo/273-150.png" },
  { "id": "193", "code": "274", "title": "274", "price": "200", "Sort by": "200", "img": "/tattoo/274-200.png" },
  { "id": "194", "code": "275", "title": "275", "price": "150", "Sort by": "150", "img": "/tattoo/275-150.png" },
  { "id": "195", "code": "276", "title": "276", "price": "200", "Sort by": "200", "img": "/tattoo/276-200.png" },
  { "id": "196", "code": "277", "title": "277", "price": "200", "Sort by": "200", "img": "/tattoo/277-200.png" },
  { "id": "197", "code": "278", "title": "278", "price": "200", "Sort by": "200", "img": "/tattoo/278-200.png" },
  { "id": "198", "code": "279", "title": "279", "price": "150", "Sort by": "150", "img": "/tattoo/279-150.png" },
  { "id": "199", "code": "28", "title": "28", "price": "150", "Sort by": "150", "img": "/tattoo/28-150.png" },
  { "id": "200", "code": "280", "title": "280", "price": "150", "Sort by": "150", "img": "/tattoo/280-150.png" },
  { "id": "201", "code": "281", "title": "281", "price": "150", "Sort by": "150", "img": "/tattoo/281-150.png" },
  { "id": "202", "code": "282", "title": "282", "price": "200", "Sort by": "200", "img": "/tattoo/282-200.png" },
  { "id": "203", "code": "283", "title": "283", "price": "150", "Sort by": "150", "img": "/tattoo/283-150.png" },
  { "id": "204", "code": "284", "title": "284", "price": "200", "Sort by": "200", "img": "/tattoo/284-200.png" },
  { "id": "205", "code": "285", "title": "285", "price": "150", "Sort by": "150", "img": "/tattoo/285-150.png" },
  { "id": "206", "code": "286", "title": "286", "price": "150", "Sort by": "150", "img": "/tattoo/286-150.png" },
  { "id": "207", "code": "287", "title": "287", "price": "200", "Sort by": "200", "img": "/tattoo/287-200.png" },
  { "id": "208", "code": "288", "title": "288", "price": "150", "Sort by": "150", "img": "/tattoo/288-150.png" },
  { "id": "209", "code": "289", "title": "289", "price": "150", "Sort by": "150", "img": "/tattoo/289-150.png" },
  { "id": "210", "code": "29", "title": "29", "price": "100", "Sort by": "100", "img": "/tattoo/29-100.png" },
  { "id": "211", "code": "290", "title": "290", "price": "200", "Sort by": "200", "img": "/tattoo/290-200.png" },
  { "id": "212", "code": "291", "title": "291", "price": "200", "Sort by": "200", "img": "/tattoo/291-200.png" },
  { "id": "213", "code": "292", "title": "292", "price": "200", "Sort by": "200", "img": "/tattoo/292-200.png" },
  { "id": "214", "code": "293", "title": "293", "price": "200", "Sort by": "200", "img": "/tattoo/293-200.png" },
  { "id": "215", "code": "294", "title": "294", "price": "200", "Sort by": "200", "img": "/tattoo/294-200.png" },
  { "id": "216", "code": "295", "title": "295", "price": "200", "Sort by": "200", "img": "/tattoo/295-200.png" },
  { "id": "217", "code": "296", "title": "296", "price": "200", "Sort by": "200", "img": "/tattoo/296-200.png" },
  { "id": "218", "code": "297", "title": "297", "price": "200", "Sort by": "200", "img": "/tattoo/297-200.png" },
  { "id": "219", "code": "298", "title": "298", "price": "200", "Sort by": "200", "img": "/tattoo/298-200.png" },
  { "id": "220", "code": "299", "title": "299", "price": "200", "Sort by": "200", "img": "/tattoo/299-200.png" },
  { "id": "221", "code": "3", "title": "3", "price": "100", "Sort by": "100", "img": "/tattoo/3-100.png" },
  { "id": "222", "code": "30", "title": "30", "price": "150", "Sort by": "150", "img": "/tattoo/30-150.png" },
  { "id": "223", "code": "300", "title": "300", "price": "150", "Sort by": "150", "img": "/tattoo/300-150.png" },
  { "id": "224", "code": "301", "title": "301", "price": "200", "Sort by": "200", "img": "/tattoo/301-200.png" },
  { "id": "225", "code": "302", "title": "302", "price": "200", "Sort by": "200", "img": "/tattoo/302-200.png" },
  { "id": "226", "code": "303", "title": "303", "price": "200", "Sort by": "200", "img": "/tattoo/303-200.png" },
  { "id": "227", "code": "304", "title": "304", "price": "200", "Sort by": "200", "img": "/tattoo/304-200.png" },
  { "id": "228", "code": "305", "title": "305", "price": "200", "Sort by": "200", "img": "/tattoo/305-200.png" },
  { "id": "229", "code": "306", "title": "306", "price": "150", "Sort by": "150", "img": "/tattoo/306-150.png" },
  { "id": "230", "code": "307", "title": "307", "price": "150", "Sort by": "150", "img": "/tattoo/307-150.png" },
  { "id": "231", "code": "308", "title": "308", "price": "150", "Sort by": "150", "img": "/tattoo/308-150.png" },
  { "id": "232", "code": "309", "title": "309", "price": "200", "Sort by": "200", "img": "/tattoo/309-200.png" },
  { "id": "233", "code": "31", "title": "31", "price": "150", "Sort by": "150", "img": "/tattoo/31-150.png" },
  { "id": "234", "code": "310", "title": "310", "price": "200", "Sort by": "200", "img": "/tattoo/310-200.png" },
  { "id": "235", "code": "311", "title": "311", "price": "150", "Sort by": "150", "img": "/tattoo/311-150.png" },
  { "id": "236", "code": "312", "title": "312", "price": "200", "Sort by": "200", "img": "/tattoo/312-200.png" },
  { "id": "237", "code": "313", "title": "313", "price": "200", "Sort by": "200", "img": "/tattoo/313-200.png" },
  { "id": "238", "code": "314", "title": "314", "price": "200", "Sort by": "200", "img": "/tattoo/314-200.png" },
  { "id": "239", "code": "315", "title": "315", "price": "200", "Sort by": "200", "img": "/tattoo/315-200.png" },
  { "id": "240", "code": "316", "title": "316", "price": "150", "Sort by": "150", "img": "/tattoo/316-150.png" },
  { "id": "241", "code": "317", "title": "317", "price": "200", "Sort by": "200", "img": "/tattoo/317-200.png" },
  { "id": "242", "code": "318", "title": "318", "price": "200", "Sort by": "200", "img": "/tattoo/318-200.png" },
  { "id": "243", "code": "319", "title": "319", "price": "200", "Sort by": "200", "img": "/tattoo/319-200.png" },
  { "id": "244", "code": "32", "title": "32", "price": "100", "Sort by": "100", "img": "/tattoo/32-100.png" },
  { "id": "245", "code": "320", "title": "320", "price": "200", "Sort by": "200", "img": "/tattoo/320-200.png" },
  { "id": "246", "code": "321", "title": "321", "price": "200", "Sort by": "200", "img": "/tattoo/321-200.png" },
  { "id": "247", "code": "322", "title": "322", "price": "200", "Sort by": "200", "img": "/tattoo/322-200.png" },
  { "id": "248", "code": "323", "title": "323", "price": "200", "Sort by": "200", "img": "/tattoo/323-200.png" },
  { "id": "249", "code": "324", "title": "324", "price": "200", "Sort by": "200", "img": "/tattoo/324-200.png" },
  { "id": "250", "code": "325", "title": "325", "price": "200", "Sort by": "200", "img": "/tattoo/325-200.png" },
  { "id": "251", "code": "326", "title": "326", "price": "200", "Sort by": "200", "img": "/tattoo/326-200.png" },
  { "id": "252", "code": "327", "title": "327", "price": "200", "Sort by": "200", "img": "/tattoo/327-200.png" },
  { "id": "253", "code": "328", "title": "328", "price": "250", "Sort by": "250", "img": "/tattoo/328-250.png" },
  { "id": "254", "code": "329", "title": "329", "price": "200", "Sort by": "200", "img": "/tattoo/329-200.png" },
  { "id": "255", "code": "33", "title": "33", "price": "150", "Sort by": "150", "img": "/tattoo/33-150.png" },
  { "id": "256", "code": "330", "title": "330", "price": "200", "Sort by": "200", "img": "/tattoo/330-200.png" },
  { "id": "257", "code": "331", "title": "331", "price": "250", "Sort by": "250", "img": "/tattoo/331-250.png" },
  { "id": "258", "code": "332", "title": "332", "price": "250", "Sort by": "250", "img": "/tattoo/332-250.png" },
  { "id": "259", "code": "333", "title": "333", "price": "150", "Sort by": "150", "img": "/tattoo/333-150.png" },
  { "id": "260", "code": "334", "title": "334", "price": "200", "Sort by": "200", "img": "/tattoo/334-200.png" },
  { "id": "261", "code": "335", "title": "335", "price": "200", "Sort by": "200", "img": "/tattoo/335-200.png" },
  { "id": "262", "code": "336", "title": "336", "price": "200", "Sort by": "200", "img": "/tattoo/336-200.png" },
  { "id": "263", "code": "337", "title": "337", "price": "250", "Sort by": "250", "img": "/tattoo/337-250.png" },
  { "id": "264", "code": "338", "title": "338", "price": "250", "Sort by": "250", "img": "/tattoo/338-250.png" },
  { "id": "265", "code": "339", "title": "339", "price": "250", "Sort by": "250", "img": "/tattoo/339-250.png" },
  { "id": "266", "code": "34", "title": "34", "price": "150", "Sort by": "150", "img": "/tattoo/34-150.png" },
  { "id": "267", "code": "340", "title": "340", "price": "250", "Sort by": "250", "img": "/tattoo/340-250.png" },
  { "id": "268", "code": "341", "title": "341", "price": "200", "Sort by": "200", "img": "/tattoo/341-200.png" },
  { "id": "269", "code": "342", "title": "342", "price": "200", "Sort by": "200", "img": "/tattoo/342-200.png" },
  { "id": "270", "code": "343", "title": "343", "price": "200", "Sort by": "200", "img": "/tattoo/343-200.png" },
  { "id": "271", "code": "344", "title": "344", "price": "250", "Sort by": "250", "img": "/tattoo/344-250.png" },
  { "id": "272", "code": "345", "title": "345", "price": "250", "Sort by": "250", "img": "/tattoo/345-250.png" },
  { "id": "273", "code": "346", "title": "346", "price": "250", "Sort by": "250", "img": "/tattoo/346-250.png" },
  { "id": "274", "code": "347", "title": "347", "price": "200", "Sort by": "200", "img": "/tattoo/347-200.png" },
  { "id": "275", "code": "348", "title": "348", "price": "250", "Sort by": "250", "img": "/tattoo/348-250.png" },
  { "id": "276", "code": "349", "title": "349", "price": "200", "Sort by": "200", "img": "/tattoo/349-200.png" },
  { "id": "277", "code": "35", "title": "35", "price": "100", "Sort by": "100", "img": "/tattoo/35-100.png" },
  { "id": "278", "code": "350", "title": "350", "price": "250", "Sort by": "250", "img": "/tattoo/350-250.png" },
  { "id": "279", "code": "351", "title": "351", "price": "200", "Sort by": "200", "img": "/tattoo/351-200.png" },
  { "id": "280", "code": "352", "title": "352", "price": "250", "Sort by": "250", "img": "/tattoo/352-250.png" },
  { "id": "281", "code": "353", "title": "353", "price": "200", "Sort by": "200", "img": "/tattoo/353-200.png" },
  { "id": "282", "code": "354", "title": "354", "price": "300", "Sort by": "300", "img": "/tattoo/354-300.png" },
  { "id": "283", "code": "355", "title": "355", "price": "250", "Sort by": "250", "img": "/tattoo/355-250.png" },
  { "id": "284", "code": "356", "title": "356", "price": "250", "Sort by": "250", "img": "/tattoo/356-250.png" },
  { "id": "285", "code": "357", "title": "357", "price": "200", "Sort by": "200", "img": "/tattoo/357-200.png" },
  { "id": "286", "code": "358", "title": "358", "price": "200", "Sort by": "200", "img": "/tattoo/358-200.png" },
  { "id": "287", "code": "359", "title": "359", "price": "150", "Sort by": "150", "img": "/tattoo/359-150.png" },
  { "id": "288", "code": "36", "title": "36", "price": "150", "Sort by": "150", "img": "/tattoo/36-150.png" },
  { "id": "289", "code": "360", "title": "360", "price": "200", "Sort by": "200", "img": "/tattoo/360-200.png" },
  { "id": "290", "code": "361", "title": "361", "price": "150", "Sort by": "150", "img": "/tattoo/361-150.png" },
  { "id": "291", "code": "362", "title": "362", "price": "200", "Sort by": "200", "img": "/tattoo/362-200.png" },
  { "id": "292", "code": "363", "title": "363", "price": "200", "Sort by": "200", "img": "/tattoo/363-200.png" },
  { "id": "293", "code": "364", "title": "364", "price": "200", "Sort by": "200", "img": "/tattoo/364-200.png" },
  { "id": "294", "code": "365", "title": "365", "price": "200", "Sort by": "200", "img": "/tattoo/365-200.png" },
  { "id": "295", "code": "366", "title": "366", "price": "250", "Sort by": "250", "img": "/tattoo/366-250.png" },
  { "id": "296", "code": "367", "title": "367", "price": "150", "Sort by": "150", "img": "/tattoo/367-150.png" },
  { "id": "297", "code": "369", "title": "369", "price": "200", "Sort by": "200", "img": "/tattoo/369-200.png" },
  { "id": "298", "code": "37", "title": "37", "price": "150", "Sort by": "150", "img": "/tattoo/37-150.png" },
  { "id": "299", "code": "370", "title": "370", "price": "250", "Sort by": "250", "img": "/tattoo/370-250.png" },
  { "id": "300", "code": "371", "title": "371", "price": "250", "Sort by": "250", "img": "/tattoo/371-250.png" },
  { "id": "301", "code": "372", "title": "372", "price": "250", "Sort by": "250", "img": "/tattoo/372-250.png" },
  { "id": "302", "code": "373", "title": "373", "price": "250", "Sort by": "250", "img": "/tattoo/373-250.png" },
  { "id": "303", "code": "374", "title": "374", "price": "250", "Sort by": "250", "img": "/tattoo/374-250.png" },
  { "id": "304", "code": "375", "title": "375", "price": "250", "Sort by": "250", "img": "/tattoo/375-250.png" },
  { "id": "305", "code": "376", "title": "376", "price": "250", "Sort by": "250", "img": "/tattoo/376-250.png" },
  { "id": "306", "code": "377", "title": "377", "price": "300", "Sort by": "300", "img": "/tattoo/377-300.png" },
  { "id": "307", "code": "378", "title": "378", "price": "250", "Sort by": "250", "img": "/tattoo/378-250.png" },
  { "id": "308", "code": "379", "title": "379", "price": "250", "Sort by": "250", "img": "/tattoo/379-250.png" },
  { "id": "309", "code": "38", "title": "38", "price": "150", "Sort by": "150", "img": "/tattoo/38-150.png" },
  { "id": "310", "code": "380", "title": "380", "price": "250", "Sort by": "250", "img": "/tattoo/380-250.png" },
  { "id": "311", "code": "381", "title": "381", "price": "300", "Sort by": "300", "img": "/tattoo/381-300.png" },
  { "id": "312", "code": "382", "title": "382", "price": "250", "Sort by": "250", "img": "/tattoo/382-250.png" },
  { "id": "313", "code": "383", "title": "383", "price": "250", "Sort by": "250", "img": "/tattoo/383-250.png" },
  { "id": "314", "code": "384", "title": "384", "price": "250", "Sort by": "250", "img": "/tattoo/384-250.png" },
  { "id": "315", "code": "385", "title": "385", "price": "250", "Sort by": "250", "img": "/tattoo/385-250.png" },
  { "id": "316", "code": "386", "title": "386", "price": "250", "Sort by": "250", "img": "/tattoo/386-250.png" },
  { "id": "317", "code": "387", "title": "387", "price": "300", "Sort by": "300", "img": "/tattoo/387-300.png" },
  { "id": "318", "code": "388", "title": "388", "price": "300", "Sort by": "300", "img": "/tattoo/388-300.png" },
  { "id": "319", "code": "389", "title": "389", "price": "300", "Sort by": "300", "img": "/tattoo/389-300.png" },
  { "id": "320", "code": "39", "title": "39", "price": "150", "Sort by": "150", "img": "/tattoo/39-150.png" },
  { "id": "321", "code": "390", "title": "390", "price": "300", "Sort by": "300", "img": "/tattoo/390-300.png" },
  { "id": "322", "code": "391", "title": "391", "price": "300", "Sort by": "300", "img": "/tattoo/391-300.png" },
  { "id": "323", "code": "392", "title": "392", "price": "300", "Sort by": "300", "img": "/tattoo/392-300.png" },
  { "id": "324", "code": "393", "title": "393", "price": "300", "Sort by": "300", "img": "/tattoo/393-300.png" },
  { "id": "325", "code": "394", "title": "394", "price": "300", "Sort by": "300", "img": "/tattoo/394-300.png" },
  { "id": "326", "code": "395", "title": "395", "price": "300", "Sort by": "300", "img": "/tattoo/395-300.png" },
  { "id": "327", "code": "396", "title": "396", "price": "300", "Sort by": "300", "img": "/tattoo/396-300.png" },
  { "id": "328", "code": "397", "title": "397", "price": "300", "Sort by": "300", "img": "/tattoo/397-300.png" },
  { "id": "329", "code": "398", "title": "398", "price": "300", "Sort by": "300", "img": "/tattoo/398-300.png" },
  { "id": "330", "code": "399", "title": "399", "price": "300", "Sort by": "300", "img": "/tattoo/399-300.png" },
  { "id": "331", "code": "4", "title": "4", "price": "100", "Sort by": "100", "img": "/tattoo/4-100.png" },
  { "id": "332", "code": "40", "title": "40", "price": "150", "Sort by": "150", "img": "/tattoo/40-150.png" },
  { "id": "333", "code": "400", "title": "400", "price": "300", "Sort by": "300", "img": "/tattoo/400-300.png" },
  { "id": "334", "code": "41", "title": "41", "price": "150", "Sort by": "150", "img": "/tattoo/41-150.png" },
  { "id": "335", "code": "42", "title": "42", "price": "100", "Sort by": "100", "img": "/tattoo/42-100.png" },
  { "id": "336", "code": "43", "title": "43", "price": "150", "Sort by": "150", "img": "/tattoo/43-150.png" },
  { "id": "337", "code": "44", "title": "44", "price": "100", "Sort by": "100", "img": "/tattoo/44-100.png" },
  { "id": "338", "code": "45", "title": "45", "price": "100", "Sort by": "100", "img": "/tattoo/45-100.png" },
  { "id": "339", "code": "46", "title": "46", "price": "150", "Sort by": "150", "img": "/tattoo/46-150.png" },
  { "id": "340", "code": "47", "title": "47", "price": "150", "Sort by": "150", "img": "/tattoo/47-150.png" },
  { "id": "341", "code": "48", "title": "48", "price": "150", "Sort by": "150", "img": "/tattoo/48-150.png" },
  { "id": "342", "code": "49", "title": "49", "price": "150", "Sort by": "150", "img": "/tattoo/49-150.png" },
  { "id": "343", "code": "5", "title": "5", "price": "100", "Sort by": "100", "img": "/tattoo/5-100.png" },
  { "id": "344", "code": "50", "title": "50", "price": "150", "Sort by": "150", "img": "/tattoo/50-150.png" },
  { "id": "345", "code": "51", "title": "51", "price": "150", "Sort by": "150", "img": "/tattoo/51-150.png" },
  { "id": "346", "code": "52", "title": "52", "price": "150", "Sort by": "150", "img": "/tattoo/52-150.png" },
  { "id": "347", "code": "53", "title": "53", "price": "150", "Sort by": "150", "img": "/tattoo/53-150.png" },
  { "id": "348", "code": "54", "title": "54", "price": "150", "Sort by": "150", "img": "/tattoo/54-150.png" },
  { "id": "349", "code": "55", "title": "55", "price": "100", "Sort by": "100", "img": "/tattoo/55-100.png" },
  { "id": "350", "code": "56", "title": "56", "price": "150", "Sort by": "150", "img": "/tattoo/56-150.png" },
  { "id": "351", "code": "57", "title": "57", "price": "150", "Sort by": "150", "img": "/tattoo/57-150.png" },
  { "id": "352", "code": "58", "title": "58", "price": "150", "Sort by": "150", "img": "/tattoo/58-150.png" },
  { "id": "353", "code": "59", "title": "59", "price": "150", "Sort by": "150", "img": "/tattoo/59-150.png" },
  { "id": "354", "code": "6", "title": "6", "price": "100", "Sort by": "100", "img": "/tattoo/6-100.png" },
  { "id": "355", "code": "60", "title": "60", "price": "150", "Sort by": "150", "img": "/tattoo/60-150.png" },
  { "id": "356", "code": "61", "title": "61", "price": "150", "Sort by": "150", "img": "/tattoo/61-150.png" },
  { "id": "357", "code": "62", "title": "62", "price": "150", "Sort by": "150", "img": "/tattoo/62-150.png" },
  { "id": "358", "code": "63", "title": "63", "price": "150", "Sort by": "150", "img": "/tattoo/63-150.png" },
  { "id": "359", "code": "64", "title": "64", "price": "150", "Sort by": "150", "img": "/tattoo/64-150.png" },
  { "id": "360", "code": "65", "title": "65", "price": "150", "Sort by": "150", "img": "/tattoo/65-150.png" },
  { "id": "361", "code": "66", "title": "66", "price": "150", "Sort by": "150", "img": "/tattoo/66-150.png" },
  { "id": "362", "code": "67", "title": "67", "price": "150", "Sort by": "150", "img": "/tattoo/67-150.png" },
  { "id": "363", "code": "68", "title": "68", "price": "150", "Sort by": "150", "img": "/tattoo/68-150.png" },
  { "id": "364", "code": "69", "title": "69", "price": "200", "Sort by": "200", "img": "/tattoo/69-200.png" },
  { "id": "365", "code": "7", "title": "7", "price": "100", "Sort by": "100", "img": "/tattoo/7-100.png" },
  { "id": "366", "code": "70", "title": "70", "price": "150", "Sort by": "150", "img": "/tattoo/70-150.png" },
  { "id": "367", "code": "71", "title": "71", "price": "150", "Sort by": "150", "img": "/tattoo/71-150.png" },
  { "id": "368", "code": "72", "title": "72", "price": "150", "Sort by": "150", "img": "/tattoo/72-150.png" },
  { "id": "369", "code": "73", "title": "73", "price": "150", "Sort by": "150", "img": "/tattoo/73-150.png" },
  { "id": "370", "code": "74", "title": "74", "price": "150", "Sort by": "150", "img": "/tattoo/74-150.png" },
  { "id": "371", "code": "75", "title": "75", "price": "150", "Sort by": "150", "img": "/tattoo/75-150.png" },
  { "id": "372", "code": "76", "title": "76", "price": "150", "Sort by": "150", "img": "/tattoo/76-150.png" },
  { "id": "373", "code": "77", "title": "77", "price": "150", "Sort by": "150", "img": "/tattoo/77-150.png" },
  { "id": "374", "code": "78", "title": "78", "price": "150", "Sort by": "150", "img": "/tattoo/78-150.png" },
  { "id": "375", "code": "79", "title": "79", "price": "150", "Sort by": "150", "img": "/tattoo/79-150.png" },
  { "id": "376", "code": "8", "title": "8", "price": "100", "Sort by": "100", "img": "/tattoo/8-100.png" },
  { "id": "377", "code": "80", "title": "80", "price": "150", "Sort by": "150", "img": "/tattoo/80-150.png" },
  { "id": "378", "code": "81", "title": "81", "price": "100", "Sort by": "100", "img": "/tattoo/81-100.png" },
  { "id": "379", "code": "82", "title": "82", "price": "150", "Sort by": "150", "img": "/tattoo/82-150.png" },
  { "id": "380", "code": "83", "title": "83", "price": "150", "Sort by": "150", "img": "/tattoo/83-150.png" },
  { "id": "381", "code": "84", "title": "84", "price": "150", "Sort by": "150", "img": "/tattoo/84-150.png" },
  { "id": "382", "code": "85", "title": "85", "price": "150", "Sort by": "150", "img": "/tattoo/85-150.png" },
  { "id": "383", "code": "86", "title": "86", "price": "150", "Sort by": "150", "img": "/tattoo/86-150.png" },
  { "id": "384", "code": "87", "title": "87", "price": "100", "Sort by": "100", "img": "/tattoo/87-100.png" },
  { "id": "385", "code": "88", "title": "88", "price": "150", "Sort by": "150", "img": "/tattoo/88-150.png" },
  { "id": "386", "code": "89", "title": "89", "price": "150", "Sort by": "150", "img": "/tattoo/89-150.png" },
  { "id": "387", "code": "9", "title": "9", "price": "100", "Sort by": "100", "img": "/tattoo/9-100.png" },
  { "id": "388", "code": "90", "title": "90", "price": "150", "Sort by": "150", "img": "/tattoo/90-150X3.png" },
  { "id": "389", "code": "91", "title": "91", "price": "100", "Sort by": "100", "img": "/tattoo/91-100.png" },
  { "id": "390", "code": "92", "title": "92", "price": "150", "Sort by": "150", "img": "/tattoo/92-150.png" },
  { "id": "391", "code": "93", "title": "93", "price": "150", "Sort by": "150", "img": "/tattoo/93-150.png" },
  { "id": "392", "code": "94", "title": "94", "price": "150", "Sort by": "150", "img": "/tattoo/94-150.png" },
  { "id": "393", "code": "95", "title": "95", "price": "100", "Sort by": "100", "img": "/tattoo/95-100.png" },
  { "id": "394", "code": "96", "title": "96", "price": "150", "Sort by": "150", "img": "/tattoo/96-150.png" },
  { "id": "395", "code": "97", "title": "97", "price": "150", "Sort by": "150", "img": "/tattoo/97-150.png" },
  { "id": "396", "code": "98", "title": "98", "price": "100", "Sort by": "100", "img": "/tattoo/98-100.png" }
];

export default function Gallery() {
  const router = useRouter();
  
  const [inventory] = useState(MANUAL_INVENTORY);
  const [displayedItems, setDisplayedItems] = useState(MANUAL_INVENTORY);
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTattoos, setSelectedTattoos] = useState<any[]>([]);
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [hasRewardShown, setHasRewardShown] = useState(false); // FIXED: Prevent repeated pop-ups
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Top 5 Highest Priced for New Arrivals
  const newArrivals = useMemo(() => {
    return [...inventory]
      .sort((a, b) => parseInt(String(b["Sort by"]), 10) - parseInt(String(a["Sort by"]), 10))
      .slice(0, 5);
  }, [inventory]);

  // Derived Search Suggestions
  const searchSuggestions = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const q = searchQuery.toLowerCase();
      return inventory.filter(t => 
        String(t.code || '').toLowerCase().includes(q) || 
        String(t.price || '').toLowerCase().includes(q)
      );
  }, [searchQuery, inventory]);

  // Init Cart
  useEffect(() => {
    localStorage.removeItem('tattoo_cart'); 
    setSelectedTattoos([]); 
  }, []);

  useEffect(() => {
    if (selectedTattoos.length > 0) {
        localStorage.setItem('tattoo_cart', JSON.stringify(selectedTattoos));
    }
  }, [selectedTattoos]);

  useEffect(() => {
    let result = [...inventory];
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        String(t.code || '').toLowerCase().includes(q) || 
        String(t.price || '').toLowerCase().includes(q)
      );
    }

    // Price Filter
    if (activePriceRange && activePriceRange !== 'Low to High' && activePriceRange !== 'High to Low') {
        const targetPrice = parseInt(activePriceRange, 10);
        result = result.filter(t => {
            const p = parseInt(String(t["Sort by"]), 10) || 0;
            return p === targetPrice;
        });
    }

    // Dynamic Sorting
    result.sort((a, b) => {
        const priceA = parseInt(String(a["Sort by"]), 10) || 0;
        const priceB = parseInt(String(b["Sort by"]), 10) || 0;
        
        if (activePriceRange === 'High to Low') {
            return priceB - priceA;
        }
        return priceA - priceB;
    });

    setDisplayedItems(result);
  }, [activePriceRange, searchQuery, inventory]);

  const handleSelect = (tattoo: any) => {
    if (selectedTattoos.find(t => t.id === tattoo.id)) return;
    
    // FIX: Show Reward Card only ONCE per session using 'hasRewardShown' lock
    if (!hasRewardShown) {
        setShowReward(true);
        setHasRewardShown(true);
        setTimeout(() => setShowReward(false), 2500);
    }
    setSelectedTattoos(prev => [...prev, { ...tattoo, addedAt: Date.now() }]);
  };

  const handleRemoveItem = (id: string) => {
    const newList = selectedTattoos.filter(t => t.id !== id);
    setSelectedTattoos(newList);
    if (newList.length === 0) setShowCartOverlay(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans relative overflow-x-hidden">
      
      {/* 1. FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] h-[74px] flex items-center justify-between px-[20px]">
         <div className="flex flex-col justify-center">
            <p className="text-[10px] text-[#16161B] font-inter tracking-widest lowercase mb-[2px]" style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>welcome to</p>
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-[0.9]" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
              TATTOO<br/>TATTVA
            </h1>
         </div>
         <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-1">
            <Search size={24} strokeWidth={1.5} color="#16161B" />
         </button>
      </header>
      
      <div className="fixed top-[74px] left-0 right-0 z-50 h-[2px]" style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)' }} />

      {/* SEARCH BAR & SUGGESTIONS */}
      <AnimatePresence>
        {isSearchOpen && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} 
                className="fixed top-[76px] left-0 right-0 z-40 bg-[#FFFFFF] px-[20px] py-[12px] shadow-sm border-b border-gray-100">
                <div className="relative w-full">
                    <div className="w-full h-[46px] bg-gray-50 rounded-full border border-gray-200 flex items-center px-[16px]">
                        <Search size={18} className="text-gray-400 mr-[8px]" />
                        <input autoFocus type="text" placeholder="Search code..." className="flex-1 bg-transparent outline-none text-[#16161B] text-[14px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400"/></button>}
                    </div>
                    {searchQuery && searchSuggestions.length > 0 && (
                        <div className="absolute top-[100%] mt-[8px] left-0 right-0 bg-[#FFFFFF] rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 max-h-[240px] overflow-y-auto z-50">
                            {searchSuggestions.slice(0, 5).map(item => (
                                <div key={`suggest-${item.id}`} onClick={() => { handleSelect(item); setSearchQuery(''); setIsSearchOpen(false); }} 
                                     className="flex items-center px-[16px] py-[10px] border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <img src={item.img} className="w-[36px] h-[36px] object-contain mix-blend-multiply" />
                                    <span className="ml-[12px] font-inter text-[13px] font-medium text-[#16161B]">Code-{item.code}</span>
                                    <span className="ml-auto font-inter text-[13px] font-bold text-[#F74B33]">Rs. {item.price}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-[76px]">
          
          {/* NEW ARRIVALS HORIZONTAL SCROLL */}
          <section className="bg-[#FFFFFF] pt-[24px] pb-[8px]">
              <div className="px-[20px] mb-[16px]">
                  <h2 className="text-[18px] text-[#16161B] font-inter font-normal">New Arrivals</h2>
              </div>
              <div className="flex gap-[16px] overflow-x-auto px-[20px] pb-[16px] pt-[4px] no-scrollbar">
                  {newArrivals.map((item) => {
                      const isSelected = selectedTattoos.find(t => t.id === item.id);
                      return (
                        <div key={`new-${item.id}`} onClick={() => handleSelect(item)} className="shrink-0 cursor-pointer" style={{ width: '260px', height: '220px' }}>
                            <div style={{
                                background: isSelected ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                                padding: '1px',
                                borderRadius: '12px',
                                width: '100%', height: '100%',
                                boxShadow: '4px 4px 10px rgba(0,0,0,0.15)'
                            }}>
                                <div style={{ background: '#FFFFFF', borderRadius: '11px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                        <img src={item.img} alt={item.code} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </section>

          {/* STICKY "SORT BY" ROW */}
          <div className="sticky top-[76px] z-30 w-full flex flex-col">
              <div className="w-full h-[1px] bg-[#F74B33]" />
              
              <div className="bg-[#FFFFFF] px-[20px] py-[12px] flex flex-col gap-[12px]">
                  <div className="flex justify-end">
                      <div style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', borderRadius: '999px' }}>
                          <button onClick={() => setIsSortOpen(!isSortOpen)} style={{ background: '#FFFFFF', borderRadius: '999px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <SlidersHorizontal size={14} color="#000000" strokeWidth={2} />
                              <span className="font-inter text-[14px] text-[#000000]">Sort by</span>
                          </button>
                      </div>
                  </div>

                  <AnimatePresence>
                      {isSortOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center gap-[8px] overflow-x-auto no-scrollbar pb-1">
                              {PRICE_RANGES.map((range) => {
                                  const isActive = activePriceRange === range;
                                  return (
                                    <button key={range} onClick={() => setActivePriceRange(isActive ? null : range)} 
                                        style={{ 
                                            background: isActive ? '#F74B33' : '#FFFFFF', 
                                            border: isActive ? '1px solid #F74B33' : '1px solid #CCCCCC',
                                            color: isActive ? '#FFFFFF' : '#666666',
                                            borderRadius: '999px', padding: '6px 16px', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 600 : 400, flexShrink: 0 
                                        }}>
                                        {range}
                                    </button>
                                  );
                              })}
                              {activePriceRange && (
                                  <button onClick={() => setActivePriceRange(null)} style={{ border: '1px solid #CCCCCC', borderRadius: '8px', padding: '6px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <X size={16} color="#666666" />
                                  </button>
                              )}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>

          {/* MAIN GRID */}
          <main className="w-full px-[20px] py-[16px] pb-[160px]">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '15px', rowGap: '15px' }}>
                {displayedItems.map((item) => {
                    const isSelected = selectedTattoos.find(t => t.id === item.id);
                    return (
                      <div key={item.id} onClick={() => handleSelect(item)} className="cursor-pointer">
                        <div style={{
                            background: isSelected ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                            padding: '1px',
                            borderRadius: '12px',
                            boxShadow: isSelected ? '4px 4px 10px rgba(0,0,0,0.15)' : 'none'
                        }}>
                            <div style={{ background: '#FFFFFF', borderRadius: '11px', display: 'flex', flexDirection: 'column', padding: '5px' }}>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ width: '100%', aspectRatio: '1/1', maxHeight: '165px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                        <img src={item.img} alt={item.code} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} loading="lazy" />
                                    </div>
                                </div>
                                <div style={{ padding: '8px 12px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#16161B' }}>Code-{item.code}</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#F74B33' }}>Rs. {item.price}</span>
                                </div>
                            </div>
                        </div>
                      </div>
                    );
                })}
             </div>
          </main>
      </div>

      {/* UPGRADED REWARD CARD OVERLAY */}
      <AnimatePresence>
        {showReward && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                <motion.div 
                    initial={{ scale: 0.8, rotate: -5 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    exit={{ scale: 0.8, opacity: 0 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="bg-[#FFFFFF] rounded-[24px] py-[40px] px-[24px] flex flex-col items-center shadow-2xl w-full max-w-[340px] text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#F74B33] to-[#FFB6AB]" />
                    <div className="w-[64px] h-[64px] bg-[#F74B33]/10 rounded-full flex items-center justify-center mb-6">
                        <Zap size={32} className="text-[#F74B33] fill-[#F74B33]" />
                    </div>
                    <h2 className="text-[#16161B] text-[24px] font-extrabold leading-tight font-inter mb-2">
                        Your Ink Journey<br/>Has Started
                    </h2>
                    <p className="text-[#666666] text-[13px] font-inter">Great choice! Add more designs or proceed to checkout.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CART BOTTOM BAR */}
      {selectedTattoos.length > 0 && !showReward && !showCartOverlay && (
         <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={{
             position: 'fixed', bottom: '24px', left: '24px', right: '24px', zIndex: 80,
             background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', borderRadius: '12px',
             boxShadow: '4px 4px 10px rgba(0,0,0,0.1)'
         }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '11px', padding: '10px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <button onClick={() => setShowCartOverlay(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#16161B" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.51C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
                    </svg>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: '#16161B' }}>Tattoo Cart</span>
                    
                    <div style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', padding: '2px', borderRadius: '4px' }}>
                        <div style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#16161B', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{selectedTattoos.length}</span>
                        </div>
                    </div>
                </button>
                
                <button onClick={() => router.push('/checkout')} style={{
                    background: '#F74B33', borderRadius: '6px', padding: '10px 16px',
                    color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase'
                }}>
                    BOOK SESSION
                </button>
            </div>
         </motion.div>
      )}

      {/* EXPANDED CART OVERLAY */}
      <AnimatePresence>
        {showCartOverlay && (
            <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartOverlay(false)} className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 z-[95] bg-[#FFFFFF] rounded-t-[24px] shadow-2xl p-[24px] pb-[40px] max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-[24px]">
                    <h2 className="text-[20px] font-bold text-[#16161B]" style={{ fontFamily: 'var(--font-abhaya), serif' }}>YOUR CART</h2>
                    <button onClick={() => setShowCartOverlay(false)}><ChevronUp size={24} className="rotate-180 text-[#16161B]" /></button>
                </div>
                <div className="space-y-[16px] mb-[32px]">
                    {selectedTattoos.map((item) => (
                        <div key={item.addedAt} className="flex justify-between items-center bg-gray-50 p-[12px] rounded-[12px] border border-gray-100">
                            <div className="flex items-center gap-[16px]">
                                <img src={item.img} className="w-[48px] h-[48px] object-contain mix-blend-multiply" />
                                <div>
                                    <p className="font-bold text-[14px] text-[#16161B] font-inter">Code-{item.code}</p>
                                    <p className="text-[12px] text-[#F74B33] font-bold font-inter">Rs. {item.price}</p>
                                </div>
                            </div>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-[#F74B33] p-[8px]"><X size={18} /></button>
                        </div>
                    ))}
                </div>
                <button onClick={() => router.push('/checkout')} className="w-full h-[56px] bg-[#F74B33] text-[#FFFFFF] rounded-[12px] font-bold text-[14px] uppercase font-inter tracking-wide shadow-lg">
                    PROCEED TO BOOKING
                </button>
            </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
}