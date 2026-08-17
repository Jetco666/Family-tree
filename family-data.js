// ============================================================
// DATA FAMILY TREE
// Edit file ini untuk mengganti data keluarga.
// id harus unik. parentIds berisi id orang tua.
// spouseIds berisi id pasangan.
// ============================================================
const FAMILY_DATA = [
  {id:"p1",name:"Ahmad Santoso",gender:"M",birth:"1935",death:"2010",city:"Tanjungpinang",photo:"",bio:"Generasi pertama keluarga."},
  {id:"p2",name:"Siti Aminah",gender:"F",birth:"1938",death:"2018",city:"Tanjungpinang",photo:"",bio:"Generasi pertama keluarga."},

  {id:"p3",name:"Budi Santoso",gender:"M",birth:"1960",city:"Batam",parentIds:["p1","p2"],spouseIds:["p4"],photo:"",bio:"Putra pertama Ahmad dan Siti."},
  {id:"p4",name:"Ani Rahma",gender:"F",birth:"1963",city:"Batam",spouseIds:["p3"],photo:"",bio:"Pasangan Budi."},

  {id:"p5",name:"Citra Santoso",gender:"F",birth:"1965",city:"Tanjungpinang",parentIds:["p1","p2"],spouseIds:["p6"],photo:"",bio:"Putri kedua Ahmad dan Siti."},
  {id:"p6",name:"Dedi Wijaya",gender:"M",birth:"1962",city:"Jakarta",spouseIds:["p5"],photo:"",bio:"Pasangan Citra."},

  {id:"p7",name:"Eko Santoso",gender:"M",birth:"1987",city:"Batam",parentIds:["p3","p4"],photo:"",bio:"Anak pertama Budi dan Ani."},
  {id:"p8",name:"Fani Santoso",gender:"F",birth:"1990",city:"Batam",parentIds:["p3","p4"],photo:"",bio:"Anak kedua Budi dan Ani."},
  {id:"p9",name:"Gita Wijaya",gender:"F",birth:"1992",city:"Jakarta",parentIds:["p5","p6"],photo:"",bio:"Anak pertama Citra dan Dedi."}
];