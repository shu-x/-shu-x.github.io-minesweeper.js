/**
 * マインスイーパのテーブル作成のクラス
 * 
 * 以下参考
 * マインスイーパの原型
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
    }

    init(x, y, bombFlg){
        this.openedFlg = false;
        this.x = x;
        this.y = y;
        this.bombFlg = bombFlg;
        this.classList.add('closed');
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
            this.textContent = '爆';
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
        }else if(this.textContent === '旗'){
            // 何もしない
            console.log('the cell is flag!');
            return;
        }else{
            this.openedFlg=true;
            this.show();

            if(this.bombFlg){ // 爆弾なら
                msCells.forEach(c => c.show());
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
                this.textContent = '旗';
            }else if(this.textContent === '旗'){
                this.textContent = '';
            }
        }
    }
}

/**
 * ゲームオーバーの処理
 */
function gameOver(){

}

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
        msCell.addEventListener('click', ()=> {
            msCell.open();
            // GAME OVERの判定
            if(msCells.filter(c => !c.openedFlg).length <= 0){
                alert('Game over');
            }
        });
        msCell.addEventListener('contextmenu', (event)=> {
            event.preventDefault();
            msCell.setFlg();
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


initGame(15, 15);