#!/usr/bin/env python3
"""Export a derived frequency table from the `wordfreq` package (CC BY-SA 4.0 data).
Run with a venv that has wordfreq installed:  python build_freq.py <out.tsv>
Columns: rank, word, zipf (log10 freq per billion words, wordfreq 'en' large list)."""
import sys
from wordfreq import top_n_list, zipf_frequency
out = sys.argv[1]
with open(out, "w", encoding="utf-8") as f:
    f.write("rank\tword\tzipf\n")
    for i, w in enumerate(top_n_list("en", 60000, wordlist="large"), 1):
        f.write(f"{i}\t{w}\t{zipf_frequency(w,'en',wordlist='large'):.2f}\n")
