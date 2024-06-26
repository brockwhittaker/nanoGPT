# Setup
```
git clone https://github.com/brockwhittaker/nanoGPT.git
cd nanoGPT

curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-00
curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-01
curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-02
curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-03
curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-04
curl -O -L https://github.com/GermanT5/wikipedia2corpus/releases/download/v1.0/enwiki-20220201-clean-part-05

cat enwiki-20220201-clean-part-* > enwiki-20220201-clean.zip

# go to a new tab to see when this is done
# if you `ls lh` you can see it's size grow, when it reaches around 14gb it's done—you'll see it stop inflating in size.
unzip enwiki-20220201-clean.zip

mv enwiki-20220201-clean.txt data/wiki/enwiki.txt

# 10,000,000 lines = 1.7gb
tail -n 100000000 data/wiki/enwiki.txt > data/wiki/input.txt

curl -fsSL https://bun.sh/install | bash
source /root/.bashrc

cd data/wiki && bun prepare.ts
```

Then you can run your command, this one is default:

```
python train.py config/train_wiki.py --compile=False --eval_iters=20 --log_interval=1 --block_size=64 --batch_size=12 --n_layer=4 --n_head=4 --n_embd=128 --max_iters=100000 --lr_decay_iters=2000 --dropout=0.0

python sample.py --out_dir=out-wiki-2 --start="Ame"
```

# train 1
python train.py config/train_wiki.py --compile=False --eval_iters=20 --log_interval=1 --block_size=64 --batch_size=12 --n_layer=4 --n_head=4 --n_embd=128 --max_iters=2000 --lr_decay_iters=2000 --dropout=0.0
# loss = 1.9919, avg time = 23ms

# train 2
python train.py config/train_wiki.py --compile=False --eval_iters=20 --log_interval=1 --block_size=64 --batch_size=12 --n_layer=4 --n_head=4 --n_embd=128 --max_iters=100000 --lr_decay_iters=2000 --dropout=0.0
# loss = 1.5162 , avg time = 23ms


---

new system:

# train 1
python train.py config/train_wiki.py --compile=False --eval_iters=20 --log_interval=1 --block_size=64 --batch_size=12 --n_layer=4 --n_head=4 --n_embd=128 --max_iters=2000 --lr_decay_iters=2000 --dropout=0.0
# loss = 2.0768, avg time = > 23ms (it was super high variance with steps starting in the 100s of ms, but decreasing).

# train 2
python train.py config/train_wiki.py --compile=False --eval_iters=20 --log_interval=1 --block_size=64 --batch_size=12 --n_layer=4 --n_head=4 --n_embd=128 --max_iters=100000 --lr_decay_iters=2000 --dropout=0.0
# loss = ??, avg time = 15ms (it was low and instantly fast this time)
