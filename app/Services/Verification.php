<?php
namespace App\Services;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
class Verification {
 public function ready(): bool { return filled(config('services.resend.key')) || (config('mail.default')==='smtp' && filled(config('mail.mailers.smtp.host'))); }
 public function send(User $u): void {
 abort_unless($this->ready(),503,'Configure SMTP or Resend verification email in .env first.');
 if($u->email_verified_at || $u->verification_exempt) return;
 $token=bin2hex(random_bytes(32)); $u->forceFill(['verification_hash'=>hash('sha256',$token),'verification_expires'=>now()->addMinutes(30)])->save();
 $url=url('/api/admin/verify-email?token='.$token); $text='Verify your Pixode email: '.$url."\nThis link expires in 30 minutes.";
 if(config('services.resend.key')) { Http::withToken(config('services.resend.key'))->post('https://api.resend.com/emails',['from'=>config('mail.from.name').' <'.config('mail.from.address').'>','to'=>[$u->email],'subject'=>'Verify your Pixode email','text'=>$text])->throw(); }
 else Mail::raw($text,fn($m)=>$m->to($u->email)->subject('Verify your Pixode email'));
 }
}
