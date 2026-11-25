<?php
namespace App\Services;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\Process\Process;
class Passwords {
 public function verify(User $u,string $password): bool {
 if($u->password_scheme==='laravel') return password_verify($password,$u->password);
 if($u->password_scheme==='identity') {
 $b=base64_decode($u->password,true); if(!$b || strlen($b)<49 || ord($b[0])!==1) return false;
 $h=unpack('Nprf/Niterations/Nsalt',substr($b,1,12)); $algorithm=[0=>'sha1',1=>'sha256',2=>'sha512'][$h['prf']] ?? null;
 if(!$algorithm || $h['iterations']<1 || $h['iterations']>1000000 || $h['salt']<16 || $h['salt']>128 || strlen($b)<=13+$h['salt']) return false;
 $expected=substr($b,13+$h['salt']); return hash_equals($expected,hash_pbkdf2($algorithm,$password,substr($b,13,$h['salt']),$h['iterations'],strlen($expected),true));
 }
 if($u->password_scheme==='legacy-scrypt') {
 $code="let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const p=JSON.parse(s),c=require('crypto');const a=c.scryptSync(p.password,p.salt,64,{N:16384,r:8,p:1}),b=Buffer.from(p.hash,'hex');process.stdout.write(a.length===b.length&&c.timingSafeEqual(a,b)?'yes':'no');});";
 $p=new Process([config('pixode.node_binary'),'-e',$code]); $p->setInput(json_encode(['password'=>$password,'salt'=>$u->legacy_salt,'hash'=>$u->password])); $p->setTimeout(10); $p->run(); return $p->isSuccessful() && $p->getOutput()==='yes';
 }
 return false;
 }
 public function upgrade(User $u,string $password): void { if($u->password_scheme!=='laravel') { $u->forceFill(['password'=>Hash::make($password),'password_scheme'=>'laravel','legacy_salt'=>null])->save(); } }
}
