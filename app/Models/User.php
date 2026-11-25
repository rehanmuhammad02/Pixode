<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class User extends Authenticatable {
 use Notifiable, HasFactory;
 protected $guarded = ['id'];
 protected $hidden = ['password','remember_token','legacy_salt','verification_hash','security_stamp'];
 protected function casts(): array { return ['email_verified_at'=>'datetime','verification_expires'=>'datetime','verification_exempt'=>'boolean']; }
 public function dto(): array { return ['id'=>(string)$this->id,'name'=>$this->name,'email'=>$this->email,'username'=>$this->username ?? '', 'role'=>$this->role,'verified'=>(bool)($this->verification_exempt || $this->email_verified_at),'verificationExempt'=>$this->verification_exempt,'provider'=>$this->google_id ? 'google':'email']; }
}
