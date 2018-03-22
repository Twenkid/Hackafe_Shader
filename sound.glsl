/* 
  "Hackafe Logo" - exercise #1. Version: 27.12.2017
  "Author"/(formulas player) - Todor "Tosh" Arnaudov, 27-12-2017
   Hackafe hackerspace - Plovdiv, Bulgaria. Currently hibernated: http://www.hackafe.org/
   
   https://www.shadertoy.com/view/4lffzf
*/

//jerome, Electricity
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm8(vec2 n) {
    float total = 0.0, amplitude = 1.0;
    for (int i = 0; i < 16; i++) {
        total += noise(n)/2. * amplitude;
        n += n;
        amplitude *= 0.5;
        //amplitude *= 0.33;
    }
    return total;
}

float fbm16(vec2 n) {
    float total = 0.0, amplitude = 1.0;
    for (int i = 0; i < 16; i++) {
        total += noise(n)/2. * amplitude;
        n += n;
        amplitude *= 0.25;
        //amplitude *= 0.33;
    }
    return total;
}


vec2 mainSound( float time )
{
    //vec2 s1 = vec2( sin(6.2831*440.0*time)*exp(-3.0*time) );
    //vec2 s2 = vec2(sin(440.+fbm8(vec2(time))*100.*mod(time,10.))+fbm8(vec2(time)))*2.;
    //vec2 s2 = vec2(sin(440.+fbm8(vec2(time))*100.*exp(fract(time)*12.))+fbm8(vec2(time)))*1.;
   // vec2 s2 = vec2(sin(440.+fbm8(vec2(time))*100.*sin(exp(fract(time)*12.)))+fbm8(vec2(time)))*1.; //laser :))
    //vec2 s1 = vec2(sin(440.+fbm8(vec2(time/3.))*200.*exp(fract(time/20.)*12.))+fbm16(vec2(time)))*((1.+cos(time))*sin(time+3.1415));    
    vec2 s1 = vec2(sin(440.+fbm8(vec2(time/2.))*70.*exp(fract(time/20.)*12.))+fbm16(vec2(time)))*2.;
   // vec2 s2 = vec2(sin(440.+fbm16(vec2(time/3.))*100.*exp(fract(time/20.)*12.))+fbm8(vec2(time)))*1.;
    //s1 = smoothstep(0.5, 0., s1);
//    float x = remap(0., 1., 0., 0.5, s1.x);
   
   // float t = sin(time);
   //if (time>25.) vec2 s = mix(s1, s2, abs(time/));
   // vec2 s2 = vec2(sin(880.+fbm8(vec2(time))/10.*440.*mod(time,10.)));
    vec2 s2 = vec2(sin(220.+fbm8(vec2(time))*70.*exp(fract(time/40.)*12.))+fbm8(vec2(time)))*1.;
    //float f3 = sin(tone[i]*fract(fbm8(vec2(time)))*0.2;
    s1 = mix(s1, s2, 0.5);
    //s1 = mix(s1, vec2(s1.x, f3), 0.1);
    s1 = vec2(s1.x)*0.15;  
    
    return s1;
}
