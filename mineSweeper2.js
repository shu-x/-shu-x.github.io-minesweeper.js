/**
 * マインスイーパのテーブル作成のクラス
 * 
 * 以下参考
 * マインスイーパの原型
 * https://qiita.com/kbtknc/items/e6a753d10f00d9d32549
 * 
 * 要素の拡張
 * https://sbfl.net/blog/2016/09/01/custom-elements-v1/
 * 
 * filter()メソッド
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 * 
 * ContextMenus
 * https://developer.mozilla.org/ja/docs/Archive/Mozilla/XUL/PopupGuide/ContextMenus
 * 
 */


/**
 * HTMLTableCellElementを拡張したクラス
 */
class MineSweeperCell extends HTMLTableCellElement{
    constructor(){
        super();
        this.debug=false;
        this.flgsymbol='🚩';
        this.bombsymbol='💣';
    }

    init(x, y, bombFlg){
        this.openedFlg = false;
        this.x = x;
        this.y = y;
        this.bombFlg = bombFlg;
        this.flg=false;
        this.classList.add('closed');
        if(this.debug){
            if(this.bombFlg){
                this.classList.remove('closed');
                this.classList.add('.debug_closed');
            }
        }
        // this.isGameOver=false;
    }

    showOpened(){
        this.classList.remove('closed');
        this.classList.add('opened');
        console.log('open');
    }

    showBomb(){
        this.classList.remove('closed');
        this.classList.add('bombed');
        console.log('the cell is bomb');
    }

    // フラグクラスをセット
    // closedで呼び出される
    showFlg(){
        this.classList.remove('closed');
        this.classList.add('flg');
        console.log('the cell is flag');
    }

    setArounds(arounds){
        this.arounds = arounds;
        this.aroundBombCount = this.arounds.filter(around => around.bombFlg).length;
        console.log('set around!!' + 'bomb-count is' + this.aroundBombCount);
    }

    show(){
        this.openedFlg=true;
        if(this.bombFlg){
            this.textContent = this.bombsymbol;
            this.showBomb();
        }else{  // 爆弾でない
            if(this.aroundBombCount > 0){
                this.textContent = this.aroundBombCount;
                console.log('爆弾のカウント' + this.textContent);
            }
            this.showOpened();
        }
    }

    /**
     * クリックしたときに，cellを開くメソッド
     * NOTE: return 'game over'としてもいいかも？
     */
    open(){
        // console.trace();
        if(this.openedFlg){
            // 何もしない
            console.log('the cell has opened!');
            return;
        }else if(this.textContent === this.flgsymbol){
            // 何もしない
            console.log('the cell is flag!');
            return;
        }else{
            this.openedFlg=true;
            this.show();

            if(this.bombFlg){ // 爆弾なら
                msCells.forEach(c => c.show());
                return 1;
            }else{
                if(this.aroundBombCount === 0){
                    console.log('arounds open, because arounds is no bomb');
                    this.arounds.forEach(around => around.open());
                }
            }
        }
    }

    setFlg(){
        if(this.openedFlg){
            // 何もしない
        }else{
            if(this.textContent === ''){
                this.textContent = this.flgsymbol;
                this.flg=true;
                console.log('seted flag');
            }else if(this.textContent === this.flgsymbol){
                this.textContent = '';
                this.flg=false;
                console.log('unseted flag');
            }
        }
    }
}


/**
 * クリックされたときの処理
 * @param  
 */
function onClick(e){
    let g = this.msCell.open();  // GAMEOVERなら1
    // GAME OVERの判定
    if(g === 1){
        msCells.forEach(c => {
            c.show()
            // c.removeEventListener('click', {msCell: this.msCell, handleEvent: onClick});
        });
        alert('Game over');
    }
}

// カスタム要素の追加
customElements.define('ms-td', MineSweeperCell, { extends: 'td' });

let msCells=[];

let initGame = (xSize, ySize) => {
    let targetElement = document.getElementById('target');
    // cellの配置
    for(let y = 0; y < ySize; y++){
        let tr = document.createElement('tr');
        for(let x = 0; x < xSize; x++){
            // cellの作成
            let msCell = document.createElement('td', {is: 'ms-td'});
            // cellの初期化
            msCell.init(x, y, Math.random()*100 < 10);
            tr.appendChild(msCell);
            msCells.push(msCell);
        }
        targetElement.appendChild(tr);
    }
    // console.table(msCells);

    msCells.forEach(msCell => {
        msCell.addEventListener('click', {msCell: msCell, handleEvent: onClick});
        msCell.addEventListener('contextmenu', (event)=> {
            event.preventDefault();
            msCell.setFlg();

            // すべての爆弾にのみ，Flgがあれば成功
            let clear = true;
            msCells.forEach(c =>{
                // xor
                if((c.bombFlg && !c.flg) || (!c.bombFlg && c.flg)){
                    clear = false
                }
            });
            console.log('clear is '+ clear);
            if(clear){
                msCells.forEach(c => {
                    c.show()
                    // c.removeEventListener('click', {msCell: this.msCell, handleEvent: onClick});
                });
                alert('Clear!!!');
            }
        });

        // 周囲8マスを設定
        let arounds = msCells.filter(other => {
            if(msCell === other){
                return false;
            }

            // 周囲のcellを数えるための範囲を指定
            let xArea = [msCell.x - 1, msCell.x, msCell.x + 1];
            let yArea = [msCell.y - 1, msCell.y, msCell.y + 1];
            if(xArea.indexOf(other.x) != -1 && yArea.indexOf(other.y) != -1){
                // console.log('around');
                return true;
            }
            return false;
        });
        // console.table(arounds);
        msCell.setArounds(arounds);
    }); 
}


initGame(10, 10);