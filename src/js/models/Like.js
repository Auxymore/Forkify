export default class Like {
  constructor(){
    this.like = [];
  }

  addLike(id, title, author, img){
    const likes = {id, title, author, img};
    this.like.push(likes);

    //Persist data in localStorage
    this.persistData();

    return likes;
  }

  deleteLike(id){
    const index = this.like.findIndex(el => el.id === id);
    this.like .splice(index, 1);

    //Persist data in localStorage
    this.persistData();

  }

  isLiked(id){
    return this.like.findIndex(el => el.id === id) !== -1;
  }

  getnumLike(id){
    return this.like.length;
  }

  persistData(){
    localStorage.setItem("like", JSON.stringify(this.like));
  }

  readStorage(){
    const storage = JSON.parse(localStorage.getItem("like"));

    // Restoring likes from local readStorage
    if(storage) this.like = storage;
  }
}
