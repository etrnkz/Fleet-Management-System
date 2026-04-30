import 'package:flutter/material.dart';

class EngineShutdownBanner extends StatefulWidget {
  final String? zoneName;
  const EngineShutdownBanner({super.key, this.zoneName});

  @override
  State<EngineShutdownBanner> createState() => _EngineShutdownBannerState();
}

class _EngineShutdownBannerState extends State<EngineShutdownBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
    _anim = Tween(begin: 0.5, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFDC2626),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          FadeTransition(
            opacity: _anim,
            child: const Icon(Icons.warning_rounded, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ENGINE SHUTDOWN — RESTRICTED ZONE',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    letterSpacing: 0.3,
                  ),
                ),
                if (widget.zoneName != null)
                  Text(
                    widget.zoneName!,
                    style: const TextStyle(color: Color(0xFFfecaca), fontSize: 12),
                  ),
                const Text(
                  'Leave this area immediately',
                  style: TextStyle(color: Color(0xFFfca5a5), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
